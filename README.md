# 🚀 cron_template

A Node.js + TypeScript project that automates scheduled tasks (CRON jobs) for invoice and notification management.  
It integrates with external APIs (Blip, Cogni, and Sankhya) to send WhatsApp payment reminders and includes comprehensive unit and integration tests.

---

## 🧩 Project Overview

This project uses **Node.js v22+** and **TypeScript** to run scheduled background jobs via `node-cron`.  
It compiles TypeScript files in `/src` to JavaScript in `/dist` for production.

### Key Features
- 🕓 **Dual CRON orchestration**: Cogni and Sankhya notification processors (Mon-Fri 3 PM)
- 🔔 **7 notification types** (NA 100-700): New clients, first invoices, due dates, overdue alerts
- 📱 **WhatsApp integration** via Blip API with template-based campaigns
- 🗄️ **Multi-source invoicing**: Support for Cogni legacy and Sankhya SQL Server APIs
- 🧪 **Comprehensive testing**: 34+ unit tests + 8 integration tests with real Blip API calls
- 🧰 **Modular 3-layer architecture**: Repositories → Services → Utils
- 🔐 **Type-safe**: Full TypeScript strict mode with ES2022 target

---

## 📁 Project Structure
```
src/
├── __test__/                    # Test suites
│   ├── api-sankhya.test.ts             # Sankhya API methods (7 endpoints)
│   ├── invoice-utils.test.ts           # Invoice utility functions (34 tests)
│   ├── notification-sankhya-service.test.ts  # Service orchestration
│   ├── send-notification/
│   │   ├── sankhya-notifications-send.test.ts  # Integration tests (real Blip)
│   │   └── README.md                   # Integration test documentation
│   └── [other test files...]
├── repositories/
│   ├── api-cogni.ts                    # Cogni API client (legacy)
│   ├── api-blip.ts                     # Blip WhatsApp API client
│   └── api-sankhya.ts                  # Sankhya SQL Server API client
├── services/
│   ├── invoice-service.ts              # Cogni invoice business logic
│   ├── notification-service.ts         # Cogni notification orchestrator
│   └── notification-sankhya-service.ts # Sankhya notification orchestrator (7 types)
├── types/
│   ├── cogni-type.ts
│   ├── sankhya-types.ts
│   ├── blip-types.ts
│   ├── notification-types.ts
│   └── error-types.ts
├── utils/
│   ├── date-utils.ts                   # Complex date math (Friday/Monday edge cases)
│   ├── invoice-utils.ts                # Google Drive link extraction + currency parsing
│   ├── phone-utils.ts                  # Phone validation
│   ├── error-handler.ts                # Standardized error handling
│   ├── notification-utils.ts
│   └── [other utilities...]
└── index.ts                            # Entry point with dual cron setup
```

---

## ⚙️ Setup and Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/camilabbreda/cron_template.git
cd cron_template
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Environment variables
Create a `.env` file with your API URLs and credentials:

```bash
# Cogni API Configuration
API_COGNI_URL=<your-cogni-api-url>
API_COGNI_KEY=<your-cogni-api-key>
API_COGNI_SECRET=<your-cogni-api-secret>

# Sankhya API Configuration
API_SANKHYA_URL=<your-sankhya-sql-server-url>
API_SANKHYA_TOKEN=<your-sankhya-token>
API_SANKHYA_APP_KEY=<your-sankhya-app-key>
API_SANKHYA_USERNAME=<your-sankhya-username>
API_SANKHYA_PASSWORD=<your-sankhya-password>

# Blip API Configuration
API_BLIP_URL=<your-blip-api-url>
API_BLIP_AUTH=<your-blip-api-auth-token>

# Blip Template Configuration (Master & Active Message)
TEMPLATE_MASTER_SATE=<master-state-id>
TEMPLATE_ACTIVE_MESSAGE_FLOWID=<active-message-flow-id>

# Blip Templates: NA 100-700 (Invoice Notification Types)
TEMPLATE_NA100_NAME=<template-name>
TEMPLATE_NA100_STATEID=<state-id>
TEMPLATE_NA200_NAME=<template-name>
TEMPLATE_NA200_STATEID=<state-id>
TEMPLATE_NA300_NAME=<template-name>
TEMPLATE_NA300_STATEID=<state-id>
TEMPLATE_NA400_NAME=<template-name>
TEMPLATE_NA400_STATEID=<state-id>
TEMPLATE_NA500_NAME=<template-name>
TEMPLATE_NA500_STATEID=<state-id>
TEMPLATE_NA600_NAME=<template-name>
TEMPLATE_NA600_STATEID=<state-id>
TEMPLATE_NA700_NAME=<template-name>
TEMPLATE_NA700_STATEID=<state-id>
```

## 🧱 Scripts
```
| Command          | Description                                       |
|------------------|---------------------------------------------------|
| `npm run dev`    | Run in development mode (TypeScript via ts-node)  |
| `npm run build`  | Compile TypeScript → JavaScript (`dist/`)         |
| `npm run lint`   | Run ESLint for code quality and consistency       |
| `npm start`      | Run compiled project (`node dist/index.js`)       |
| `npm test`       | Run all Jest unit tests                           |
```

## 🕒 CRON Jobs

The project runs **two parallel cron jobs** every Monday-Friday at **3 PM (America/Sao_Paulo timezone)**:

### 1. Cogni Notification Task (`cogniTask`)
- Orchestrator: `notification-service.ts`
- Fetches invoices from Cogni API
- Applies business logic via `invoice-service.ts`
- Sends notifications via Blip

### 2. Sankhya Notification Task (`sankhyaTask`)
- Orchestrator: `notification-sankhya-service.ts`
- **Sequential processing of 7 notification types (NA 100-700)**:
  - **NA 100**: New clients (registration today)
  - **NA 200**: First generator links (60-day mark)
  - **NA 300**: First invoices (Monday lookback)
  - **NA 400**: Invoices 5 days before due (Monday lookback)
  - **NA 500**: Invoices due today (Friday lookahead)
  - **NA 600**: Invoices 5 days overdue (Friday lookahead)
  - **NA 700**: Invoices 15 days overdue (Friday lookahead)
- Fetches data from Sankhya SQL Server API
- Validates phone numbers and sends WhatsApp notifications via Blip

**Run in production:**
```bash
npm run build
npm start
```

**Run in development:**
```bash
npm run dev
```

## 🧪 Testing

### Unit Tests
Run all unit tests:
```bash
npm test
```

### Test Coverage

#### **API Repository Tests** (`api-sankhya.test.ts`)
- Tests for 7 Sankhya API methods (NA 100-700)
- Mock axios responses
- Verify SQL query execution
- 7+ test cases

#### **Service Tests** (`notification-sankhya-service.test.ts`)
- Orchestrator logic validation
- Processor functions for NA 100-700
- Phone validation flow
- Error aggregation patterns
- 20+ test cases

#### **Utility Tests** (`invoice-utils.test.ts`)
- `obtainSankhyaNotificatioLinkComplement()`: Extract Google Drive file paths (13 tests)
- `removeTextFromValue()`: Parse currency values (19 tests)
- Real-world invoice scenarios (2 integration tests)
- **Total: 34 test cases**

#### **Integration Tests** (`send-notification/sankhya-notifications-send.test.ts`)
- **Mocked Sankhya API** + **Real Blip API calls**
- All 7 notification types (NA 100-700)
- Target phone: `5548991516758`
- All-in-one test (sends 7 notifications)
- **8 test suites** covering real-world scenarios

**Run specific test suites:**
```bash
# All invoice utility tests
npm test -- invoice-utils

# All Sankhya service tests
npm test -- notification-sankhya-service

# Integration tests with real Blip API
npm test -- send-notification/sankhya-notifications-send
```

## 📊 Architecture Patterns

### 3-Layer Architecture
1. **Repositories** (`api-*.ts`): Thin HTTP wrappers around external APIs
2. **Services** (`*-service.ts`): Business logic orchestration & validation
3. **Utils** (`*-utils.ts`): Shared helpers (date math, validation, parsing)

### Error Handling
- Standardized `ServiceError` type with context and error codes
- Centralized `handleServiceError()` for Axios and generic errors
- Error aggregation in service layers (`errorList: ServiceError[]`)
- Early continue pattern for invalid records (invalid phone, missing data)

### Performance Optimizations
- **Single-pass invoice processing**: O(n) instead of O(n×5)
- **Combined filter operations**: Reduce iteration overhead
- **Sequential notification processing**: All 7 types in one cron execution vs. 7 separate crons
- **Minimal API calls**: Pagination at highest level (notification-service loops pages)

### Date Logic
- **Monday Lookback**: NA 100, 200, 300, 400 check today + Sat/Sun before if Monday
- **Friday Lookahead**: NA 500, 600, 700 check today + Sat/Sun after if Friday
- Uses `DATENAME(WEEKDAY)` and `DATEADD()` SQL functions for Sankhya queries

## 🧰 Tech Stack

- **Runtime**: Node.js v22.20.0
- **Language**: TypeScript (ES2022, CommonJS)
- **Testing**: Jest with ts-jest
- **HTTP Client**: Axios
- **Scheduling**: node-cron
- **Config**: dotenv
- **Linting**: ESLint
- **Databases**: Cogni API, Sankhya SQL Server, Blip WhatsApp API

## 🧑‍💻 Development Notes

- Keep TypeScript source files in `src/`
- Always run `npm run build` before deploying
- Do not modify files in `dist/` manually — they are auto-generated
- Use `jest.mock()` pattern for testing (see existing tests)
- Phone validation via `validatePhone()` is a mandatory gateway
- All new services should return `ServiceError[]` for errors
- Follow existing naming conventions (kebab-case files, default exports for classes)

## 📜 License

This project is licensed under the ISC License.

## ✨ Author

Developed by [Camila Breda](https://github.com/camilabbreda)  
Feel free to contribute or report issues!


