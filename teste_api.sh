# Script final para demonstrar a funcionalidade da API via linha de comando.
#
# REQUISITO: Certifique-se de ter o 'jq' instalado.
# (Ex: sudo apt-get install jq / brew install jq)

# --- Variáveis de Configuração ---
API_URL="http://localhost:8081/api"
ADMIN_LOGIN="admin"
ADMIN_PASS="Admin@1234" # CORRIGIDO: Senha que cumpre os requisitos de validação
USER_LOGIN="user"
USER_PASS="User@1234"   # CORRIGIDO: Senha que cumpre os requisitos de validação

echo "==========================================================="
echo "PASSO 1: REGISTRANDO USUÁRIOS (ADMIN E USER)"
echo "==========================================================="
# Registrar um usuário ADMIN (tipo 1)
echo "--- Registrando Admin..."
curl -s -X POST -H "Content-Type: application/json" -d '{
  "nome": "Admin User",
  "login": "'$ADMIN_LOGIN'",
  "senha": "'$ADMIN_PASS'",
  "tipo": 1
}' $API_URL/usuarios | jq
echo "\n"

# Registrar um usuário COMUM (tipo 2)
echo "--- Registrando User..."
curl -s -X POST -H "Content-Type: application/json" -d '{
  "nome": "Common User",
  "login": "'$USER_LOGIN'",
  "senha": "'$USER_PASS'",
  "tipo": 2
}' $API_URL/usuarios | jq
echo "\n"


echo "==========================================================="
echo "PASSO 2: FAZENDO LOGIN E CAPTURANDO TOKENS"
echo "==========================================================="
# Fazer login como ADMIN e extrair o token com JQ
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "login": "'$ADMIN_LOGIN'",
  "senha": "'$ADMIN_PASS'"
}' $API_URL/auth/login)

ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | jq -r '.data.token')
echo "TOKEN ADMIN CAPTURADO: $ADMIN_TOKEN"

# Fazer login como USER e extrair o token com JQ
USER_LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "login": "'$USER_LOGIN'",
  "senha": "'$USER_PASS'"
}' $API_URL/auth/login)

USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | jq -r '.data.token')
echo "TOKEN USER CAPTURADO: $USER_TOKEN\n"


echo "==========================================================="
echo "PASSO 3: TESTANDO CRUD DE AMENITIES (SÓ ADMIN)"
echo "==========================================================="
echo "--- Tentando criar amenity como USER (deve falhar com 403)"
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{"nome": "Projetor", "descricao": "Projetor Full HD"}' $API_URL/amenities
echo "\n"

echo "--- Criando amenity como ADMIN (deve funcionar)"
AMENITY_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"nome": "Projetor 4K", "descricao": "Projetor de alta resolução"}' $API_URL/amenities | jq -r '.data.id')
echo "Amenity criada com ID: $AMENITY_ID\n"

echo "--- Listando todas amenities (autenticado)"
curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/amenities | jq
echo "\n"


echo "==========================================================="
echo "PASSO 4: TESTANDO CRUD DE ESPAÇOS E RESERVAS"
echo "==========================================================="
echo "--- Criando um espaço como ADMIN"
ESPACIO_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d '{"nome": "Sala de Reunião Principal", "capacidade": 12, "descricao": "Sala principal com vídeo conferência"}' $API_URL/espacos | jq -r '.data.id')
echo "ID DO ESPAÇO CRIADO: $ESPACIO_ID\n"

echo "--- Listando todos os espaços"
curl -s -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/espacos | jq
echo "\n"

echo "--- Criando uma reserva para o espaço como USER"
FUTURE_START_DATE=$(date -d "+1 day" -u +"%Y-%m-%dT%H:%M:%S.000Z")
FUTURE_END_DATE=$(date -d "+1 day +1 hour" -u +"%Y-%m-%dT%H:%M:%S.000Z")
curl -i -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $USER_TOKEN" -d '{
  "espacoId": '$ESPACIO_ID',
  "data_inicio": "'$FUTURE_START_DATE'",
  "data_fim": "'$FUTURE_END_DATE'"
}' $API_URL/reservas
echo "\n"

echo "--- Listando MINHAS reservas como USER"
curl -s -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/reservas | jq
echo "\n"

echo "--- Listando TODAS as reservas como ADMIN"
curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/reservas/all | jq
echo "\n"


echo "==========================================================="
echo "PASSO 5: TESTANDO ROTA DE LOGS (SÓ ADMIN)"
echo "==========================================================="
echo "--- Tentando ver logs como USER (deve falhar com 403)"
curl -i -X GET -H "Authorization: Bearer $USER_TOKEN" $API_URL/logs
echo "\n"

echo "--- Vendo logs como ADMIN (deve funcionar)"
curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $API_URL/logs | jq
echo "\n"

echo "==========================================================="
echo "DEMONSTRAÇÃO DA API CONCLUÍDA"
echo "==========================================================="
