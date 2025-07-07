# Use este script para demonstrar a funcionalidade da API via linha de comando.
# Ele irá registrar um admin, um usuário comum, fazer login com ambos para obter tokens,
# e testar os endpoints de CRUD para as entidades principais.

# Variáveis para facilitar (ajuste a porta se for diferente)
API_URL="http://localhost:8081/api"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASS="password123"
USER_EMAIL="user@example.com"
USER_PASS="password123"

echo "==========================================================="
echo "PASSO 1: REGISTRANDO USUÁRIOS (ADMIN E USER)"
echo "==========================================================="
# Registrar um usuário ADMIN
curl -X POST -H "Content-Type: application/json" -d '{
  "nome": "Admin User",
  "email": "'$ADMIN_EMAIL'",
  "senha": "'$ADMIN_PASS'",
  "perfil": "admin"
}' $API_URL/auth/register
echo "\n"

# Registrar um usuário COMUM
curl -X POST -H "Content-Type: application/json" -d '{
  "nome": "Common User",
  "email": "'$USER_EMAIL'",
  "senha": "'$USER_PASS'",
  "perfil": "user"
}' $API_URL/auth/register
echo "\n"

echo "==========================================================="
echo "PASSO 2: FAZENDO LOGIN E CAPTURANDO TOKENS"
echo "==========================================================="
# Fazer login como ADMIN e extrair o token
ADMIN_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "email": "'$ADMIN_EMAIL'",
  "senha": "'$ADMIN_PASS'"
}' $API_URL/auth/login | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "TOKEN ADMIN CAPTURADO: $ADMIN_TOKEN\n"

# Fazer login como USER e extrair o token
USER_TOKEN=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "email": "'$USER_EMAIL'",
  "senha": "'$USER_PASS'"
}' $API_URL/auth/login | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "TOKEN USER CAPTURADO: $USER_TOKEN\n"


echo "==========================================================="
echo "PASSO 3: TESTANDO CRUD DE AMENITIES (SÓ ADMIN)"
echo "==========================================================="
echo "--- Tentando criar amenity como USER (deve falhar com 403)"
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"nome": "Projetor", "descricao": "Projetor Full HD"}' $API_URL/amenities
echo "\n"

echo "--- Criando amenity como ADMIN (deve funcionar)"
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"nome": "Projetor 4K", "descricao": "Projetor de alta resolução"}' $API_URL/amenities
echo "\n"

echo "--- Listando todas amenities (autenticado)"
curl -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/amenities
echo "\n"


echo "==========================================================="
echo "PASSO 4: TESTANDO CRUD DE ESPAÇOS E RESERVAS"
echo "==========================================================="
echo "--- Criando um espaço como ADMIN"
ESPACIO_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"nome": "Sala de Reunião Principal", "capacidade": 12, "descricao": "Sala principal com vídeo conferência"}' $API_URL/espacos | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "ID DO ESPAÇO CRIADO: $ESPACIO_ID\n"

echo "--- Listando todos os espaços"
curl -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/espacos
echo "\n"

echo "--- Criando uma reserva para o espaço como USER"
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{
  "espaco_id": '$ESPACIO_ID',
  "data_inicio": "2025-10-20T14:00:00.000Z",
  "data_fim": "2025-10-20T15:00:00.000Z"
}' $API_URL/reservas
echo "\n"

echo "--- Listando MINHAS reservas como USER"
curl -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/reservas
echo "\n"

echo "--- Listando TODAS as reservas como ADMIN"
curl -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/reservas/all
echo "\n"

echo "==========================================================="
echo "PASSO 5: TESTANDO ROTA DE LOGS (SÓ ADMIN)"
echo "==========================================================="
echo "--- Tentando ver logs como USER (deve falhar com 403)"
curl -i -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/logs
echo "\n"

echo "--- Vendo logs como ADMIN (deve funcionar)"
curl -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/logs
echo "\n"

echo "==========================================================="
echo "DEMONSTRAÇÃO DA API CONCLUÍDA"
echo "==========================================================="


