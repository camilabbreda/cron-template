# 🚀 cron_template

A Node.js + TypeScript project that automates scheduled tasks (CRON jobs) for invoice and notification management.  
It integrates with external APIs (Blip and Cogni) and includes utilities, services, and tests for a modular, maintainable architecture.

---

## 🧩 Project Overview

This project uses **Node.js v22+** and **TypeScript** to run scheduled background jobs via `node-cron`.  
It compiles TypeScript files in `/src` to JavaScript in `/dist` for production.

### Key Features
- 🕓 Automated daily notifications using `node-cron`
- 🧾 Invoice management and data extraction
- 🔔 Integration with Blip and Cogni APIs
- 🧪 Unit tests with Jest
- 🧰 Modular structure (services, repositories, utils, types)

---

## 📁 Project Structure
```
.
├── src/ # Source TypeScript code
│ ├── test/ # Jest test suites
│ ├── cron/ # CRON jobs (TypeScript)
│ ├── repositories/ # API repository layer
│ ├── services/ # Application logic
│ ├── types/ # Shared interfaces and types
│ └── utils/ # Utility functions (date, invoice, phone, etc.)
├── jest.config.mjs # Jest configuration
├── package.json # Project configuration and dependencies
├── tsconfig.json # TypeScript configuration
└── README.md
```
---

## ⚙️ Setup and Installation

### 1️⃣ Clone the repository
```
git clone <https://github.com/camilabbreda/cron-detronic.git>
cd cron_template
```
### 2️⃣ Install dependencies
```
npm install
```
### 3️⃣ Environment variables
Create a .env file (if needed) with your API URLs and credentials:
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
| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Run in development mode (TypeScript via ts-node) |
| `npm run build` | Compile TypeScript → JavaScript (`dist/`)        |
| `npm run lint`  | Run ESLint for code linting and style consistency|
| `npm start`     | Run compiled project (`node dist/index.js`)      |
| `npm test`      | Run Jest unit tests                              |
```
## 🕒 CRON Job

src/cron/daily-notifications.ts
Run the project in production:
```
npm run build
npm start
```

Run project in development:
```
npm run dev
```

It uses node-cron to trigger notifications daily based on defined logic.
You can adjust the schedule or add new jobs by extending this module.

## 🧪 Testing

- Run the test suite:
```
npm test
```

- Tests are located in:

src/__test__/

## 🧰 Tech Stack

- Node.js v22.20.0

- TypeScript

- Jest for testing

- Axios for HTTP requests

- node-cron for scheduling

- dotenv for environment configuration

- ESLint for code linting and style consistency

## 🧑‍💻 Development Notes

- Keep TypeScript source files in src/

- Always run npm run build before deploying

- Do not modify files in dist/ manually — they are auto-generated

## 📜 License

This project is licensed under the ISC License.

## ✨ Author

Developed by https://github.com/camilabbreda/
Feel free to contribute or report issues!


