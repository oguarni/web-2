const express = require('express');
const router = express.Router();

// Import middlewares
const { validateToken, requireAdmin, requireOwnerOrAdmin } = require('../middlewares/tokenAuth');
const { 
    validateAuth, 
    validateUser, 
    validateSpace, 
    validateReservation, 
    validateLog 
} = require('../middlewares/validation');

// Import API controllers
const authController = require('../controllers/api/authController');
const usuarioController = require('../controllers/api/usuarioController');
const reservaController = require('../controllers/api/reservaController');
const espacoController = require('../controllers/api/espacoController');
const logController = require('../controllers/api/logController');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Realizar login e obter token JWT
 *     description: Autentica o usuário e retorna um token JWT para acesso às rotas protegidas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             login: "admin"
 *             senha: "1234"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: 1
 *                 nome: "Administrador"
 *                 login: "admin"
 *                 tipo: 1
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Credenciais inválidas"
 */
router.post('/auth/login', validateAuth.login, authController.login);

// Protected routes - require valid token
router.use(validateToken);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar todos os usuários
 *     description: Retorna uma lista de todos os usuários cadastrados (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 *   post:
 *     tags: [Usuarios]
 *     summary: Criar novo usuário
 *     description: Cria um novo usuário no sistema (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/usuarios', requireAdmin, usuarioController.index);
router.post('/usuarios', requireAdmin, validateUser.create, usuarioController.create);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obter usuário por ID
 *     description: Retorna os dados de um usuário específico (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 *   put:
 *     tags: [Usuarios]
 *     summary: Atualizar usuário
 *     description: Atualiza os dados de um usuário específico (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 *   delete:
 *     tags: [Usuarios]
 *     summary: Excluir usuário
 *     description: Remove um usuário do sistema (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/usuarios/:id', requireAdmin, validateUser.idParam, usuarioController.show);
router.put('/usuarios/:id', requireAdmin, validateUser.idParam, validateUser.update, usuarioController.update);
router.delete('/usuarios/:id', requireAdmin, validateUser.idParam, usuarioController.delete);

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     tags: [Reservas]
 *     summary: Listar reservas
 *     description: Retorna reservas do usuário logado ou todas as reservas (se admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reserva'
 *       401:
 *         description: Token inválido ou ausente
 *   post:
 *     tags: [Reservas]
 *     summary: Criar nova reserva
 *     description: Cria uma nova reserva de espaço
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaCreate'
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Dados inválidos ou conflito de horário
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/reservas', reservaController.index);
router.post('/reservas', validateReservation.create, reservaController.create);

/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     tags: [Reservas]
 *     summary: Obter reserva por ID
 *     description: Retorna os dados de uma reserva específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Dados da reserva retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reserva'
 *       404:
 *         description: Reserva não encontrada
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado
 *   put:
 *     tags: [Reservas]
 *     summary: Atualizar reserva
 *     description: Atualiza os dados de uma reserva específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaCreate'
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou conflito de horário
 *       404:
 *         description: Reserva não encontrada
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado
 *   delete:
 *     tags: [Reservas]
 *     summary: Excluir reserva
 *     description: Remove uma reserva do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     responses:
 *       200:
 *         description: Reserva excluída com sucesso
 *       404:
 *         description: Reserva não encontrada
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado
 */
router.get('/reservas/:id', validateReservation.idParam, reservaController.show);
router.put('/reservas/:id', validateReservation.idParam, validateReservation.update, reservaController.update);
router.delete('/reservas/:id', validateReservation.idParam, reservaController.delete);

/**
 * @swagger
 * /api/reservas/{id}/status:
 *   put:
 *     tags: [Reservas]
 *     summary: Alterar status da reserva
 *     description: Atualiza o status de uma reserva (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendente, confirmada, cancelada]
 *                 description: Novo status da reserva
 *     responses:
 *       200:
 *         description: Status da reserva atualizado com sucesso
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Reserva não encontrada
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.put('/reservas/:id/status', requireAdmin, validateReservation.idParam, validateReservation.updateStatus, reservaController.updateStatus);

/**
 * @swagger
 * /api/espacos:
 *   get:
 *     tags: [Espacos]
 *     summary: Listar espaços
 *     description: Retorna uma lista de todos os espaços disponíveis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ativo
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filtrar apenas espaços ativos (true) ou inativos (false)
 *     responses:
 *       200:
 *         description: Lista de espaços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Espaco'
 *       401:
 *         description: Token inválido ou ausente
 *   post:
 *     tags: [Espacos]
 *     summary: Criar novo espaço
 *     description: Cria um novo espaço no sistema (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspacoCreate'
 *     responses:
 *       201:
 *         description: Espaço criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/espacos', validateSpace.filter, espacoController.index);
router.post('/espacos', requireAdmin, validateSpace.create, espacoController.create);

/**
 * @swagger
 * /api/espacos/{id}:
 *   get:
 *     tags: [Espacos]
 *     summary: Obter espaço por ID
 *     description: Retorna os dados de um espaço específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *     responses:
 *       200:
 *         description: Dados do espaço retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Espaco'
 *       404:
 *         description: Espaço não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *   put:
 *     tags: [Espacos]
 *     summary: Atualizar espaço
 *     description: Atualiza os dados de um espaço específico (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspacoCreate'
 *     responses:
 *       200:
 *         description: Espaço atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Espaço não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 *   delete:
 *     tags: [Espacos]
 *     summary: Excluir espaço
 *     description: Remove um espaço do sistema (apenas administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *     responses:
 *       200:
 *         description: Espaço excluído com sucesso
 *       404:
 *         description: Espaço não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Acesso negado - apenas administradores
 */
router.get('/espacos/:id', validateSpace.idParam, espacoController.show);
router.put('/espacos/:id', requireAdmin, validateSpace.idParam, validateSpace.update, espacoController.update);
router.delete('/espacos/:id', requireAdmin, validateSpace.idParam, espacoController.delete);

/**
 * @swagger
 * /api/espacos/{id}/disponibilidade:
 *   get:
 *     tags: [Espacos]
 *     summary: Verificar disponibilidade do espaço
 *     description: Verifica se um espaço está disponível em um período específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data e hora de início (ISO 8601)
 *         example: "2025-01-15T09:00:00.000Z"
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data e hora de fim (ISO 8601)
 *         example: "2025-01-15T11:00:00.000Z"
 *     responses:
 *       200:
 *         description: Informações de disponibilidade retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       description: Se o espaço está disponível no período
 *                     conflicts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           titulo:
 *                             type: string
 *                           dataInicio:
 *                             type: string
 *                             format: date-time
 *                           dataFim:
 *                             type: string
 *                             format: date-time
 *                       description: Lista de reservas que conflitam com o período
 *       400:
 *         description: Parâmetros de data inválidos
 *       404:
 *         description: Espaço não encontrado
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/espacos/:id/disponibilidade', validateSpace.idParam, validateSpace.availability, espacoController.checkAvailability);

// Log routes (admin only)
router.get('/logs', requireAdmin, validateLog.query, logController.index);
router.get('/logs/:id', requireAdmin, validateLog.idParam, logController.show);
router.post('/logs', requireAdmin, validateLog.create, logController.create);
router.get('/logs/stats', requireAdmin, validateLog.query, logController.getStats);
router.delete('/logs/cleanup', requireAdmin, validateLog.cleanup, logController.cleanup);

// API documentation route
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Reservas de Espaços - API v1.0',
        documentation: '/api/docs',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'Authenticate user and get token'
            },
            usuarios: {
                'GET /api/usuarios': 'List all users (admin only)',
                'GET /api/usuarios/:id': 'Get user by ID (admin only)',
                'POST /api/usuarios': 'Create new user (admin only)',
                'PUT /api/usuarios/:id': 'Update user (admin only)',
                'DELETE /api/usuarios/:id': 'Delete user (admin only)'
            },
            reservas: {
                'GET /api/reservas': 'List reservations (own or all if admin)',
                'GET /api/reservas/:id': 'Get reservation by ID',
                'POST /api/reservas': 'Create new reservation',
                'PUT /api/reservas/:id': 'Update reservation',
                'DELETE /api/reservas/:id': 'Delete reservation',
                'PUT /api/reservas/:id/status': 'Change reservation status (admin only)'
            },
            espacos: {
                'GET /api/espacos': 'List all spaces',
                'GET /api/espacos/:id': 'Get space by ID',
                'POST /api/espacos': 'Create new space (admin only)',
                'PUT /api/espacos/:id': 'Update space (admin only)',
                'DELETE /api/espacos/:id': 'Delete space (admin only)',
                'GET /api/espacos/:id/disponibilidade': 'Check space availability'
            },
            logs: {
                'GET /api/logs': 'List system logs (admin only)',
                'GET /api/logs/:id': 'Get log by ID (admin only)',
                'POST /api/logs': 'Create new log entry (admin only)',
                'GET /api/logs/stats': 'Get log statistics (admin only)',
                'DELETE /api/logs/cleanup': 'Clean old logs (admin only)'
            }
        }
    });
});

module.exports = router;