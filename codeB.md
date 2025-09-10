AI 기반 대규모 프로젝트 문서화 시스템 v1.0
📁 프로젝트 구조
project-root/
├── .ai-context/                 # AI 전용 컨텍스트
│   ├── MASTER_INDEX.md          # 전체 프로젝트 인덱스
│   ├── CURRENT_SESSION.md       # 현재 작업 세션
│   └── CONTEXT_CHAIN.md         # 컨텍스트 체인 로그
│
├── docs/
│   ├── architecture/           
│   │   ├── SYSTEM_MAP.md        # 시스템 전체 구조
│   │   ├── DATA_FLOW.md         # 데이터 흐름도
│   │   └── TECH_STACK.md        # 기술 스택 정의
│   │
│   ├── registry/                # 코드 레지스트리
│   │   ├── VARIABLES.yaml       # 전역 변수 사전
│   │   ├── FUNCTIONS.yaml       # 함수 카탈로그
│   │   ├── CLASSES.yaml         # 클래스 정의
│   │   ├── DATABASE.yaml        # DB 스키마
│   │   └── API_ENDPOINTS.yaml   # API 엔드포인트
│   │
│   ├── patterns/                # 패턴 라이브러리
│   │   ├── ERROR_PATTERNS.md    # 오류 패턴과 해결법
│   │   ├── CODE_PATTERNS.md     # 코드 패턴
│   │   └── CONVENTIONS.md       # 명명 규칙
│   │
│   └── test-specs/             # 테스트 명세
│       ├── UNIT_TESTS.md       # 단위 테스트 명세
│       └── E2E_SCENARIOS.md    # E2E 시나리오
│
└── .ai-templates/              # AI용 템플릿
    ├── FILE_TEMPLATE.md        # 파일 생성 템플릿
    └── PROMPT_TEMPLATES.md     # 프롬프트 템플릿
1️⃣ MASTER_INDEX.md - 프로젝트 전체 인덱스
markdown# 🗂️ Project Master Index
Generated: 2024-01-15 14:30 | Version: 2.1.0 | Context Length: 1,234 tokens

## 📊 Project Statistics
- Total Files: 47
- Total Lines: 3,456
- Test Coverage: 78%
- Last Major Change: User Authentication System

## 🎯 Current Sprint Focus
- [ ] Payment Integration (Stripe)
- [x] User Authentication
- [ ] Email Notifications

## 🏗️ System Components

### Core Services
| Service | Location | Status | Owner | Dependencies |
|---------|----------|--------|-------|--------------|
| AuthService | `/src/services/auth.js` | ✅ Stable | Session-23 | UserModel, JWT |
| PaymentService | `/src/services/payment.js` | 🚧 In Progress | Session-45 | Stripe, UserModel |
| EmailService | `/src/services/email.js` | 📝 Planned | - | Nodemailer |

### Data Models
| Model | Table | Relations | Last Modified |
|-------|-------|-----------|---------------|
| User | users | orders(1:N), profile(1:1) | 2024-01-14 |
| Order | orders | user(N:1), items(1:N) | 2024-01-12 |
| Product | products | orders(N:N) | 2024-01-10 |

## 🔍 Quick Search Index
```yaml
authentication: [auth.js, middleware/auth.js, User.login()]
payments: [payment.js, stripe_webhook.js, Order.process()]
validation: [validators/, schemas/, middleware/validate.js]
⚠️ Known Issues

Memory Leak in WebSocket connection (see ERROR_PATTERNS.md#ws-leak)
Race Condition in concurrent user creation (fixed in v2.0.1)


## 2️⃣ CURRENT_SESSION.md - 현재 작업 세션

```markdown
# 📍 Current Session Context
Session ID: session-2024-01-15-001
Started: 2024-01-15 14:30
Previous Session: session-2024-01-14-003

## 🎯 Session Goal
Implement Stripe payment integration with webhook handling

## 📝 Context From Previous Session
```yaml
completed:
  - User authentication flow
  - JWT token generation
  - Password reset functionality
  
in_progress:
  - Stripe API integration (50% complete)
  
decisions_made:
  - Use Repository pattern for data access
  - Implement webhook signature verification
  - Store payment logs in separate table
🔧 Working Files
yamlcurrently_editing:
  - /src/services/payment.js
  - /src/routes/webhook.js
  
need_to_update:
  - /src/models/User.js (add stripe_customer_id)
  - /tests/payment.test.js
  
do_not_modify:
  - /src/services/auth.js (tested and deployed)
💡 Important Context

Stripe API Key is in .env as STRIPE_SECRET_KEY
Webhook endpoint must be /api/webhooks/stripe
Use idempotency keys for all payment operations
Test with stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe

🚨 Session Notes

Remember to validate webhook signatures
Handle duplicate webhook events
Log all payment attempts with correlation IDs


## 3️⃣ VARIABLES.yaml - 변수 레지스트리

```yaml
# Variable Registry - Auto-generated, DO NOT EDIT MANUALLY
# Last Updated: 2024-01-15 14:30

global_constants:
  MAX_LOGIN_ATTEMPTS:
    value: 5
    type: number
    file: /src/config/constants.js
    description: Maximum login attempts before account lock
    
  SESSION_DURATION:
    value: 86400000  # 24 hours in ms
    type: number
    file: /src/config/constants.js
    
  STRIPE_WEBHOOK_SECRET:
    value: env.STRIPE_WEBHOOK_SECRET
    type: string
    file: /src/config/stripe.js
    
environment_variables:
  required:
    - DATABASE_URL
    - JWT_SECRET
    - STRIPE_SECRET_KEY
    - STRIPE_WEBHOOK_SECRET
    - REDIS_URL
    
  optional:
    - SMTP_HOST
    - SMTP_PORT
    - LOG_LEVEL

state_variables:
  user_session:
    location: Redis
    key_pattern: "session:{userId}"
    ttl: 86400
    structure:
      userId: string
      email: string
      roles: array
      lastActivity: timestamp
      
  payment_cache:
    location: Memory
    singleton: PaymentCache
    structure:
      pending: Map<orderId, PaymentIntent>
      completed: Set<orderId>
4️⃣ FUNCTIONS.yaml - 함수 카탈로그
yaml# Function Catalog - Reference for all major functions
# Format: functionName: { file, signature, description, dependencies }

authentication:
  createUser:
    file: /src/services/auth.js
    signature: async (userData: UserInput) => Promise<User>
    description: Creates new user with hashed password
    dependencies: [bcrypt, UserModel]
    throws: [DuplicateEmailError, ValidationError]
    example: |
      const user = await createUser({
        email: 'user@example.com',
        password: 'SecurePass123!',
        name: 'John Doe'
      });
    
  verifyToken:
    file: /src/middleware/auth.js
    signature: (token: string) => DecodedToken | null
    description: Verifies JWT token and returns payload
    dependencies: [jsonwebtoken]
    
  hashPassword:
    file: /src/utils/crypto.js
    signature: async (password: string) => Promise<string>
    description: Hashes password using bcrypt with salt rounds=10

payments:
  createPaymentIntent:
    file: /src/services/payment.js
    signature: async (amount: number, currency: string, metadata: object) => Promise<PaymentIntent>
    description: Creates Stripe payment intent with idempotency
    dependencies: [stripe]
    important: Always use idempotency key from metadata.orderId
    
  processWebhook:
    file: /src/routes/webhook.js
    signature: async (payload: string, signature: string) => Promise<void>
    description: Processes Stripe webhook events
    dependencies: [stripe, OrderModel]
    security: MUST verify signature before processing
5️⃣ DATABASE.yaml - 데이터베이스 스키마
yaml# Database Schema Registry
# Database: PostgreSQL 14
# ORM: Prisma

schema_version: 2.1.0
migration_version: 20240115001

tables:
  users:
    columns:
      - id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
      - email: varchar(255) UNIQUE NOT NULL
      - password_hash: varchar(255) NOT NULL
      - name: varchar(100)
      - stripe_customer_id: varchar(50) UNIQUE
      - created_at: timestamp DEFAULT now()
      - updated_at: timestamp DEFAULT now()
    
    indexes:
      - idx_users_email: [email]
      - idx_users_stripe: [stripe_customer_id]
    
    relations:
      orders: 
        type: one_to_many
        foreign_key: orders.user_id
      profile:
        type: one_to_one
        foreign_key: profiles.user_id
        
  orders:
    columns:
      - id: uuid PRIMARY KEY
      - user_id: uuid REFERENCES users(id)
      - status: enum('pending','processing','completed','failed')
      - amount: decimal(10,2)
      - stripe_payment_intent_id: varchar(100)
      - created_at: timestamp
      
    indexes:
      - idx_orders_user: [user_id]
      - idx_orders_status: [status]
      - idx_orders_stripe: [stripe_payment_intent_id]

migrations_history:
  - version: 20240110001
    description: Initial schema
  - version: 20240112001  
    description: Add orders table
  - version: 20240115001
    description: Add stripe_customer_id to users
6️⃣ CONTEXT_CHAIN.md - 컨텍스트 체인 로그
markdown# 🔗 Context Chain Log
# Maximum 500 lines - Older entries archived to CONTEXT_ARCHIVE_2024Q1.md

## Chain #047 | 2024-01-15 14:30
**Focus**: Payment Integration
**Previous**: #046 (Auth completion)
**Hash**: 7f8a9b2c

### Decisions Made
- Use Stripe Payment Intents API
- Implement webhook for async events
- Store all payment attempts

### Code Created
```files
created:
  - /src/services/payment.js
  - /src/routes/webhook.js
modified:
  - /src/models/User.js (added stripe_customer_id)
Patterns Applied

Repository Pattern for PaymentRepository
Factory Pattern for PaymentProviders
Observer Pattern for payment events

Key Learning

Webhook signatures must be verified using raw body
Idempotency keys prevent duplicate charges
Always log payment correlation IDs

Next Steps

Add webhook retry logic
Implement refund flow
Add payment analytics


Chain #046 | 2024-01-14 16:00
Focus: Authentication System
Hash: 6e7d8a1b
Completed

JWT implementation
Password reset flow
Rate limiting on login

[... continues with previous chains ...]

## 7️⃣ ERROR_PATTERNS.md - 오류 패턴 라이브러리

```markdown
# 🐛 Error Patterns & Solutions

## Pattern #001: Webhook Signature Verification Failure
**Error**: `Webhook signature verification failed`
**Context**: Stripe webhook processing
**Root Cause**: Using parsed body instead of raw body
**Solution**:
```javascript
// ❌ Wrong
app.post('/webhook', express.json(), (req, res) => {
  stripe.webhooks.constructEvent(req.body, sig, secret);
});

// ✅ Correct
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  stripe.webhooks.constructEvent(req.body, sig, secret);
});
Files Affected: /src/routes/webhook.js
First Occurred: Session-044
Status: RESOLVED
Pattern #002: Async/Await in Array.map
Error: Promise returned instead of data
Context: Batch processing operations
Root Cause: map doesn't wait for async operations
Solution:
javascript// ❌ Wrong
const results = items.map(async (item) => {
  return await processItem(item);
});

// ✅ Correct
const results = await Promise.all(
  items.map(async (item) => {
    return await processItem(item);
  })
);
Prevention: Use ESLint rule no-async-promise-executor

## 8️⃣ AI 프롬프트 템플릿

```markdown
# 🤖 AI Prompt Templates

## New Feature Implementation
Context Loading:

Read MASTER_INDEX.md for project overview
Read CURRENT_SESSION.md for immediate context
Check registry files for existing patterns

Task: [Describe feature]
Required Checks:

 Search FUNCTIONS.yaml for similar functions
 Check DATABASE.yaml for schema impacts
 Review ERROR_PATTERNS.md for known issues
 Verify naming in CONVENTIONS.md

Generate:

Implementation plan
Required file modifications
Test cases
Update relevant registry files


## Debugging Session
Load Error Context:

Current error: [error message]
File: [file path]
Check ERROR_PATTERNS.md for similar issues
Load CONTEXT_CHAIN.md for recent changes

Analyze:

When did this start? (check git history)
What changed recently? (check CURRENT_SESSION.md)
Any similar patterns? (check ERROR_PATTERNS.md)

Provide:

Root cause analysis
Fix implementation
Prevention strategy
Update ERROR_PATTERNS.md entry


🚀 사용 워크플로우
1. 새 세션 시작
bash# AI에게 지시할 때:
"Load context from MASTER_INDEX.md and CURRENT_SESSION.md, 
then continue payment integration from Chain #047"
2. 코드 생성 전 체크
bash# AI에게 지시할 때:
"Before creating new function, check FUNCTIONS.yaml for existing 
similar functions and follow patterns from CODE_PATTERNS.md"
3. 오류 발생 시
bash# AI에게 지시할 때:
"Error occurred: [error]. Check ERROR_PATTERNS.md for similar issues,
then add solution to the library"
4. 세션 종료
bash# AI에게 지시할 때:
"Update CONTEXT_CHAIN.md with current session summary,
update any modified registry files, 
and prepare CURRENT_SESSION.md for next session"
이 시스템의 핵심은 AI가 항상 전체 컨텍스트를 파악할 수 있도록 구조화된 정보를 제공하는 것입니다. 각 문서는 서로 연결되어 있으며, AI는 이를 통해 중복 개발을 방지하고 일관성을 유지할 수 있습니다.재시도L각 문서가 매번 업데이트 되는구조 인거야? 이유는 문서만 많아지고 관리가 안되서 백으로 돌아가는경우도 많았거든편집SSequentialthinking요청{
  `thought`: `사용자의 핵심 우려는 문서화가 관리 부담이 되어 오히려 역효과를 낳는 것이다. 문서가 많아지면 업데이트가 누락되고, 결국 신뢰할 수 없는 문서가 되어 버린다. 따라서 자동화된 업데이트와 최소한의 핵심 문서만 유지하는 전략이 필요하다.`,
  `thoughtNumber`: 1,
  `totalThoughts`: 3,
  `nextThoughtNeeded`: true
}응답{
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "branches": [],
  "thoughtHistoryLength": 4
}SSequentialthinking요청{
  `thought`: `해결책은 1) 자동 업데이트되는 문서와 수동 업데이트 문서를 구분 2) 단일 진실 공급원(Single Source of Truth) 원칙 적용 3) 코드에서 자동 추출되는 메타데이터 활용 4) 임시 문서와 영구 문서 구분이다.`,
  `thoughtNumber`: 2,
  `totalThoughts`: 3,
  `nextThoughtNeeded`: true
}응답{
  "thoughtNumber": 2,
  "totalThoughts": 3,
  "nextThoughtNeeded": true,
  "branches": [],
  "thoughtHistoryLength": 5
}SSequentialthinking요청{
  `thought`: `실용적인 문서화 시스템을 제안해야 한다. 핵심은 3개의 파일만 수동 관리하고, 나머지는 코드에서 자동 생성하거나 git hook으로 업데이트하는 구조다. 또한 문서 만료 시스템을 도입해서 오래된 문서는 자동으로 무효화되도록 한다.`,
  `thoughtNumber`: 3,
  `totalThoughts`: 3,
  `nextThoughtNeeded`: false
}응답{
  "thoughtNumber": 3,
  "totalThoughts": 3,
  "nextThoughtNeeded": false,
  "branches": [],
  "thoughtHistoryLength": 6
}정확한 지적입니다! 문서 관리의 오버헤드가 개발 속도를 죽이는 건 흔한 실패 패턴입니다.
🎯 최소 관리 문서화 시스템 2.0
핵심 원칙: 3개 파일만 수동 관리 + 나머지는 자동 생성
project-root/
├── .ai/                        # AI 컨텍스트 (3개만 수동 관리)
│   ├── CONTEXT.md             # 👈 유일한 수동 업데이트 파일
│   ├── context.lock           # 자동 생성 (코드 스캔)
│   └── session.tmp            # 임시 파일 (자동 삭제)
1️⃣ CONTEXT.md - 단일 진실 공급원 (수동 관리)
markdown# Project Context
Last Update: 2024-01-15 14:30 | Expires: 2024-01-22 (7 days)

## 🎯 Current Sprint (수동 업데이트)
WORKING ON: Payment integration with Stripe
BLOCKED BY: Nothing
NEXT: Email notifications

## 📌 Key Decisions (절대 지우지 않음)
2024-01-15: Use Stripe for payments (not PayPal)
2024-01-14: JWT for auth (not sessions)  
2024-01-12: PostgreSQL (not MongoDB)

## 🚨 Critical Knowledge (수동 업데이트)
- NEVER modify /src/services/auth.js (production tested)
- Stripe webhook MUST use raw body parser
- User emails are UNIQUE constraint in DB

## 💭 Working Memory (매 세션 덮어쓰기)
```yaml
last_session:
  created: [payment.js, webhook.js]
  modified: [User model - added stripe_customer_id]
  tested: [payment.js - 80% coverage]
  
current_issues:
  - Webhook signature failing (raw body issue)
  - Need idempotency for payment retry
  
next_tasks:
  - Add webhook retry logic
  - Test refund flow
🔄 Context Chain (최근 5개만 유지)
[#005] Payment webhook implemented ->
[#004] Stripe integration started ->
[#003] Auth system complete ->
[#002] User model created ->
[#001] Project setup

## 2️⃣ context.lock - 자동 생성 (코드 스캔)

```yaml
# AUTO-GENERATED - DO NOT EDIT
# Generated: 2024-01-15 14:30:00
# Command: npm run scan-context

project_stats:
  total_files: 47
  total_lines: 3456
  last_commit: "7f8a9b2c"
  
code_registry:
  # 자동으로 코드에서 추출
  functions:
    createUser:
      file: /src/services/auth.js:42
      signature: async (userData) => Promise<User>
      calls: [hashPassword, UserModel.create]
      
    processPayment:
      file: /src/services/payment.js:15
      signature: async (amount, userId) => Promise<PaymentIntent>
      calls: [stripe.paymentIntents.create]
  
  classes:
    UserService:
      file: /src/services/user.js
      methods: [create, update, delete, findById]
      dependencies: [UserModel, CacheService]
  
  database:
    tables:
      users:
        columns: [id, email, password_hash, stripe_customer_id]
        indexes: [email_unique, stripe_customer_id]
      orders:
        columns: [id, user_id, amount, status]
        relations: {user_id: users.id}
  
  api_endpoints:
    POST /api/auth/login: {handler: authController.login}
    POST /api/auth/register: {handler: authController.register}
    POST /api/webhooks/stripe: {handler: webhookController.stripe}

dependencies:
  production:
    express: ^4.18.0
    stripe: ^11.0.0
    jsonwebtoken: ^9.0.0
  
errors_captured:
  # 자동으로 try-catch에서 추출
  - DuplicateEmailError: /src/services/auth.js:45
  - InvalidTokenError: /src/middleware/auth.js:12
  - StripeWebhookError: /src/routes/webhook.js:23
3️⃣ session.tmp - 임시 작업 파일 (자동 삭제)
markdown# TEMPORARY SESSION - Auto-deletes after 24 hours
Session: 2024-01-15-afternoon
Started: 14:30

## Claude Says:
- Working on payment.js
- Need to add stripe_customer_id to User model
- Remember to verify webhook signatures

## Quick Notes:
- Stripe test key: sk_test_xxx
- Webhook endpoint: /api/webhooks/stripe
- Test command: stripe listen --forward-to localhost:3000

## Scratchpad:
```javascript
// 임시 코드 테스트
const sig = headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(body, sig, secret);
[이 파일은 24시간 후 자동 삭제됨]

## 🤖 자동화 스크립트

### package.json에 추가
```json
{
  "scripts": {
    "scan-context": "node scripts/scan-context.js",
    "pre-commit": "npm run scan-context",
    "clean-context": "node scripts/clean-old-sessions.js"
  }
}
scripts/scan-context.js
javascript#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class ContextScanner {
  constructor() {
    this.context = {
      project_stats: {},
      code_registry: {
        functions: {},
        classes: {},
        database: {},
        api_endpoints: {}
      },
      errors_captured: []
    };
  }

  async scan() {
    // 1. 프로젝트 통계
    this.context.project_stats = {
      total_files: await this.countFiles('./src'),
      total_lines: await this.countLines('./src'),
      last_commit: await this.getLastCommit()
    };

    // 2. 함수 자동 추출
    await this.scanJavaScriptFiles('./src');
    
    // 3. 데이터베이스 스키마 추출
    await this.scanDatabaseSchema('./prisma/schema.prisma');
    
    // 4. API 엔드포인트 추출  
    await this.scanRoutes('./src/routes');
    
    // 5. context.lock 파일 생성
    fs.writeFileSync(
      '.ai/context.lock',
      `# AUTO-GENERATED - DO NOT EDIT\n` +
      `# Generated: ${new Date().toISOString()}\n` +
      `# Command: npm run scan-context\n\n` +
      JSON.stringify(this.context, null, 2)
    );
  }

  scanJavaScriptFiles(dir) {
    // AST 파싱으로 함수, 클래스 자동 추출
    const files = this.getJSFiles(dir);
    
    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
      
      traverse(ast, {
        FunctionDeclaration(path) {
          const name = path.node.id.name;
          const params = path.node.params.map(p => p.name);
          this.context.code_registry.functions[name] = {
            file: `${file}:${path.node.loc.start.line}`,
            signature: `${name}(${params.join(', ')})`
          };
        },
        
        ClassDeclaration(path) {
          const name = path.node.id.name;
          const methods = [];
          path.traverse({
            ClassMethod(methodPath) {
              methods.push(methodPath.node.key.name);
            }
          });
          this.context.code_registry.classes[name] = {
            file,
            methods
          };
        },
        
        // try-catch 블록에서 에러 패턴 추출
        CatchClause(path) {
          const bodyCode = code.slice(
            path.node.body.start,
            path.node.body.end
          );
          if (bodyCode.includes('Error')) {
            // 에러 타입 추출 로직
          }
        }
      });
    });
  }
}

// 실행
new ContextScanner().scan();
🎮 실제 사용 워크플로우
1. 새 작업 시작할 때
bash# Claude에게:
"Read CONTEXT.md and context.lock. Continue from Working Memory section."

# CONTEXT.md만 읽으면 전체 맥락 파악 가능
# context.lock은 필요할 때만 참조
2. 코드 작업 중
bash# 자동으로 context.lock 업데이트
npm run scan-context

# Claude가 함수 중복 체크 가능
"Check context.lock if similar function exists"
3. 세션 종료
bash# CONTEXT.md의 Working Memory 섹션만 업데이트
# 나머지는 자동화

# Claude에게:
"Update only Working Memory section in CONTEXT.md with:
- what was created/modified
- current issues  
- next tasks"
4. 문서 만료 체크
javascript// CONTEXT.md 상단의 Expires 날짜 체크
if (expires < today) {
  console.warn("⚠️ Context expired! Review and update CONTEXT.md");
}
🔑 핵심 차별점

단일 파일 관리: CONTEXT.md 하나만 수동 업데이트
자동 스캔: 코드에서 메타데이터 자동 추출
만료 시스템: 오래된 문서 자동 경고
임시 파일: session.tmp는 24시간 후 자동 삭제
Git hooks: commit 시 자동으로 context.lock 업데이트

📊 관리 부담 비교
이전 시스템새 시스템10+ 문서 파일1개 문서 (CONTEXT.md)모든 파일 수동 업데이트자동 스캔 + 1개만 수동문서 중복/불일치Single Source of Truth오래된 문서 방치자동 만료/경고세션 기록 누적임시 파일 자동 삭제
이렇게 하면 문서 관리 부담은 최소화하면서도 AI가 필요한 컨텍스트는 항상 최신으로 유지됩니다. 핵심은 "사람은 의도와 결정사항만 기록하고, 코드 정보는 자동 추출"입니다.재시도LCONTEXT.md 이렇게 하면 이 파일도 역시나 몇천줄이될수 있잖아. 그래서 CONTEXT-2025-10-01-01.md 인런식으로 500줄이던 규칙의 로그를 기록하고 넘어가면 다음파일 생성되게 하자는뜻이야.편집SSequentialthinking요청{
  `thought`: `사용자가 원하는 것은 CONTEXT.md가 비대해지는 것을 막기 위한 롤링 로그 시스템이다. 500줄 제한으로 파일을 자동 분할하고, 타임스탬프가 있는 파일명으로 아카이빙하는 구조. 이렇게 하면 최신 컨텍스트는 항상 접근 가능하고, 과거 기록도 필요시 참조 가능하다.`,
  `thoughtNumber`: 1,
  `totalThoughts`: 2,
  `nextThoughtNeeded`: true
}응답{
  "thoughtNumber": 1,
  "totalThoughts": 2,
  "nextThoughtNeeded": true,
  "branches": [],
  "thoughtHistoryLength": 7
}SSequentialthinking요청{
  `thought`: `롤링 로그 시스템을 구현하되, 현재 활성 파일(CONTEXT.md)은 항상 동일한 이름을 유지하고, 500줄 초과시 자동으로 아카이브 파일을 생성하는 방식이 좋다. 또한 중요한 결정사항은 별도로 보존하고, 임시 작업 내용은 롤링되도록 구분해야 한다.`,
  `thoughtNumber`: 2,
  `totalThoughts`: 2,
  `nextThoughtNeeded`: false
}응답{
  "thoughtNumber": 2,
  "totalThoughts": 2,
  "nextThoughtNeeded": false,
  "branches": [],
  "thoughtHistoryLength": 8
}완벽한 지적입니다! 롤링 로그 시스템으로 가야죠. 파일이 계속 커지면 결국 컨텍스트 윈도우 문제로 돌아갑니다.
🔄 롤링 컨텍스트 시스템
.ai/
├── CONTEXT.md                    # 👈 항상 현재 작업 (최대 500줄)
├── DECISIONS.md                  # 👈 영구 보존 (중요 결정사항만)
├── archives/                     # 자동 아카이빙
│   ├── CONTEXT-2025-01-15-01.md  # 500줄 도달시 자동 생성
│   ├── CONTEXT-2025-01-15-02.md  
│   └── CONTEXT-2025-01-14-01.md
├── context.lock                  # 자동 생성 (코드 스캔)
└── .context-config.yml           # 설정 파일
1️⃣ CONTEXT.md - 현재 활성 컨텍스트 (500줄 제한)
markdown# Active Context 
Lines: 234/500 | Started: 2025-01-15 14:30 | Archive: #047

## 🔗 Context Chain
Current: #047 | Previous: #046 (archived) | Next: #048

## 🎯 Current Focus
```yaml
session_id: session-2025-01-15-002
working_on: Stripe payment integration
started_at: 2025-01-15 14:30
lines_count: 234/500  # 자동 카운트

critical_context:
  - Webhook must use raw body parser
  - Payment needs idempotency key
  - Never modify auth.js
📝 Session Log (자동 롤링)
[14:30] Payment Service Setup

Created: /src/services/payment.js
Pattern: Repository pattern for payments
Decision: Use Stripe Payment Intents API

[14:45] Webhook Implementation

Created: /src/routes/webhook.js
Issue: Signature verification failing
Fix: Changed to raw body parser
Learning: Always use express.raw() for webhooks

[15:00] Database Update

Modified: User model
Added: stripe_customer_id field
Migration: 20250115001_add_stripe_customer

[15:15] Testing

Created: payment.test.js
Coverage: 78%
TODO: Add webhook retry tests

🚨 Active Issues

Webhook retry logic not implemented
Need error handling for network failures
Missing idempotency in retry mechanism

🔄 Next Actions

 Implement exponential backoff for webhooks
 Add payment failure notifications
 Create refund flow


[Auto-archive at 500 lines → CONTEXT-2025-01-15-01.md]

## 2️⃣ DECISIONS.md - 영구 보존 (절대 롤링 안함)

```markdown
# 🏛️ Project Decisions Record
*This file is NEVER archived - Only critical decisions*

## Architecture Decisions

### 2025-01-15 | Payment Provider: Stripe
- **Context**: Need payment processing
- **Decision**: Use Stripe over PayPal
- **Reason**: Better API, webhook support
- **Consequences**: Need PCI compliance
- **Session**: #047

### 2025-01-14 | Auth: JWT
- **Context**: Authentication method needed  
- **Decision**: JWT over sessions
- **Reason**: Stateless, scalable
- **Consequences**: Token refresh complexity
- **Session**: #042

### 2025-01-12 | Database: PostgreSQL
- **Context**: Database selection
- **Decision**: PostgreSQL over MongoDB
- **Reason**: ACID, relations needed
- **Consequences**: Schema migrations required
- **Session**: #038

## Critical Learnings

### ⚠️ 2025-01-15 | Webhook Body Parser
**Never Forget**: Stripe webhooks MUST use raw body
```javascript
// ❌ WRONG - Will fail signature verification
app.use(express.json())

// ✅ CORRECT - Raw body for webhook endpoint
app.use('/webhook', express.raw({type: 'application/json'}))
⚠️ 2025-01-14 | Unique Email Constraint
Never Forget: Email field has UNIQUE constraint

Always check for duplicate before insert
Handle constraint violation gracefully


## 3️⃣ 자동 아카이빙 스크립트

### scripts/context-roller.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ContextRoller {
  constructor() {
    this.maxLines = 500;
    this.contextPath = '.ai/CONTEXT.md';
    this.archivePath = '.ai/archives';
    this.configPath = '.ai/.context-config.yml';
  }

  async checkAndRoll() {
    const lines = await this.countLines(this.contextPath);
    
    if (lines >= this.maxLines) {
      await this.archiveContext();
      await this.createNewContext();
    } else {
      await this.updateLineCount(lines);
    }
  }

  async countLines(filepath) {
    const fileStream = fs.createReadStream(filepath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    for await (const line of rl) {
      lineCount++;
    }
    return lineCount;
  }

  async archiveContext() {
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveNumber = await this.getNextArchiveNumber(timestamp);
    const archiveName = `CONTEXT-${timestamp}-${String(archiveNumber).padStart(2, '0')}.md`;
    
    // 현재 CONTEXT.md를 아카이브로 이동
    const content = fs.readFileSync(this.contextPath, 'utf-8');
    
    // 아카이브 파일 생성
    const archivePath = path.join(this.archivePath, archiveName);
    fs.writeFileSync(archivePath, 
      `# Archived Context\n` +
      `Archived: ${new Date().toISOString()}\n` +
      `Session Range: #${this.getSessionRange(content)}\n\n` +
      content
    );
    
    console.log(`✅ Archived to ${archiveName}`);
    return archiveName;
  }

  async createNewContext() {
    const sessionNumber = await this.getNextSessionNumber();
    const template = `# Active Context 
Lines: 1/500 | Started: ${new Date().toISOString()} | Archive: #${sessionNumber}

## 🔗 Context Chain
Current: #${sessionNumber} | Previous: #${sessionNumber - 1} (archived) | Next: #${sessionNumber + 1}

## 🎯 Current Focus
\`\`\`yaml
session_id: session-${new Date().toISOString().split('T')[0]}-001
working_on: [Continued from previous session]
started_at: ${new Date().toISOString()}
lines_count: 1/500
\`\`\`

## 📝 Session Log (자동 롤링)
### [${new Date().toTimeString().split(' ')[0].substring(0, 5)}] Context Rolled
- Previous context archived
- Starting fresh context
- Check previous archive for history

## 🚨 Active Issues
[Carry over from previous if needed]

## 🔄 Next Actions
[Carry over from previous if needed]

---
[Auto-archive at 500 lines]
`;

    fs.writeFileSync(this.contextPath, template);
    console.log(`✅ New CONTEXT.md created`);
  }

  async updateLineCount(lines) {
    const content = fs.readFileSync(this.contextPath, 'utf-8');
    const updated = content.replace(
      /Lines: \d+\/500/,
      `Lines: ${lines}/500`
    );
    fs.writeFileSync(this.contextPath, updated);
  }
}

// Git hook 또는 수동 실행
const roller = new ContextRoller();
roller.checkAndRoll();
4️⃣ AI 프롬프트 통합
Claude에게 지시하는 방법:
markdown# 새 세션 시작
"Check CONTEXT.md line count. If near 500, prepare to roll.
Read DECISIONS.md for critical rules that must never be violated.
Continue from Current Focus section."

# 작업 중 업데이트
"Add to Session Log in CONTEXT.md:
- Time: [current time]  
- Action: [what was done]
- Files: [created/modified]
- Issues: [any problems]
Keep under 500 lines total."

# 세션 종료
"Update CONTEXT.md:
1. Update Active Issues section
2. Update Next Actions section  
3. Check line count
4. If >450 lines, flag for rolling"

# 과거 참조 필요시
"Search in .ai/archives/ for CONTEXT-*-*.md files
containing [specific topic/date]"
5️⃣ 설정 파일 (.context-config.yml)
yaml# Context Management Configuration
version: 1.0

limits:
  max_lines: 500
  warning_threshold: 450
  
archiving:
  auto_archive: true
  compress_old: true  # 30일 이상 된 아카이브는 압축
  retention_days: 90  # 90일 후 자동 삭제
  
context_sections:
  # 섹션별 최대 줄 수 제한
  session_log: 300
  active_issues: 50
  next_actions: 50
  current_focus: 100
  
auto_carry_over:
  # 새 컨텍스트로 자동 이월할 섹션
  - active_issues
  - next_actions
  - critical_context

alerts:
  near_limit: 450  # 450줄에서 경고
  force_roll: 500  # 500줄에서 강제 롤링
6️⃣ 실제 워크플로우
일반적인 하루:
bash# 아침 - 세션 시작
$ npm run context-check
> Current: 234/500 lines
> Last session: #046
> Active issues: 3

# Claude에게:
"Read CONTEXT.md and continue from Active Issues"

# 작업 중 - 자동 체크
$ git commit -m "Add payment service"
> Pre-commit hook: Context at 367/500 lines ✓

# 오후 - 경고
$ npm run context-check  
> ⚠️ Warning: 468/500 lines
> Consider wrapping up current context

# 세션 마지막
$ npm run context-roll
> ✅ Archived to CONTEXT-2025-01-15-01.md
> ✅ New CONTEXT.md created
> Carried over: 3 issues, 5 next actions
📊 장점 정리
문제해결파일 비대화500줄 자동 롤링컨텍스트 손실아카이브에 모든 히스토리 보존중요 정보 유실DECISIONS.md는 영구 보존관리 부담자동 롤링, 자동 카운트과거 검색 어려움날짜별 아카이브 파일명
이렇게 하면 항상 CONTEXT.md는 적정 크기 유지하면서도 전체 히스토리는 아카이브에 보존됩니다. Claude는 항상 최신 CONTEXT.md를 읽고, 필요시에만 아카이브를 참조하면 됩니다.