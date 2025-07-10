const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Reservas de Espaços API',
      version: '1.0.0',
      description: 'API REST completa para gerenciamento de reservas de espaços coletivos',
      contact: {
        name: 'Gabriel Felipe Guarnieri',
        email: 'gabriel@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Servidor de desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            nome: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            login: {
              type: 'string',
              description: 'Login único do usuário'
            },
            tipo: {
              type: 'integer',
              description: 'Tipo de usuário (1: Admin, 2: Usuário comum)',
              enum: [1, 2]
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        UsuarioCreate: {
          type: 'object',
          required: ['nome', 'login', 'senha', 'tipo'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            login: {
              type: 'string',
              description: 'Login único do usuário'
            },
            senha: {
              type: 'string',
              description: 'Senha do usuário'
            },
            tipo: {
              type: 'integer',
              description: 'Tipo de usuário (1: Admin, 2: Usuário comum)',
              enum: [1, 2]
            }
          }
        },
        Espaco: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do espaço'
            },
            nome: {
              type: 'string',
              description: 'Nome do espaço'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do espaço'
            },
            capacidade: {
              type: 'integer',
              description: 'Capacidade máxima de pessoas'
            },
            localizacao: {
              type: 'string',
              description: 'Localização do espaço'
            },
            equipamentos: {
              type: 'string',
              description: 'Equipamentos disponíveis'
            },
            ativo: {
              type: 'boolean',
              description: 'Se o espaço está ativo'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        EspacoCreate: {
          type: 'object',
          required: ['nome', 'capacidade'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do espaço'
            },
            descricao: {
              type: 'string',
              description: 'Descrição do espaço'
            },
            capacidade: {
              type: 'integer',
              description: 'Capacidade máxima de pessoas'
            },
            localizacao: {
              type: 'string',
              description: 'Localização do espaço'
            },
            equipamentos: {
              type: 'string',
              description: 'Equipamentos disponíveis'
            }
          }
        },
        Reserva: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da reserva'
            },
            titulo: {
              type: 'string',
              description: 'Título da reserva'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da reserva'
            },
            dataInicio: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de início'
            },
            dataFim: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de fim'
            },
            status: {
              type: 'string',
              enum: ['pendente', 'confirmada', 'cancelada'],
              description: 'Status da reserva'
            },
            usuarioId: {
              type: 'integer',
              description: 'ID do usuário que fez a reserva'
            },
            espacoId: {
              type: 'integer',
              description: 'ID do espaço reservado'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        ReservaCreate: {
          type: 'object',
          required: ['titulo', 'dataInicio', 'dataFim', 'espacoId'],
          properties: {
            titulo: {
              type: 'string',
              description: 'Título da reserva'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da reserva'
            },
            dataInicio: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de início'
            },
            dataFim: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora de fim'
            },
            espacoId: {
              type: 'integer',
              description: 'ID do espaço a ser reservado'
            }
          }
        },
        Log: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único do log'
            },
            usuarioId: {
              type: 'integer',
              description: 'ID do usuário que executou a ação'
            },
            acao: {
              type: 'string',
              description: 'Ação executada'
            },
            ip: {
              type: 'string',
              description: 'Endereço IP'
            },
            detalhes: {
              type: 'object',
              description: 'Detalhes adicionais da ação'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da ação'
            }
          }
        },
        Amenity: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único da amenidade'
            },
            nome: {
              type: 'string',
              description: 'Nome da amenidade'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da amenidade'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        AmenityCreate: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: {
              type: 'string',
              description: 'Nome da amenidade'
            },
            descricao: {
              type: 'string',
              description: 'Descrição da amenidade'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['login', 'senha'],
          properties: {
            login: {
              type: 'string',
              description: 'Login do usuário'
            },
            senha: {
              type: 'string',
              description: 'Senha do usuário'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se o login foi bem-sucedido'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticação'
            },
            user: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida'
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela API'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Operações de autenticação'
      },
      {
        name: 'Usuarios',
        description: 'Gerenciamento de usuários (Admin apenas)'
      },
      {
        name: 'Espacos',
        description: 'Gerenciamento de espaços'
      },
      {
        name: 'Reservas',
        description: 'Gerenciamento de reservas'
      },
      {
        name: 'Amenities',
        description: 'Gerenciamento de amenidades'
      },
      {
        name: 'Logs',
        description: 'Sistema de logs (Admin apenas)'
      }
    ]
  },
  apis: ['./routers/api.js', './controllers/api/*.js']
};

const specs = swaggerJSDoc(options);

module.exports = specs;