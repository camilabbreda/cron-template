# 🚀 cron_template

Projeto em Node.js + TypeScript que automatiza tarefas agendadas (CRON jobs) para gerenciamento de faturas e notificações.  
Integra-se com APIs externas (Blip, Cogni e Sankhya) para enviar lembretes de pagamento por WhatsApp e inclui testes unitários e de integração abrangentes.

---

## 🧩 Visão Geral do Projeto

Este projeto utiliza **Node.js v22+** e **TypeScript** para executar tarefas em segundo plano via `node-cron`.  
Os arquivos TypeScript em `/src` são compilados para JavaScript em `/dist` para produção.

### Principais Funcionalidades
- 🕓 **Orquestração dual de CRON**: Processadores de notificações Cogni e Sankhya (Seg-Sex 15h)
- 🔔 **7 tipos de notificações** (NA 100-700): Novos clientes, primeiras faturas, datas de vencimento, alertas de atraso
- 📱 **Integração WhatsApp** via Blip API com campanhas baseadas em templates
- 🗄️ **Multi-fonte de faturas**: Suporte para API legada Cogni e Sankhya SQL Server
- 🧪 **Testes abrangentes**: 34+ testes unitários + 8 testes de integração com chamadas reais à API Blip
- 🧰 **Arquitetura modular em 3 camadas**: Repositories → Services → Utils
- 🔐 **Type-safe**: TypeScript em modo strict com alvo ES2022

---

## 📁 Estrutura do Projeto

```
src/
├── __test__/                    # Suítes de testes
│   ├── api-sankhya.test.ts             # Métodos Sankhya API (7 endpoints)
│   ├── invoice-utils.test.ts           # Funções utilitárias (34 testes)
│   ├── notification-sankhya-service.test.ts  # Orquestração de serviço
│   ├── send-notification/
│   │   ├── sankhya-notifications-send.test.ts  # Testes de integração (Blip real)
│   │   └── README.md                   # Documentação de testes integrados
│   └── [outros arquivos de teste...]
├── repositories/
│   ├── api-cogni.ts                    # Cliente API Cogni (legado)
│   ├── api-blip.ts                     # Cliente API WhatsApp Blip
│   └── api-sankhya.ts                  # Cliente API Sankhya SQL Server
├── services/
│   ├── invoice-service.ts              # Lógica de negócios Cogni
│   ├── notification-service.ts         # Orquestrador de notificações Cogni
│   └── notification-sankhya-service.ts # Orquestrador de notificações Sankhya (7 tipos)
├── types/
│   ├── cogni-type.ts
│   ├── sankhya-types.ts
│   ├── blip-types.ts
│   ├── notification-types.ts
│   └── error-types.ts
├── utils/
│   ├── date-utils.ts                   # Matemática de data complexa (casos extremos)
│   ├── invoice-utils.ts                # Extração de link Google Drive + parsing de moeda
│   ├── phone-utils.ts                  # Validação de telefone
│   ├── error-handler.ts                # Tratamento de erros padronizado
│   ├── notification-utils.ts
│   └── [outros utilitários...]
└── index.ts                            # Ponto de entrada com setup dual de cron
```

---

## ⚙️ Configuração e Instalação

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/camilabbreda/cron_template.git
cd cron_template
```

### 2️⃣ Instalar dependências
```bash
npm install
```

### 3️⃣ Variáveis de ambiente
Crie um arquivo `.env` com suas URLs de API e credenciais:

```bash
# Configuração API Cogni
API_COGNI_URL=<sua-url-api-cogni>
API_COGNI_KEY=<sua-chave-api-cogni>
API_COGNI_SECRET=<seu-secret-api-cogni>

# Configuração API Sankhya
API_SANKHYA_URL=<sua-url-sql-server-sankhya>
API_SANKHYA_TOKEN=<seu-token-sankhya>
API_SANKHYA_APP_KEY=<sua-chave-app-sankhya>
API_SANKHYA_USERNAME=<seu-usuario-sankhya>
API_SANKHYA_PASSWORD=<sua-senha-sankhya>

# Configuração API Blip
API_BLIP_URL=<sua-url-api-blip>
API_BLIP_AUTH=<seu-token-autenticacao-blip>

# Configuração Templates Blip (Mensagem Ativa & Master)
TEMPLATE_MASTER_SATE=<id-master-state>
TEMPLATE_ACTIVE_MESSAGE_FLOWID=<id-fluxo-mensagem-ativa>

# Templates Blip: NA 100-700 (Tipos de Notificação de Fatura)
TEMPLATE_NA100_NAME=<nome-template>
TEMPLATE_NA100_STATEID=<id-state>
TEMPLATE_NA200_NAME=<nome-template>
TEMPLATE_NA200_STATEID=<id-state>
TEMPLATE_NA300_NAME=<nome-template>
TEMPLATE_NA300_STATEID=<id-state>
TEMPLATE_NA400_NAME=<nome-template>
TEMPLATE_NA400_STATEID=<id-state>
TEMPLATE_NA500_NAME=<nome-template>
TEMPLATE_NA500_STATEID=<id-state>
TEMPLATE_NA600_NAME=<nome-template>
TEMPLATE_NA600_STATEID=<id-state>
TEMPLATE_NA700_NAME=<nome-template>
TEMPLATE_NA700_STATEID=<id-state>
```

## 🧱 Scripts

```
| Comando          | Descrição                                           |
|------------------|-----------------------------------------------------|
| `npm run dev`    | Executa em modo desenvolvimento (TypeScript/ts-node)|
| `npm run build`  | Compila TypeScript → JavaScript (`dist/`)           |
| `npm run lint`   | Executa ESLint para qualidade de código             |
| `npm start`      | Executa projeto compilado (`node dist/index.js`)    |
| `npm test`       | Executa todos os testes Jest unitários              |
```

## 🕒 CRON Jobs

O projeto executa **dois cron jobs paralelos** toda **segunda a sexta às 15h (fuso horário America/Sao_Paulo)**:

### 1. Tarefa de Notificação Cogni (`cogniTask`)
- Orquestrador: `notification-service.ts`
- Busca faturas da API Cogni
- Aplica lógica de negócios via `invoice-service.ts`
- Envia notificações via Blip

### 2. Tarefa de Notificação Sankhya (`sankhyaTask`)
- Orquestrador: `notification-sankhya-service.ts`
- **Processamento sequencial de 7 tipos de notificação (NA 100-700)**:
  - **NA 100**: Novos clientes (cadastro hoje)
  - **NA 200**: Primeiros links de gerador (marca de 60 dias)
  - **NA 300**: Primeiras faturas (lookback segunda)
  - **NA 400**: Faturas 5 dias antes do vencimento (lookback segunda)
  - **NA 500**: Faturas vencendo hoje (lookahead sexta)
  - **NA 600**: Faturas 5 dias em atraso (lookahead sexta)
  - **NA 700**: Faturas 15 dias em atraso (lookahead sexta)
- Busca dados da API Sankhya SQL Server
- Valida números de telefone e envia notificações WhatsApp via Blip

**Executar em produção:**
```bash
npm run build
npm start
```

**Executar em desenvolvimento:**
```bash
npm run dev
```

## 🧪 Testes

### Testes Unitários
Executar todos os testes unitários:
```bash
npm test
```

### Cobertura de Testes

#### **Testes de Repositório de API** (`api-sankhya.test.ts`)
- Testes para 7 métodos Sankhya API (NA 100-700)
- Mock de respostas axios
- Verificação de execução de queries SQL
- 7+ casos de teste

#### **Testes de Serviço** (`notification-sankhya-service.test.ts`)
- Validação de lógica do orquestrador
- Funções de processamento NA 100-700
- Fluxo de validação de telefone
- Padrões de agregação de erros
- 20+ casos de teste

#### **Testes de Utilitários** (`invoice-utils.test.ts`)
- `obtainSankhyaNotificatioLinkComplement()`: Extrar caminhos de arquivo Google Drive (13 testes)
- `removeTextFromValue()`: Parsing de valores de moeda (19 testes)
- Cenários de fatura do mundo real (2 testes de integração)
- **Total: 34 casos de teste**

#### **Testes de Integração** (`send-notification/sankhya-notifications-send.test.ts`)
- **API Sankhya mockada** + **Chamadas reais da API Blip**
- Todos os 7 tipos de notificação (NA 100-700)
- Telefone de teste: `5548991516758`
- Teste tudo-em-um (envia 7 notificações)
- **8 suítes de teste** cobrindo cenários do mundo real

**Executar suítes de teste específicas:**
```bash
# Todos os testes de utilitários de fatura
npm test -- invoice-utils

# Todos os testes de serviço Sankhya
npm test -- notification-sankhya-service

# Testes de integração com API Blip real
npm test -- send-notification/sankhya-notifications-send
```

## 📊 Padrões de Arquitetura

### Arquitetura em 3 Camadas
1. **Repositories** (`api-*.ts`): Wrappers HTTP finos em torno de APIs externas
2. **Services** (`*-service.ts`): Orquestração de lógica de negócios e validação
3. **Utils** (`*-utils.ts`): Auxiliares compartilhados (matemática de data, validação, parsing)

### Tratamento de Erros
- Tipo `ServiceError` padronizado com contexto e códigos de erro
- `handleServiceError()` centralizado para erros Axios e genéricos
- Agregação de erros em camadas de serviço (`errorList: ServiceError[]`)
- Padrão early continue para registros inválidos (telefone inválido, dados faltantes)

### Otimizações de Performance
- **Processamento de fatura em passe único**: O(n) em vez de O(n×5)
- **Operações de filtro combinadas**: Reduz overhead de iteração
- **Processamento sequencial de notificações**: Todos os 7 tipos em uma execução cron vs. 7 crons separados
- **Chamadas mínimas de API**: Paginação no nível mais alto (notification-service percorre páginas)

### Lógica de Data
- **Lookback Segunda**: NA 100, 200, 300, 400 verificam hoje + Sab/Dom antes se segunda
- **Lookahead Sexta**: NA 500, 600, 700 verificam hoje + Sab/Dom depois se sexta
- Usa funções SQL `DATENAME(WEEKDAY)` e `DATEADD()` para queries Sankhya

## 🧰 Stack Tecnológico

- **Runtime**: Node.js v22.20.0
- **Linguagem**: TypeScript (ES2022, CommonJS)
- **Testes**: Jest com ts-jest
- **Cliente HTTP**: Axios
- **Agendamento**: node-cron
- **Configuração**: dotenv
- **Linting**: ESLint
- **Bancos de Dados**: API Cogni, SQL Server Sankhya, API WhatsApp Blip

## 🧑‍💻 Notas de Desenvolvimento

- Mantenha arquivos TypeScript em `src/`
- Sempre execute `npm run build` antes de fazer deploy
- Não modifique arquivos em `dist/` manualmente — eles são gerados automaticamente
- Use padrão `jest.mock()` para testes (veja testes existentes)
- Validação de telefone via `validatePhone()` é uma porta obrigatória
- Todos os novos serviços devem retornar `ServiceError[]` para erros
- Siga convenções de nomenclatura existentes (arquivos kebab-case, default exports para classes)

## 📜 Licença

Este projeto está licenciado sob a ISC License.

## ✨ Autor

Desenvolvido por [Camila Breda](https://github.com/camilabbreda)  
Sinta-se à vontade para contribuir ou reportar problemas!
