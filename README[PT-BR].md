# 🚀 cron_template

Projeto em Node.js + TypeScript que automatiza tarefas agendadas (CRON jobs) para gerenciamento de faturas e notificações.  
Integra-se com APIs externas (Blip e Cogni) e inclui utilitários, serviços e testes para uma arquitetura modular e de fácil manutenção.

---

## 🧩 Visão Geral do Projeto

Este projeto utiliza **Node.js v22+** e **TypeScript** para executar tarefas em segundo plano via `node-cron`.  
Os arquivos TypeScript em `/src` são compilados para JavaScript em `/dist` para produção.

### Principais Funcionalidades
- 🕓 Notificações diárias automáticas usando `node-cron`
- 🧾 Gerenciamento de faturas e extração de dados
- 🔔 Integração com APIs Blip e Cogni
- 🧪 Testes unitários com Jest
- 🧰 Estrutura modular (services, repositories, utils, types)

---

## 📁 Estrutura do Projeto

```
├── src/ # Código-fonte em TypeScript
│ ├── test/ # Testes Jest
│ ├── cron/ # CRON jobs (TypeScript)
│ ├── repositories/ # Repositórios de API
│ ├── services/ # Lógica da aplicação
│ ├── types/ # Interfaces e tipos compartilhados
│ └── utils/ # Funções utilitárias (date, invoice, phone, etc.)
├── jest.config.mjs # Configuração do Jest
├── package.json # Dependências e configuração do projeto
├── tsconfig.json # Configuração do TypeScript
└── README.md
```


---

## ⚙️ Configuração e Instalação

### 1️⃣ Clonar o repositório
```
git clone <https://github.com/camilabbreda/cron-detronic.git>
cd cron_template
```
### 2️⃣ Instalar dependências
```
npm install
```
### 3️⃣ Variáveis de ambiente

Crie um arquivo .env (se necessário) com suas URLs e credenciais de API:
```
# -----------------------------
# Cogni API Configuration
# -----------------------------
API_COGNI_URL=<your-cogni-api-url>
API_COGNI_KEY=<your-cogni-api-key>
API_COGNI_SECRET=<your-cogni-api-secret>

# -----------------------------
# Blip API Configuration
# -----------------------------
API_BLIP_URL=<your-blip-api-url>
API_BLIP_AUTH=<your-blip-api-auth-token>

# -----------------------------
# Blip Message Templates
# -----------------------------
TEMPLATE_MASTER_STATE=<master-state-template>
TEMPLATE_ACTIVE_MESSAGE_FLOWID=<active-message-flow-id>
TEMPLATE_NA100_NAME=<na100-template-name>
TEMPLATE_NA100_STATEID=<na100-state-id>
TEMPLATE_NA200_NAME=<na200-template-name>
TEMPLATE_NA200_STATEID=<na200-state-id>
TEMPLATE_NA300_NAME=<na300-template-name>
TEMPLATE_NA300_STATEID=<na300-state-id>
TEMPLATE_NA400_NAME=<na400-template-name>
TEMPLATE_NA400_STATEID=<na400-state-id>
TEMPLATE_NA500_NAME=<na500-template-name>
TEMPLATE_NA500_STATEID=<na500-state-id>
TEMPLATE_NA600_NAME=<na600-template-name>
TEMPLATE_NA600_STATEID=<na600-state-id>
TEMPLATE_NA700_NAME=<na700-template-name>
TEMPLATE_NA700_STATEID=<na700-state-id>
```
## 🧱 Scripts

```
| Comando         | Descrição                                                |
| --------------- | -------------------------------------------------------- |
| `npm run dev`   | Executa em modo desenvolvimento (TypeScript via ts-node) |
| `npm run build` | Compila TypeScript → JavaScript (`dist/`)                |
| `npm start`     | Executa o projeto compilado (`node dist/index.js`)       |
| `npm test`      | Executa os testes unitários com Jest                     |
```

## 🕒 CRON Job

O job agendado está em:

src/cron/daily-notifications.ts

Execute os projeto em produção:
```
npm run build
npm start
```
Execute os projeto em desenvolvimento:
```
npm run dev
```

Ele usa node-cron para disparar notificações diariamente conforme a lógica definida.
É possível ajustar o cronograma ou adicionar novos jobs estendendo este módulo.


## 🧪 Testes

Execute os testes:
```
npm test
```
- Os testes estão localizados em:

src/__test__/


## 🧰 Tecnologias
Node.js v22.20.0

- TypeScript

- Jest para testes

- Axios para requisições HTTP

- node-cron para agendamento

- dotenv para configuração de variáveis de ambiente

## 🧑‍💻 Notas de Desenvolvimento

- Mantenha os arquivos TypeScript em src/

- Sempre execute npm run build antes de deploy

- Não modifique arquivos em dist/ manualmente — eles são gerados automaticamente

## 📜 Licença

Este projeto está licenciado sob a ISC License.

## ✨ Autor

Desenvolvido por https://github.com/camilabbreda/
Sinta-se à vontade para contribuir ou reportar problemas!