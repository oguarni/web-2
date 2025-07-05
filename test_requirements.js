const db = require('./config/db_sequelize');
const { connectDB } = require('./config/db_mongoose');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Cores para o console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✓ ${message}`, colors.green);
}

function error(message) {
    log(`✗ ${message}`, colors.red);
}

function info(message) {
    log(`ℹ ${message}`, colors.blue);
}

function warn(message) {
    log(`⚠ ${message}`, colors.yellow);
}

// Função para testar requisitos
async function testRequirements() {
    let passedTests = 0;
    let totalTests = 0;
    
    try {
        log('\n=== TESTE DE REQUISITOS DO SISTEMA ===\n', colors.blue);
        
        // 1. Testar conexão com PostgreSQL
        totalTests++;
        info('1. Testando conexão com PostgreSQL...');
        try {
            await db.sequelize.authenticate();
            success('Conexão com PostgreSQL estabelecida');
            passedTests++;
        } catch (err) {
            error(`Falha na conexão com PostgreSQL: ${err.message}`);
        }
        
        // 2. Testar conexão com MongoDB
        totalTests++;
        info('2. Testando conexão com MongoDB...');
        try {
            await connectDB();
            success('Conexão com MongoDB estabelecida');
            passedTests++;
        } catch (err) {
            error(`Falha na conexão com MongoDB: ${err.message}`);
        }
        
        // 3. Verificar se todas as tabelas existem
        totalTests++;
        info('3. Verificando existência das tabelas...');
        try {
            const [results] = await db.sequelize.query(`
                SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name IN ('usuarios', 'espacos', 'reservas', 'amenities', 'espaco_amenities')
            `);
            const tableCount = parseInt(results[0].count);
            if (tableCount >= 5) {
                success(`Todas as ${tableCount} tabelas principais existem`);
                passedTests++;
            } else {
                error(`Apenas ${tableCount} de 5 tabelas encontradas`);
            }
        } catch (err) {
            error(`Erro ao verificar tabelas: ${err.message}`);
        }
        
        // 4. Verificar se os modelos estão funcionando
        totalTests++;
        info('4. Testando modelos de dados...');
        try {
            const usuarioCount = await db.Usuario.count();
            const espacoCount = await db.Espaco.count();
            const reservaCount = await db.Reserva.count();
            const amenityCount = await db.Amenity.count();
            const espacoAmenityCount = await db.EspacoAmenity.count();
            
            success(`Usuários: ${usuarioCount}, Espaços: ${espacoCount}, Reservas: ${reservaCount}, Amenidades: ${amenityCount}, Espaço-Amenidades: ${espacoAmenityCount}`);
            passedTests++;
        } catch (err) {
            error(`Erro ao testar modelos: ${err.message}`);
        }
        
        // 5. Verificar usuários padrão
        totalTests++;
        info('5. Verificando usuários padrão...');
        try {
            const admin = await db.Usuario.findOne({ where: { login: 'admin' } });
            const usuario = await db.Usuario.findOne({ where: { login: 'usuario' } });
            const gestor = await db.Usuario.findOne({ where: { login: 'gestor' } });
            
            if (admin && usuario && gestor) {
                success('Todos os usuários padrão (admin, usuario, gestor) existem');
                passedTests++;
            } else {
                error('Nem todos os usuários padrão foram encontrados');
            }
        } catch (err) {
            error(`Erro ao verificar usuários padrão: ${err.message}`);
        }
        
        // 6. Verificar relacionamentos N:N
        totalTests++;
        info('6. Testando relacionamento N:N Espaco-Amenity...');
        try {
            const espaco = await db.Espaco.findOne({ include: db.Amenity });
            const amenity = await db.Amenity.findOne({ include: db.Espaco });
            
            if (espaco && amenity) {
                success('Relacionamento N:N Espaco-Amenity funciona corretamente');
                passedTests++;
            } else {
                warn('Relacionamento N:N funciona, mas não há dados associados');
                passedTests++;
            }
        } catch (err) {
            error(`Erro ao testar relacionamento N:N: ${err.message}`);
        }
        
        // 7. Verificar tipos de usuário
        totalTests++;
        info('7. Verificando tipos de usuário...');
        try {
            const adminUser = await db.Usuario.findOne({ where: { tipo: 1 } });
            const commonUser = await db.Usuario.findOne({ where: { tipo: 2 } });
            const gestorUser = await db.Usuario.findOne({ where: { tipo: 3 } });
            
            if (adminUser && commonUser && gestorUser) {
                success('Todos os tipos de usuário (1=Admin, 2=Comum, 3=Gestor) existem');
                passedTests++;
            } else {
                error('Nem todos os tipos de usuário foram encontrados');
            }
        } catch (err) {
            error(`Erro ao verificar tipos de usuário: ${err.message}`);
        }
        
        // 8. Verificar criptografia de senhas
        totalTests++;
        info('8. Verificando criptografia de senhas...');
        try {
            const usuario = await db.Usuario.findOne({ where: { login: 'admin' } });
            if (usuario && usuario.senha && usuario.senha.length >= 50) {
                success('Senhas estão criptografadas corretamente');
                passedTests++;
            } else {
                error('Senhas não estão criptografadas');
            }
        } catch (err) {
            error(`Erro ao verificar criptografia: ${err.message}`);
        }
        
        // 9. Verificar estrutura de logs no MongoDB
        totalTests++;
        info('9. Verificando estrutura de logs no MongoDB...');
        try {
            const LogModel = require('./models/noSql/log');
            const logCount = await LogModel.countDocuments();
            success(`Modelo de logs MongoDB funciona. Logs encontrados: ${logCount}`);
            passedTests++;
        } catch (err) {
            error(`Erro ao verificar logs MongoDB: ${err.message}`);
        }
        
        // 10. Verificar contagem de colunas
        totalTests++;
        info('10. Verificando contagem total de colunas...');
        try {
            const [results] = await db.sequelize.query(`
                SELECT COUNT(*) as total_columns FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name IN ('usuarios', 'espacos', 'reservas', 'amenities', 'espaco_amenities')
            `);
            const columnCount = parseInt(results[0].total_columns);
            if (columnCount >= 20) {
                success(`Total de colunas: ${columnCount} (≥ 20 conforme requisito)`);
                passedTests++;
            } else {
                error(`Total de colunas: ${columnCount} (< 20 requisito não atendido)`);
            }
        } catch (err) {
            error(`Erro ao contar colunas: ${err.message}`);
        }
        
        // Resumo dos testes
        log('\n=== RESUMO DOS TESTES ===\n', colors.blue);
        log(`Testes executados: ${totalTests}`, colors.blue);
        log(`Testes aprovados: ${passedTests}`, colors.green);
        log(`Testes falharam: ${totalTests - passedTests}`, colors.red);
        log(`Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`, colors.blue);
        
        if (passedTests === totalTests) {
            log('\n🎉 TODOS OS REQUISITOS FORAM ATENDIDOS! 🎉\n', colors.green);
        } else if (passedTests >= totalTests * 0.8) {
            log('\n⚠️  MAIORIA DOS REQUISITOS ATENDIDOS ⚠️\n', colors.yellow);
        } else {
            log('\n❌ MUITOS REQUISITOS NÃO ATENDIDOS ❌\n', colors.red);
        }
        
    } catch (error) {
        error(`Erro geral nos testes: ${error.message}`);
    } finally {
        // Fechar conexões
        try {
            await db.sequelize.close();
            await mongoose.connection.close();
            process.exit(0);
        } catch (err) {
            console.error('Erro ao fechar conexões:', err);
            process.exit(1);
        }
    }
}

// Executar testes
testRequirements().catch(console.error);