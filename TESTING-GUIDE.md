# Sistema de Reservas - Guia de Testes

## Visão Geral
Este documento fornece checklists detalhados para testar todas as funcionalidades do sistema de reservas de espaços, incluindo testes de navegação baseada em roles e operações CRUD.

## Configuração de Teste

### Usuários de Teste
Crie os seguintes usuários para testing:

**Admin User:**
- Email: admin@test.com
- Password: admin123
- Role: admin

**Standard User:**
- Email: user@test.com  
- Password: user123
- Role: user

**Gestor User:**
- Email: gestor@test.com
- Password: gestor123
- Role: gestor

## 1. Testes de Navegação Baseada em Roles

### 1.1 Teste de Admin User
**Objetivo:** Verificar que admin tem acesso completo ao sistema

**Passos:**
1. Faça login como admin@test.com
2. Verifique que o menu de navegação mostra:
   - Dashboard
   - Spaces
   - My Reservations
   - Users (admin only)
   - Amenities (admin only)
3. Teste acesso direto às URLs:
   - `/` (Dashboard) - ✅ Deve carregar
   - `/spaces` - ✅ Deve carregar
   - `/reservations` - ✅ Deve carregar
   - `/users` - ✅ Deve carregar
   - `/amenities` - ✅ Deve carregar
4. Verifique que pode ver todos os dados (reservas de todos os usuários, etc.)
5. Faça logout

### 1.2 Teste de Standard User
**Objetivo:** Verificar que usuário padrão tem acesso limitado

**Passos:**
1. Faça login como user@test.com
2. Verifique que o menu de navegação mostra apenas:
   - Dashboard
   - Spaces
   - My Reservations
   - (Users e Amenities NÃO devem aparecer)
3. Teste acesso direto às URLs:
   - `/` (Dashboard) - ✅ Deve carregar
   - `/spaces` - ✅ Deve carregar (view only)
   - `/reservations` - ✅ Deve carregar (suas reservas apenas)
   - `/users` - ❌ Deve mostrar "não autorizado"
   - `/amenities` - ❌ Deve mostrar "não autorizado"
4. Na página de reservas, verifique que só vê suas próprias reservas
5. Faça logout

### 1.3 Teste de Gestor User
**Objetivo:** Verificar que gestor tem acesso intermediário

**Passos:**
1. Faça login como gestor@test.com
2. Verifique que o menu de navegação mostra:
   - Dashboard
   - Spaces
   - My Reservations
   - Amenities (gestor tem acesso)
   - (Users NÃO deve aparecer)
3. Teste acesso direto às URLs:
   - `/` (Dashboard) - ✅ Deve carregar
   - `/spaces` - ✅ Deve carregar
   - `/reservations` - ✅ Deve carregar
   - `/users` - ❌ Deve mostrar "não autorizado"
   - `/amenities` - ✅ Deve carregar
4. Faça logout

## 2. Testes de CRUD por Recurso

### 2.1 Spaces (Espaços)
**Usuário:** Admin

**Create (Criar):**
1. Navegue para `/spaces`
2. Clique em "Novo Espaço"
3. Preencha o formulário:
   - Nome: "Sala de Reunião A"
   - Localização: "Prédio 1, Andar 2"
   - Capacidade: 10
   - Descrição: "Sala equipada com projetor"
   - Equipamentos: "Projetor, Quadro branco"
   - Status: Ativo
4. Clique em "Criar"
5. ✅ Verifique que o espaço aparece na lista

**Read (Ler):**
1. Verifique que o espaço criado aparece na tabela
2. Verifique que todos os dados estão corretos
3. ✅ Confirme que espaços ativos são visíveis para usuários padrão

**Update (Atualizar):**
1. Clique em "Editar" no espaço criado
2. Altere a capacidade para 15
3. Clique em "Atualizar"
4. ✅ Verifique que a mudança foi aplicada

**Delete (Excluir):**
1. Clique em "Excluir" no espaço criado
2. Confirme a exclusão
3. ✅ Verifique que o espaço foi removido da lista

**Teste de Validação:**
1. Tente criar um espaço sem nome
2. ✅ Deve mostrar erro de validação
3. Tente criar um espaço com capacidade 0
4. ✅ Deve mostrar erro de validação

### 2.2 Amenities (Amenidades)
**Usuário:** Admin ou Gestor

**Create (Criar):**
1. Navegue para `/amenities`
2. Clique em "Nova Amenidade"
3. Preencha:
   - Nome: "Wi-Fi"
   - Descrição: "Internet sem fio de alta velocidade"
4. Clique em "Criar"
5. ✅ Verifique que a amenidade aparece na lista

**Read (Ler):**
1. Verifique que a amenidade criada aparece na tabela
2. ✅ Confirme que todos os dados estão corretos

**Update (Atualizar):**
1. Clique em "Editar" na amenidade
2. Altere a descrição para "Internet sem fio gigabit"
3. Clique em "Atualizar"
4. ✅ Verifique que a mudança foi aplicada

**Delete (Excluir):**
1. Clique em "Excluir" na amenidade
2. Confirme a exclusão
3. ✅ Verifique que a amenidade foi removida

**Teste de Validação:**
1. Tente criar uma amenidade sem nome
2. ✅ Deve mostrar erro de validação

### 2.3 Reservations (Reservas)
**Usuário:** Qualquer usuário autenticado

**Create (Criar):**
1. Navegue para `/reservations`
2. Clique em "Nova Reserva"
3. Preencha:
   - Título: "Reunião de Equipe"
   - Espaço: Selecione um espaço ativo
   - Data/Hora Início: Amanhã às 9:00
   - Data/Hora Fim: Amanhã às 10:00
   - Descrição: "Reunião semanal"
4. Clique em "Criar"
5. ✅ Verifique que a reserva aparece na lista

**Read (Ler):**
1. Verifique que a reserva criada aparece na tabela
2. ✅ Confirme que todos os dados estão corretos
3. **Como usuário padrão:** Verifique que só vê suas próprias reservas
4. **Como admin:** Verifique que vê todas as reservas

**Update (Atualizar):**
1. Clique em "Editar" na reserva
2. Altere o título para "Reunião de Equipe - Atualizada"
3. Clique em "Atualizar"
4. ✅ Verifique que a mudança foi aplicada

**Delete (Excluir):**
1. Clique em "Excluir" na reserva
2. Confirme a exclusão
3. ✅ Verifique que a reserva foi removida

**Testes de Validação:**
1. Tente criar uma reserva no passado
2. ✅ Deve mostrar erro: "A data de início deve ser no futuro"
3. Tente criar uma reserva com data fim antes da data início
4. ✅ Deve mostrar erro: "A data de fim deve ser posterior à data de início"
5. Tente criar uma reserva sem selecionar espaço
6. ✅ Deve mostrar erro de campo obrigatório

### 2.4 Users (Usuários)
**Usuário:** Admin apenas

**Create (Criar):**
1. Navegue para `/users`
2. Clique em "Novo Usuário"
3. Preencha:
   - Nome: "João Silva"
   - Email: "joao@test.com"
   - Senha: "senha123"
   - Tipo: "user"
4. Clique em "Criar"
5. ✅ Verifique que o usuário aparece na lista

**Read (Ler):**
1. Verifique que o usuário criado aparece na tabela
2. ✅ Confirme que todos os dados estão corretos

**Update (Atualizar):**
1. Clique em "Editar" no usuário
2. Altere o nome para "João Silva Santos"
3. Deixe a senha em branco (não alterar)
4. Clique em "Salvar Alterações"
5. ✅ Verifique que a mudança foi aplicada

**Delete (Excluir):**
1. Clique em "Excluir" no usuário criado
2. Confirme a exclusão
3. ✅ Verifique que o usuário foi removido

**Testes de Validação:**
1. Tente criar um usuário sem nome
2. ✅ Deve mostrar erro de validação
3. Tente criar um usuário sem email
4. ✅ Deve mostrar erro de validação
5. Tente criar um usuário com senha menor que 6 caracteres
6. ✅ Deve mostrar erro: "Senha deve ter pelo menos 6 caracteres"

## 3. Testes de Validação de Servidor

### 3.1 Teste de Integridade Referencial
**Objetivo:** Verificar que as validações de servidor impedem exclusões problemáticas

**Teste 1: Exclusão de Espaço com Reservas Futuras**
1. Crie um espaço
2. Crie uma reserva futura para este espaço
3. Tente excluir o espaço
4. ✅ Deve falhar com erro: "Cannot delete space: It has X upcoming reservation(s)"

**Teste 2: Exclusão de Amenidade Associada**
1. Crie uma amenidade
2. Associe a amenidade a um espaço
3. Tente excluir a amenidade
4. ✅ Deve falhar com erro: "Cannot delete amenity: It is currently associated with X space(s)"

**Teste 3: Exclusão de Usuário com Reservas**
1. Crie um usuário
2. Crie uma reserva para este usuário
3. Tente excluir o usuário
4. ✅ Deve falhar devido à constraint de banco de dados

### 3.2 Teste de Validação de Reservas
**Objetivo:** Verificar validação de sobreposição de reservas

**Teste de Sobreposição:**
1. Crie uma reserva: Amanhã 9:00-10:00
2. Tente criar outra reserva para o mesmo espaço: Amanhã 9:30-10:30
3. ✅ Deve falhar com erro: "The requested time slot for this space is already booked"

## 4. Testes de Fluxo de Usuário Completo

### 4.1 Fluxo de Usuário Padrão
1. Faça login como usuário padrão
2. Navegue para Spaces
3. Clique em "Reservar este Espaço" em um espaço ativo
4. Preencha o formulário de reserva
5. Submeta a reserva
6. Navegue para "My Reservations"
7. Verifique que a reserva aparece na lista
8. Edite a reserva (altere o título)
9. Exclua a reserva
10. Faça logout

### 4.2 Fluxo de Admin Completo
1. Faça login como admin
2. Crie um novo espaço
3. Crie uma nova amenidade
4. Crie um novo usuário
5. Faça login como o novo usuário
6. Crie uma reserva
7. Volte para o admin
8. Veja todas as reservas (incluindo a do novo usuário)
9. Aprove/rejeite reservas (se implementado)
10. Tente excluir o espaço com reserva (deve falhar)
11. Exclua a reserva primeiro
12. Agora exclua o espaço (deve funcionar)

## 5. Checklist de Finalização

### Funcionalidade Básica
- [ ] Login/Logout funciona corretamente
- [ ] Navegação baseada em roles funciona
- [ ] CRUD de Spaces funciona
- [ ] CRUD de Amenities funciona
- [ ] CRUD de Reservations funciona
- [ ] CRUD de Users funciona

### Validação
- [ ] Validação client-side funciona
- [ ] Validação server-side funciona
- [ ] Integridade referencial é mantida
- [ ] Não é possível excluir recursos com dependências

### Segurança
- [ ] Usuários só veem suas próprias reservas
- [ ] Páginas admin são protegidas
- [ ] URLs diretas são protegidas
- [ ] Não é possível auto-exclusão de admin

### UX/UI
- [ ] Mensagens de erro são claras
- [ ] Mensagens de sucesso são mostradas
- [ ] Loading states funcionam
- [ ] Formulários são user-friendly
- [ ] Confirmações de exclusão funcionam

### Performance
- [ ] Páginas carregam rapidamente
- [ ] Não há loops infinitos ou vazamentos de memória
- [ ] Atualizações de dados são eficientes

## Notas Importantes

1. **Execute os testes em ordem** - Alguns testes dependem de dados criados em testes anteriores
2. **Limpe os dados de teste** - Após os testes, limpe os dados de teste criados
3. **Teste em diferentes navegadores** - Verifique compatibilidade
4. **Teste responsividade** - Verifique em diferentes tamanhos de tela
5. **Documente bugs** - Anote qualquer comportamento inesperado encontrado

Este guia garante que todas as funcionalidades críticas do sistema são testadas sistematicamente, fornecendo confiança na qualidade e robustez da aplicação.