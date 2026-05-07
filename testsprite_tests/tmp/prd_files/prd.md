# Product Requirements Document (PRD)
# Grapadi Strategix — Business Planning & Financial Management Platform

---

## 1. Product Overview

### 1.1 Product Name
**Grapadi Strategix** (also branded internally as "SmartPlan")

### 1.2 Product Description
Grapadi Strategix is a full-stack web application that enables entrepreneurs, small business owners, and startups to create professional business plans, manage financial operations, generate AI-powered financial forecasts, and export comprehensive PDF reports. The platform includes an affiliate referral system and a Pro subscription model for premium PDF exports.

### 1.3 Target Users
- **Primary**: Indonesian small-to-medium business owners and startup founders
- **Secondary**: Business consultants, MBA students, financial planners
- **Admin**: Platform administrators managing users and monitoring statistics

### 1.4 Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React, Vite, Tailwind CSS, MUI | 19.2.3, 7.1.7, 4.1.16, 7.3.5 |
| Backend | Laravel, PHP | 11.31+, 8.2+ |
| Database | SQLite (dev), MySQL/PostgreSQL (production) | — |
| Authentication | Laravel Sanctum (token-based) | 4.2+ |
| OTP Verification | Fonnte API (WhatsApp) | — |
| Payment Gateway | SingaPay B2B | — |
| Charts | Chart.js 4.5 + react-chartjs-2 5.3.1 + chartjs-plugin-datalabels 2.2.0 + Recharts 3.4.1 | — |
| PDF Generation | barryvdh/laravel-dompdf 3.1+ (server-side) | — |
| Document Generation | phpoffice/phpword 1.3+ | — |
| Image Processing | Intervention Image 3.11+ | — |
| Image Capture | html-to-image 1.11.13, dom-to-image-more 3.7.2 | — |
| Forms | react-hook-form 7.66.0 | — |
| HTTP Client | Axios 1.13.2 | — |
| Notifications | react-toastify 11.0.5 | — |
| Icons | Lucide React 0.552.0, React Icons 5.5.0 (brand icons only) | — |
| Routing (FE) | react-router-dom 7.9.5 | — |

### 1.5 Application Architecture
- **Monorepo**: `backend/` (Laravel API) + `frontend/` (React SPA)
- **API-first**: All data exchanged via RESTful JSON API (`/api/*`)
- **State-based navigation**: Dashboard uses `activeSection`/`activeSubSection` state (not URL-based routing)
- **Token authentication**: Sanctum bearer tokens stored in localStorage
- **Context-based state**: `AuthContext` provides `isAuthenticated`, `isLoading`, `user` state via React Context API
- **Dark mode**: System preference detection + manual toggle, persisted in `localStorage`
- **Production base path**: `/grapadistrategix/` (configurable via Vite `base` option)
- **Build optimization**: Manual chunk splitting (vendor-react, vendor-mui, vendor-charts, vendor-utils)

### 1.6 Frontend Component Architecture
```
src/
├── App.jsx                      # Root app with routing, dark mode, toast
├── main.jsx                     # React entry point
├── contexts/
│   └── AuthContext.jsx           # Authentication state provider
├── pages/ (19 pages)
│   ├── LandingPage.jsx           # Public homepage
│   ├── FeaturesPage.jsx          # Features showcase
│   ├── PricingPage.jsx           # Pricing comparison
│   ├── FAQ.jsx                   # Frequently asked questions
│   ├── Terms.jsx                 # Terms & conditions
│   ├── Login.jsx / Register.jsx  # Auth pages
│   ├── ForgotPassword.jsx / ResetPassword.jsx / OtpVerification.jsx
│   ├── Dashboard.jsx             # Main protected dashboard
│   ├── BusinessPlan.jsx          # Business plan module
│   ├── ManagementFinancial.jsx   # Financial management module
│   ├── Forecast.jsx / Forecast-List.jsx / Forecast-Results.jsx
│   ├── Affiliate.jsx             # Affiliate module
│   ├── ExportPDFLengkap.jsx      # Combined PDF export
│   └── PaymentSuccess.jsx        # Payment success callback
├── components/ (9 directories, 105 files)
│   ├── Layout/                   # Header, Sidebar, Navbar, Footer, WhatsAppWidget
│   ├── Dashboard/                # StatCards, QuickActions, RecentPlans
│   ├── BusinessPlan/             # 8 sub-modules (49 files)
│   ├── ManagementFinancial/      # 7 sub-modules (28 files)
│   ├── Forecast/                 # 10 files
│   ├── Affiliate/                # 4 files
│   ├── Admin/                    # AdminDashboard, AdminUserManagement
│   ├── UserProfile/              # ProfileView, ProfileEdit, ProfileField
│   └── Public/                   # Contact.jsx
├── services/ (9 directories/files, 22 API service files)
│   ├── authApi.js, userApi.js, singapayApi.js
│   ├── affiliateCommissionApi.js
│   ├── businessPlan/             # 9 service files
│   ├── ManagementFinancial/      # 6 service files
│   ├── forecast/                 # 1 service file
│   ├── Affiliate/                # 1 service file
│   └── admin/                    # 1 service file
└── utils/                        # 2 utility files
```

### 1.7 Backend Service Layer
| Service | File | Description |
|---------|------|-------------|
| WhatsApp OTP | `WhatsAppService.php` | Fonnte API integration for OTP via WhatsApp |
| Forecast Engine | `ForecastService.php` | AI financial forecasting using ARIMA-like calculations |
| Salary Simulation | `SalarySimulationService.php` | Auto-generate salary estimates by position |
| Workflow Diagrams | `WorkflowDiagramService.php` | Auto-generate workflow diagrams for operations |
| Affiliate Service | `AffiliateService.php` | Link management, click tracking, referral registration |
| Affiliate Commission | `AffiliateCommissionService.php` | Commission calculation and tracking |
| **SingaPay Integration** | 6 dedicated services ↓ | |
| ├─ API Core | `SingapayApiService.php` | OAuth token management, API client |
| ├─ Payment | `PdfPaymentService.php` | Purchase flow, subscription management |
| ├─ Virtual Account | `VirtualAccountService.php` | VA creation for BRI, BNI, Danamon, Maybank |
| ├─ QRIS | `QrisService.php` | QRIS payment code generation |
| ├─ Payout | `SingaPayPayoutService.php` | Affiliate withdrawal disbursement |
| └─ Webhook | `WebhookService.php` | Payment confirmation, HMAC-SHA256 validation |

---

## 2. User Roles & Permissions

### 2.1 Roles
| Role | Description | Access |
|------|-------------|--------|
| **User** (default) | Regular registered user | All business plan, financial management, forecast, affiliate, and export features |
| **Admin** | Platform administrator | All user features + Admin Dashboard + User Management |

### 2.2 Account Status
| Status | Behavior |
|--------|----------|
| `active` | Full access to all features |
| `inactive` | Blocked from login and API access; token revoked |
| `banned` | Blocked from login and API access; token revoked |

### 2.3 Authentication Flow
1. User registers with **name, username, phone (WhatsApp), password**
2. OTP sent via WhatsApp (Fonnte API) for phone verification
3. User verifies OTP → account activated → token issued
4. Login with **username + password** → token issued
5. All authenticated requests include `Authorization: Bearer {token}`
6. Middleware checks: `auth:sanctum` → `account.active` → (optional) `admin`

### 2.4 User Model Fields
```
name, username, phone, password, profile_photo,
account_status, role,
otp_code, otp_expires_at,
reset_otp_code, reset_otp_expires_at,
phone_verified_at,
pdf_access_active, pdf_access_expires_at, pdf_access_package,
referred_by_user_id
```

---

## 3. Feature Specifications

### 3.1 Public Pages (No Auth Required)

#### 3.1.1 Landing Page (`/`)
- Hero section with CTA (Register / Login)
- Feature highlights (4 modules overview)
- Pricing preview
- Testimonials section
- Footer with social links and contact info
- WhatsApp floating widget (via `WhatsAppWidget.jsx`)

#### 3.1.2 Features Page (`/features`)
- Detailed showcase of all platform capabilities
- Module-by-module breakdown with visual icons
- CTA to register

#### 3.1.3 Pricing Page (`/pricing`)
- Free vs Pro comparison table
- Pro: Rp 200,000/month or Rp 1,680,000/year
- Pro benefit: Watermark-free PDF exports
- All other features free for all users

#### 3.1.4 FAQ Page (`/faq`)
- Accordion-style frequently asked questions
- Categories: General, Features, Pricing, Technical

#### 3.1.5 Terms & Conditions (`/terms`)
- Legal terms of service
- Privacy policy sections

#### 3.1.6 Affiliate Link Redirect (`/affiliate/:slug`)
- Public route for tracking affiliate link clicks
- Redirects to registration page with referral code
- Click count tracked on the affiliate link record

---

### 3.2 Authentication Features

#### 3.2.1 Registration (`/register`)
**Fields:**
- Name (required)
- Username (required, unique)
- Phone / WhatsApp number (required, unique, format: 628xxx)
- Password (required, min 8 chars)
- Confirm Password (required)
- Referral Code (optional — affiliate tracking)

**Flow:**
1. Submit form → `POST /api/register`
2. OTP sent to WhatsApp → redirect to `/verify-otp`
3. Enter 6-digit OTP → `POST /api/verify-otp`
4. On success → token issued → redirect to `/dashboard`

**Validation:**
- Username: unique, alphanumeric
- Phone: unique, valid Indonesian format
- Password: minimum 8 characters

#### 3.2.2 Login (`/login`)
**Fields:**
- Username (required)
- Password (required)

**Flow:**
1. Submit → `POST /api/login`
2. Backend checks: credentials → account_status → phone_verified
3. If banned → error "Akun Anda telah diblokir"
4. If inactive → error "Akun Anda tidak aktif"
5. If phone not verified → redirect to OTP verification
6. If success → token + user data → redirect to `/dashboard`

#### 3.2.3 OTP Verification (`/verify-otp`)
**Flow:**
1. Enter 6-digit OTP code
2. Submit → `POST /api/verify-otp`
3. On success → phone marked as verified → token issued
4. Resend option → `POST /api/resend-otp` (rate limited)

**Note:** This route is accessible both authenticated and unauthenticated (via `VerificationRoute` wrapper)

#### 3.2.4 Forgot Password (`/forgot-password` → `/reset-password`)
**Flow:**
1. Enter phone number → `POST /api/forgot-password`
2. OTP sent via WhatsApp
3. Enter OTP → `POST /api/verify-reset-otp` → get reset_token
4. Enter new password → `POST /api/reset-password`

#### 3.2.5 Logout
- `POST /api/logout` → revoke token
- Clear localStorage (token, user data)
- Redirect to `/`

#### 3.2.6 Current User
- `GET /api/me` → returns authenticated user data
- Used by `AuthContext` to validate token on app load

---

### 3.3 Dashboard (`/dashboard`) — Protected

#### 3.3.1 Dashboard Overview (activeSection: `dashboard`)
- Welcome header with user name
- **Stat Cards** component showing summary metrics
- 4 module cards with sub-module counts:
  - **Business Plan** — 7 active sub-modules (Financial Plan disabled)
  - **Financial Management** — 6 sub-modules
  - **Forecast Keuangan** — 2 modules
  - **Affiliate & Lead** — 3 sub-modules
- **Quick Actions** section for common tasks
- **Recent Plans** section showing latest business plans
- Click any card → navigate to respective section

#### 3.3.2 Layout Structure
- **Header** (`Header.jsx`): User profile, Pro badge, dark mode toggle, logout
- **Sidebar** (`Sidebar.jsx`): Navigation with active section indicators, collapsible
- **Navbar** (`Navbar.jsx`): Public page navigation bar

---

### 3.4 Business Plan Module (7 Active Sub-modules)

> **Note:** The Financial Plan sub-module (3.4.7) exists in the codebase as frontend components (`FinancialPlan/` — 9 files) and backend model (`FinancialPlan.php`), but its API routes are **currently disabled/commented out** in `api.php`. The module is not accessible via the API.

#### 3.4.1 Business Background
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Business Name, Category (e.g., Kuliner, Teknologi, Jasa)
- Description, Business Overview
- Business Legality (e.g., CV, PT, UD)
- Purpose, Business Objectives
- Location, Business Type, Start Date
- Values, Vision, Mission
- Contact information
- Logo (image upload)
- Background Image (image upload)
- Org Chart Image (image upload)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business-background` | List all for current user |
| GET | `/api/business-background/{id}` | Get detail |
| POST | `/api/business-background` | Create new (multipart) |
| POST | `/api/business-background/{id}` | Update (multipart with _method=PUT) |
| PUT | `/api/business-background/{id}` | Update |
| DELETE | `/api/business-background/{id}` | Delete |

#### 3.4.2 Market Analysis
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Target Market description
- Market Size estimation
- Market Trends
- Main Competitors summary
- Competitor Strengths & Weaknesses
- Competitive Advantage
- **TAM/SAM/SOM**: Total Addressable Market, Serviceable Addressable Market, Serviceable Obtainable Market (values + percentages)
- **SWOT**: Strengths, Weaknesses, Opportunities, Threats
- Linked to a BusinessBackground

**Sub-entity — Competitors:**
- Competitor Name, Type (ownshop/competitor), Code
- Address, Annual Sales Estimate, Selling Price
- Strengths, Weaknesses, Sort Order

**Special Features:**
- Market size calculator (`POST /api/market-analysis/calculate-market-size`)
- Charts: Pie chart (market share), Bar chart (competitor comparison)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market-analysis` | List all |
| POST | `/api/market-analysis` | Create |
| GET | `/api/market-analysis/{id}` | Detail |
| PUT | `/api/market-analysis/{id}` | Update |
| DELETE | `/api/market-analysis/{id}` | Delete |
| POST | `/api/market-analysis/calculate-market-size` | Calculate TAM/SAM/SOM |

#### 3.4.3 Product & Service
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Type: `product` or `service`
- Name, Description, Price
- Image (file upload)
- Advantages, Development Strategy
- **BMC Alignment** (JSON): 9 Business Model Canvas fields — Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure, Revenue Streams
- Status: `draft` or `published`

**Special Features:**
- Auto-generate BMC alignment via AI (`POST /api/product-service/{id}/generate-bmc-alignment`)
- Product image upload (multipart form)
- Statistics overview (`GET /api/product-service/statistics/overview`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/product-service` | List all |
| GET | `/api/product-service/{id}` | Detail |
| POST | `/api/product-service` | Create |
| POST | `/api/product-service/{id}` | Update (multipart) |
| PUT | `/api/product-service/{id}` | Update |
| DELETE | `/api/product-service/{id}` | Delete |
| POST | `/api/product-service/{id}/generate-bmc-alignment` | AI BMC generation |
| GET | `/api/product-service/statistics/overview` | Statistics |

#### 3.4.4 Marketing Strategy
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Promotion Strategy (text)
- Media Used (text — e.g., Instagram, TikTok, Google Ads)
- Pricing Strategy (text)
- Monthly Target (number — target sales/month)
- Collaboration Plan (text)
- Status: `draft` or `published`

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketing-strategy` | List all |
| POST | `/api/marketing-strategy` | Create |
| GET | `/api/marketing-strategy/{id}` | Detail |
| PUT | `/api/marketing-strategy/{id}` | Update |
| DELETE | `/api/marketing-strategy/{id}` | Delete |

#### 3.4.5 Operational Plan
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Business Location, Location Description, Location Type, Location Size, Rent Cost
- **Employees** (JSON array): name, position, salary for each employee
- **Operational Hours** (JSON array): day, open_time, close_time
- **Suppliers** (JSON array): name, product, contact, address
- Daily Workflow (text)
- Workflow Diagram (JSON or image upload)
- Equipment Needs (text)
- Technology Stack (text)

**Special Features:**
- Auto-generate workflow diagram (`POST /api/operational-plan/{id}/generate-workflow-diagram`)
- Upload workflow image (`POST /api/operational-plan/{id}/upload-workflow-image`)
- Statistics overview (`GET /api/operational-plan/statistics/overview`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/operational-plan` | List all |
| POST | `/api/operational-plan` | Create |
| GET | `/api/operational-plan/{id}` | Detail |
| PUT | `/api/operational-plan/{id}` | Update |
| DELETE | `/api/operational-plan/{id}` | Delete |
| POST | `/api/operational-plan/{id}/generate-workflow-diagram` | AI diagram generation |
| POST | `/api/operational-plan/{id}/upload-workflow-image` | Upload diagram image |
| GET | `/api/operational-plan/statistics/overview` | Statistics |

#### 3.4.6 Team Structure
**CRUD Operations**: Create, Read, Update, Delete

**Fields per Team Member:**
- Team Category: `owner`, `management`, `supervisor`, `staff`
- Member Name, Position, Salary, Jobdesk
- Experience, Photo (file upload)
- Sort Order, Status

**Special Features:**
- Org chart visualization (tree diagram)
- Upload custom org chart image (`POST /api/team-structure/upload-org-chart`)
- Delete org chart image (`DELETE /api/team-structure/org-chart/{businessBackgroundId}`)
- Auto-generate salary based on position (`POST /api/team-structure/generate-salary`)
- Check existing salary data (`POST /api/team-structure/check-existing-salary`)
- Salary summary view (`GET /api/team-structure/salary-summary`)
- Upload member photo (`POST /api/team-structure/{id}/upload-photo`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/team-structure` | List all |
| GET | `/api/team-structure/{id}` | Detail |
| POST | `/api/team-structure` | Create |
| PUT | `/api/team-structure/{id}` | Update |
| DELETE | `/api/team-structure/{id}` | Delete |
| POST | `/api/team-structure/{id}/upload-photo` | Upload member photo |
| POST | `/api/team-structure/check-existing-salary` | Check salary data |
| GET | `/api/team-structure/salary-summary` | Salary summary |
| POST | `/api/team-structure/generate-salary` | AI salary generation |
| POST | `/api/team-structure/upload-org-chart` | Upload org chart |
| DELETE | `/api/team-structure/org-chart/{businessBackgroundId}` | Delete org chart |

#### 3.4.7 Financial Plan (⚠️ CURRENTLY DISABLED)
> **Status:** Routes commented out in `api.php`. Frontend components exist (`components/BusinessPlan/FinancialPlan/` — 9 files) and backend model/controller exist, but the feature is **not accessible** via the API.

**Fields (if re-enabled):**
- Plan Name
- **Capital Sources** (JSON array): source name, amount, type (equity/debt)
- Total Initial Capital (calculated)
- **Initial CAPEX** (JSON array): item name, quantity, unit price, total
- Total CAPEX (calculated)
- **Monthly OPEX** (JSON array): category, amount
- Total Monthly OPEX (calculated)
- **Sales Projections** (JSON array): product, quantity, price, revenue
- Total Monthly/Yearly Income (calculated)
- Gross Profit, Tax Rate, Tax Amount, Interest Expense, Net Profit
- **Cash Flow Simulation** (JSON array)
- **Financial Summary** (JSON array)
- ROI Percentage, Payback Period, BEP Amount, Profit Margin
- Feasibility Status: `feasible`, `not_feasible`, `conditional`
- Feasibility Notes, General Notes
- Plan Duration (months)

**Planned Endpoints (disabled):**
- CRUD (index, store, show, update, delete)
- Financial summary, dashboard charts
- Cash flow, feasibility, forecast, sensitivity analysis
- Report generation, chart data

#### 3.4.8 PDF Business Plan Export
- Generate comprehensive business plan PDF combining all active sub-modules
- Executive summary auto-generation (`POST /api/pdf-business-plan/executive-summary`)
- PDF statistics (`GET /api/pdf-business-plan/statistics`)
- Watermark on Free plan, no watermark on Pro plan

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pdf-business-plan/generate` | Generate PDF |
| POST | `/api/pdf-business-plan/executive-summary` | Auto-generate executive summary |
| GET | `/api/pdf-business-plan/statistics` | PDF generation statistics |

---

### 3.5 Financial Management Module (6 Sub-modules)

**Dashboard Stats:** `GET /api/management-financial/dashboard-stats`

#### 3.5.1 Financial Categories
**CRUD Operations**: Create, Read, Update, Delete (Soft Delete)

**Fields:**
- Name, Type (`income` / `expense` / `plan`)
- Category Subtype: `operating_revenue`, `non_operating_revenue`, `cogs`, `operating_expense`, `interest_expense`, `tax_expense`
- Description

**Default Categories (18 per user, auto-seeded):**
- 4 income categories (Penjualan Produk, Pendapatan Jasa, Pendapatan Lainnya, Diskon & Potongan)
- 12 expense categories (Bahan Baku, Gaji Karyawan, Sewa, Utilitas, Marketing, Transportasi, Perawatan, Asuransi, Pajak, Penyusutan, Bunga Pinjaman, Lainnya)
- 2 plan categories (Pendapatan Rencana, Pengeluaran Rencana)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/categories` | List all |
| GET | `/api/management-financial/categories/summary` | Summary stats |
| GET | `/api/management-financial/categories/{id}` | Detail |
| POST | `/api/management-financial/categories` | Create |
| PUT | `/api/management-financial/categories/{id}` | Update |
| DELETE | `/api/management-financial/categories/{id}` | Soft delete |

#### 3.5.2 Financial Simulation
**CRUD Operations**: Create, Read, Update, Delete (Soft Delete)

**Fields per Transaction:**
- Category (linked to FinancialCategory)
- Amount, Date, Description
- Year (integer)
- Is Recurring (boolean), Recurring Frequency

**Features:**
- Multi-year support with year management (add/remove years)
- Cash flow summary per year
- Monthly comparison charts
- Filter by year, category, type
- Batch data generation in seeder (6 months of random transactions)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/simulations` | List all |
| GET | `/api/management-financial/simulations/{id}` | Detail |
| POST | `/api/management-financial/simulations` | Create |
| PUT | `/api/management-financial/simulations/{id}` | Update |
| DELETE | `/api/management-financial/simulations/{id}` | Soft delete |
| GET | `/api/management-financial/simulations/available-years` | Available years |
| GET | `/api/management-financial/simulations/cash-flow-summary` | Cash flow summary |
| GET | `/api/management-financial/simulations/monthly-comparison` | Monthly comparison |

#### 3.5.3 Financial Summary
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Month, Year, Business Background
- **Cash Flow**: Beginning Balance, Cash In, Cash Out, Ending Balance
- **Income Statement**: Operating Revenue, COGS, Operating Expense, Interest Expense, Tax Expense, Gross Profit, Operating Profit, Net Profit
- **Balance Sheet**: Total Assets, Total Liabilities, Total Equity

**Special Features:**
- Auto-generate from simulation data (`POST /api/management-financial/summaries/generate-from-simulations`)
- Summary statistics (`GET /api/management-financial/summaries/statistics`)
- Monthly comparison (`GET /api/management-financial/summaries/monthly-comparison`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/summaries` | List all |
| GET | `/api/management-financial/summaries/statistics` | Summary statistics |
| GET | `/api/management-financial/summaries/monthly-comparison` | Monthly comparison |
| POST | `/api/management-financial/summaries/generate-from-simulations` | Auto-generate |
| GET | `/api/management-financial/summaries/{id}` | Detail |
| POST | `/api/management-financial/summaries` | Create |
| PUT | `/api/management-financial/summaries/{id}` | Update |
| DELETE | `/api/management-financial/summaries/{id}` | Delete |

#### 3.5.4 Financial Projections
**CRUD + Delete**

**Fields:**
- Projection Name, Base Year
- Scenario Type: `optimistic`, `realistic`, `pessimistic`
- Growth Rate, Inflation Rate, Discount Rate (percentages)
- Initial Investment, Current Cash Balance
- Base Revenue, Base Cost, Base Net Profit
- **Yearly Projections** (JSON array): year, revenue, cost, net_profit
- Calculated: ROI, NPV, IRR, Payback Period

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/projections` | List all |
| GET | `/api/management-financial/projections/baseline` | Get baseline data |
| GET | `/api/management-financial/projections/{id}` | Detail |
| POST | `/api/management-financial/projections` | Create |
| DELETE | `/api/management-financial/projections/{id}` | Delete |

#### 3.5.5 Monthly Reports
- Consolidated monthly report view
- Select month/year
- Income breakdown by category
- Expense breakdown by category
- Profit/loss calculation
- Trend charts
- Print functionality

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/reports/monthly` | Get monthly report |

#### 3.5.6 Export PDF (Financial Report + Combined)
- **Financial Report PDF**: `POST /api/management-financial/pdf/generate`
- **Combined PDF** (Business Plan + Financial Report): `POST /api/management-financial/pdf/generate-combined`
- **PDF Statistics**: `GET /api/management-financial/pdf/statistics`
- Free mode: includes "SmartPlan" watermark
- Pro mode: no watermark (requires active subscription)
- Triggers Pro payment modal if no subscription

---

### 3.6 Forecast Module (AI Financial Forecasting)

> **Note:** Forecast routes are nested under the `/api/management-financial/forecast/` prefix in the API.

#### 3.6.1 Forecast Data
**CRUD Operations**: Create, Read, Update, Delete

**Fields:**
- Year, Month (nullable for annual)
- Income Sales, Income Other
- Expense Operational, Expense Other
- Seasonal Factor (multiplier, default 1.0)
- Notes

**Features:**
- Import from financial simulation data (`POST /api/management-financial/forecast/import-from-simulation`)
- Generate from simulation data (`POST /api/management-financial/forecast/generate-from-simulation`)
- Annual (Tahunan) forecast creation
- Available simulation years (`GET /api/management-financial/forecast/simulation-years`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/management-financial/forecast` | List all |
| POST | `/api/management-financial/forecast` | Create |
| GET | `/api/management-financial/forecast/{forecastData}` | Detail |
| PUT | `/api/management-financial/forecast/{forecastData}` | Update |
| DELETE | `/api/management-financial/forecast/{forecastData}` | Delete |
| GET | `/api/management-financial/forecast/simulation-years` | Available simulation years |
| POST | `/api/management-financial/forecast/import-from-simulation` | Import from simulation |
| POST | `/api/management-financial/forecast/generate-from-simulation` | Generate from simulation |

#### 3.6.2 Forecast Results (Auto-generated)
**Fields per Result:**
- Month, Year
- Forecast Income, Forecast Expense, Forecast Profit
- Forecast Margin (percentage)
- Confidence Level (default 85%)
- Method (default `arima`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/management-financial/forecast/{forecastData}/generate` | Generate forecast |
| GET | `/api/management-financial/forecast/{forecastData}/results` | Get results |
| GET | `/api/management-financial/forecast/available-years` | Available years |
| POST | `/api/management-financial/forecast/compare` | Compare scenarios |

#### 3.6.3 Forecast Insights (Auto-generated)
**Fields:**
- Insight Type: `peak_income`, `peak_expense`, `loss_risk`, `break_even`, `max_margin`, `growth_rate`
- Title, Description, Value
- Severity: `positive`, `warning`, `critical`, `info`

**Features:**
- Generate forecast from simulation data
- Line and bar charts for forecast visualization
- Export forecast to PDF (`POST /api/management-financial/forecast/{forecastData}/export-pdf`)
- PDF statistics (`GET /api/management-financial/forecast/export-pdf/statistics`)
- Year-over-year comparison

---

### 3.7 Affiliate System

#### 3.7.1 Affiliate Link Management
- Each user gets one unique affiliate link (`/affiliate/{slug}`)
- Custom slug editing (`PUT /api/affiliate/slug`)
- Toggle link active/inactive (`PATCH /api/affiliate/{affiliateLink}/toggle-active`)
- Get current user's link (`GET /api/affiliate/my-link`)
- Track clicks and referral registrations

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/affiliate/my-link` | Get user's affiliate link |
| PUT | `/api/affiliate/slug` | Update custom slug |
| PATCH | `/api/affiliate/{affiliateLink}/toggle-active` | Toggle active/inactive |

#### 3.7.2 Commissions
- Earned when referred users make Pro purchases
- Commission statistics dashboard (`GET /api/affiliate/commissions/statistics`)
- Commission history with status tracking (`GET /api/affiliate/commissions/history`)
- Withdrawable balance calculation (`GET /api/affiliate/commissions/withdrawable`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/affiliate/commissions/statistics` | Commission stats |
| GET | `/api/affiliate/commissions/history` | Commission history |
| GET | `/api/affiliate/commissions/withdrawable` | Withdrawable balance |

#### 3.7.3 Withdrawals
- Request withdrawal of earned commissions (`POST /api/affiliate/withdraw`)
- Via SingaPay disbursement (Payout Service)
- Withdrawal history tracking (`GET /api/affiliate/withdrawals`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/affiliate/withdraw` | Request withdrawal |
| GET | `/api/affiliate/withdrawals` | Withdrawal history |

---

### 3.8 Pro Subscription (Payment)

#### 3.8.1 Packages
| Plan | Price | Duration |
|------|-------|----------|
| Monthly | Rp 200,000 | 30 days |
| Yearly | Rp 1,680,000 | 365 days |

#### 3.8.2 Payment Flow
1. User clicks "Pro" on Export PDF page
2. Payment modal opens (3 steps):
   - **Step 1**: Select package (monthly/yearly)
   - **Step 2**: Choose payment method
   - **Step 3**: Redirect to SingaPay or show payment details
3. Frontend polls payment status every 5 seconds
4. Webhook confirms payment → activates subscription
5. User redirected to `/payment/success`

#### 3.8.3 Payment Methods
- **Virtual Account**: BRI, BNI, Danamon, Maybank
- **QRIS**: Scan with any e-wallet or mobile banking

#### 3.8.4 Subscription Status
- Stored on User model: `pdf_access_active`, `pdf_access_expires_at`, `pdf_access_package`
- Checked via `User::hasPdfProAccess()` method
- Pro badge displayed in Header and Profile

#### 3.8.5 Payment API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment/packages` | List available packages |
| GET | `/api/payment/subscription` | Current subscription status |
| GET | `/api/payment/check-access` | Check Pro access |
| POST | `/api/payment/purchase` | Initiate purchase |
| GET | `/api/payment/status/{transactionCode}` | Check payment status |
| POST | `/api/payment/cancel/{transactionCode}` | Cancel payment |
| GET | `/api/payment/history` | Transaction history |

#### 3.8.6 SingaPay Operating Modes
| Mode | Description | Use Case |
|------|-------------|----------|
| `mock` | Local mock mode with auto-approve | Local development & testing |
| `sandbox` | SingaPay sandbox environment | Staging/integration testing |
| `production` | Live SingaPay API | Production deployment |

**Mock Mode Features:**
- Auto-approve delay (configurable, default 5s)
- Success rate simulation (configurable, default 100%)
- Response delay simulation (configurable, default 1s)
- Verbose logging

---

### 3.9 Admin Panel (Admin Role Only)

#### 3.9.1 Admin Dashboard (activeSubSection: `admin-stats`)
**Statistics Cards:**
- Total Users, Active Users, Banned Users, Inactive Users
- Verified Users, Unverified Users
- Admin Count, Pro Subscribers
- 7-day Growth, 30-day Growth

**Charts:**
- Registration trend (12 months bar/grid chart)
- Subscription distribution

**API**: `GET /api/admin/dashboard-stats`

#### 3.9.2 User Management (activeSubSection: `admin-users`)
**Features:**
- Paginated user table (15 per page)
- Search by name, username, or phone
- Filter by: role, account_status, phone_verified, is_pro
- Sort by: name, username, created_at
- User detail modal on click

**Actions:**
- View user details (`GET /api/admin/users/{id}`)
- Update user info (`PUT /api/admin/users/{id}`)
- Update user password (`PUT /api/admin/users/{id}/password`)
- Change user status: active ↔ banned ↔ inactive (`PUT /api/admin/users/{id}/status`)
- Change user role: user ↔ admin (with self-demotion prevention) (`PUT /api/admin/users/{id}/role`)

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard-stats` | Dashboard statistics |
| GET | `/api/admin/users` | Paginated list with search/filter/sort |
| GET | `/api/admin/users/{id}` | User detail |
| PUT | `/api/admin/users/{id}` | Update user info |
| PUT | `/api/admin/users/{id}/password` | Update user password |
| PUT | `/api/admin/users/{id}/status` | Change account status |
| PUT | `/api/admin/users/{id}/role` | Change user role |

---

### 3.10 User Profile

#### 3.10.1 Profile View
- Display: name, username, phone, role, account status
- Pro subscription status and expiry
- Registration date
- Phone verification status

#### 3.10.2 Profile Edit
- Update: name, username, phone
- Upload profile photo
- Change password (requires current password)

---

### 3.11 Dark Mode
- Toggle via header button (sun/moon icon)
- Persisted in localStorage (`theme` key)
- Applied via Tailwind CSS `dark:` variants
- System preference detection on first visit (`prefers-color-scheme: dark`)
- State passed through props from `AppContent` to all pages

---

### 3.12 Notifications
- **Toast notifications** via react-toastify
- Position: top-right
- Auto-close: 3 seconds
- Theme: colored
- Used for success, error, warning, and info messages throughout the app

---

### 3.13 WhatsApp Widget
- Floating WhatsApp button on public pages
- Click to open WhatsApp chat with configured business number
- Displayed via `WhatsAppWidget.jsx` component in Layout

---

## 4. API Architecture

### 4.1 Base URL
- Development: `http://localhost:8000/api`
- Production: `https://{domain}/api`

### 4.2 Authentication
- All protected endpoints require `Authorization: Bearer {token}` header
- Token obtained via login or OTP verification
- Token revoked on logout or account status change

### 4.3 Middleware Stack
```
Public routes: no middleware
Auth routes: auth:sanctum → account.active → cors
Admin routes: auth:sanctum → account.active → admin
```

**Custom Middleware:**
| Middleware | File | Description |
|-----------|------|-------------|
| `account.active` | `EnsureAccountActive.php` | Checks user status is `active`; revokes token if banned/inactive |
| `admin` | `AdminMiddleware.php` | Checks if user has `admin` role |
| `cors` | `CorsMiddleware.php` | CORS headers (allowed origins from env) |

### 4.4 Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### 4.5 Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["validation error"] }
}
```

### 4.6 CORS Configuration
- Preflight (`OPTIONS`) handler for all routes
- Allowed origins configured via `FRONTEND_URL` env variable
- Default fallback: `http://localhost:5173`, `http://localhost:3000`
- Supports credentials (`Access-Control-Allow-Credentials: true`)

### 4.7 Webhook Endpoints (No Auth — Public)
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/api/webhook/singapay/payment` | 60/min | Payment webhook |
| POST | `/api/webhook/singapay/virtual-account` | 60/min | VA webhook |
| POST | `/api/webhook/singapay/qris` | 60/min | QRIS webhook |
| POST | `/api/webhook/singapay/disbursement` | 60/min | Withdrawal/payout webhook |
| POST | `/api/webhook/singapay/test` | 10/min | Test webhook (mock only) |

### 4.8 Debug/Test Endpoints (APP_DEBUG=true only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test/singapay/token` | Test access token |
| GET | `/api/test/singapay/config` | Test configuration |
| POST | `/api/test/singapay/clear-cache` | Clear SingaPay cache |

### 4.9 Web Routes (Non-API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Laravel welcome view |
| GET | `/get-image/{path}` | Storage proxy (MIME detection + content serving) |
| GET | `/storage/{path}` | Direct file serving from public disk |
| GET | `/debug-storage` | Debug storage configuration (temporary) |

### 4.10 Endpoint Count Summary
| Category | Count | Auth Required |
|----------|-------|---------------|
| Auth (register, login, OTP, password) | 7 | No |
| User Session (logout, me) | 2 | Yes |
| Business Background | 6 | Yes |
| Market Analysis | 6 | Yes |
| Product & Service | 8 | Yes |
| Marketing Strategy | 5 | Yes |
| Operational Plan | 8 | Yes |
| Team Structure | 11 | Yes |
| PDF Business Plan | 3 | Yes |
| Management Financial Dashboard | 1 | Yes |
| Financial Categories | 6 | Yes |
| Financial Simulation | 8 | Yes |
| Financial Summary | 8 | Yes |
| Financial Projections | 5 | Yes |
| Monthly Reports | 1 | Yes |
| Financial PDF Export | 3 | Yes |
| Forecast Data | 8 | Yes |
| Forecast Results | 4 | Yes |
| Forecast PDF | 2 | Yes |
| Payment / Subscription | 7 | Yes |
| Affiliate Link | 3 | Yes |
| Affiliate Commission | 3 | Yes |
| Affiliate Withdrawal | 2 | Yes |
| Admin | 7 | Yes (admin) |
| Webhooks | 5 | No |
| Debug/Test | 3 | No |
| **Total** | **~132** | |

---

## 5. Database Schema

### 5.1 Core Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `users` | User accounts with auth, profile, role, subscription fields | Root entity |
| `personal_access_tokens` | Sanctum authentication tokens | belongsTo User |
| `password_reset_tokens` | Password reset tokens | — |
| `sessions` | Session management | — |
| `cache` | Database cache storage | — |
| `jobs` / `job_batches` / `failed_jobs` | Queue system | — |

### 5.2 Business Plan Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `business_backgrounds` | Company info, vision, mission, logo, bg image, org chart | belongsTo User |
| `market_analyses` | Market analysis with SWOT, TAM/SAM/SOM | belongsTo User, BusinessBackground |
| `market_analysis_competitors` | Individual competitor entries | belongsTo MarketAnalysis |
| `product_services` | Products and services with BMC | belongsTo User, BusinessBackground |
| `marketing_strategies` | Marketing plans | belongsTo User, BusinessBackground |
| `operational_plans` | Operations with employees, suppliers (JSON) | belongsTo User, BusinessBackground |
| `team_structures` | Team members with salary, jobdesk, photo | belongsTo User, BusinessBackground, OperationalPlan |
| `financial_plans` | Financial plan with CAPEX, OPEX, projections | belongsTo User, BusinessBackground |

### 5.3 Financial Management Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `financial_categories` | Income/expense categories (soft delete) | belongsTo User |
| `financial_simulations` | Individual transactions (soft delete) | belongsTo User, FinancialCategory |
| `financial_summaries` | Monthly summary with P&L, cash flow, balance sheet | belongsTo User, BusinessBackground |
| `financial_projections` | Multi-year projections with scenarios | belongsTo User, BusinessBackground |

### 5.4 Forecast Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `forecast_data` | Historical data for forecasting | belongsTo User |
| `forecast_results` | AI-generated predictions | belongsTo ForecastData |
| `forecast_insights` | Auto-generated insights | belongsTo ForecastData |

### 5.5 Payment Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `premium_pdfs` | Subscription packages (monthly/yearly) | — |
| `pdf_purchases` | User purchase records | belongsTo User, PremiumPdf |
| `payment_transactions` | Payment details (VA, QRIS, SingaPay) | belongsTo PdfPurchase |
| `pdf_export_requests` | PDF export request tracking | belongsTo User |
| `singapay_payments` | SingaPay-specific payment records | — |

### 5.6 Affiliate Tables
| Table | Description | Key Relations |
|-------|-------------|---------------|
| `affiliate_links` | User affiliate links with slug | belongsTo User |
| `affiliate_commissions` | Commission records | belongsTo User (affiliate + buyer) |
| `affiliate_withdrawals` | Withdrawal requests | belongsTo User |

### 5.7 Migration History
Total migrations: **43** (including schema updates and field additions).

Key evolution:
1. Core tables (users, cache, jobs, tokens, sessions)
2. Business plan tables (backgrounds → market → product → marketing → operational → team → financial)
3. Financial management tables (categories → simulations → summaries → projections)
4. Affiliate links and referral tracking
5. Forecast tables (data → results → insights)
6. Payment tables (premium_pdfs → purchases → transactions)
7. SingaPay-specific tables
8. Incremental field additions (year, category_subtype, jobdesk, salary, org_chart_image, pdf_access, referred_by, role)

---

## 6. Database Seeders

| Seeder | Description | Dependencies |
|--------|-------------|--------------|
| `DatabaseSeeder` | Master seeder orchestrating all others | — |
| `UserSeeder` | Creates admin + test user accounts | — |
| `BusinessBackgroundSeeder` | Sample business background data | UserSeeder |
| `MarketAnalysisSeeder` | Sample market analysis data | BusinessBackgroundSeeder |
| `MarketAnalysisCompetitorSeeder` | Sample competitor data | MarketAnalysisSeeder |
| `ProductServiceSeeder` | Sample products and services | BusinessBackgroundSeeder |
| `MarketingStrategySeeder` | Sample marketing strategies | BusinessBackgroundSeeder |
| `OperationalPlanSeeder` | Sample operational plans | BusinessBackgroundSeeder |
| `TeamStructureSeeder` | Sample team members | BusinessBackgroundSeeder |
| `FinancialPlanSeeder` | Sample financial plans | BusinessBackgroundSeeder |
| `FinancialCategorySeeder` | Default 18 categories per user | UserSeeder |
| `FinancialSimulationSeeder` | 6 months of random transactions | FinancialCategorySeeder |
| `FinancialSummarySeeder` | Sample monthly summaries | UserSeeder |
| `PremiumPdfSeeder` | Monthly + yearly subscription packages | — |
| `AffiliateLinkSeeder` | Initial affiliate links | UserSeeder |
| `MarketAnalysisSeeder_Compact` | Alternative compact seeder | MarketAnalysisSeeder |

---

## 7. Environment Configuration

### 7.1 Application Settings
| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | SmartPlan |
| `APP_ENV` | Environment | production |
| `APP_DEBUG` | Debug mode | false |
| `APP_TIMEZONE` | Server timezone | Asia/Jakarta |
| `APP_URL` | Application base URL | https://your-domain.com |
| `FRONTEND_URL` | Frontend SPA URL | http://localhost:5173 |

### 7.2 Database
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_CONNECTION` | Database driver | sqlite |
| `DB_HOST` | Database host | 127.0.0.1 |
| `DB_DATABASE` | Database name | laravel |

### 7.3 Fonnte WhatsApp API
| Variable | Description |
|----------|-------------|
| `FONNTE_API_URL` | API base URL (`https://api.fonnte.com`) |
| `FONNTE_API_KEY` | API key from Fonnte dashboard |

### 7.4 SingaPay Configuration
| Variable | Description | Notes |
|----------|-------------|-------|
| `SINGAPAY_MODE` | Operating mode | `mock` / `sandbox` / `production` |
| `SINGAPAY_PARTNER_ID` | Partner identifier | Required for sandbox/production |
| `SINGAPAY_CLIENT_ID` | OAuth client ID | Required for sandbox/production |
| `SINGAPAY_CLIENT_SECRET` | OAuth client secret | Required for sandbox/production |
| `SINGAPAY_MERCHANT_ACCOUNT_ID` | Merchant account | Required for sandbox/production |
| `SINGAPAY_SANDBOX_URL` | Sandbox API URL | `https://sandbox-payment-b2b.singapay.id` |
| `SINGAPAY_PRODUCTION_URL` | Production API URL | `https://payment-b2b.singapay.id` |
| `SINGAPAY_WEBHOOK_SECRET` | HMAC-SHA256 secret | For webhook signature validation |
| `SINGAPAY_VA_EXPIRY_HOURS` | VA expiration | Default: 24 hours |
| `SINGAPAY_VA_BANKS` | Supported VA banks | `BRI,BNI,DANAMON,MAYBANK` |
| `SINGAPAY_QRIS_EXPIRY_HOURS` | QRIS expiration | Default: 1 hour |
| `SINGAPAY_ENABLE_DISBURSEMENT` | Affiliate payout flag | Default: true |
| `SINGAPAY_MOCK_AUTO_APPROVE_DELAY` | Mock mode auto-approve seconds | Default: 5 |
| `SINGAPAY_MOCK_SUCCESS_RATE` | Mock mode success percentage | Default: 100 |

### 7.5 Frontend Environment
| Variable | File | Description |
|----------|------|-------------|
| `VITE_API_BASE_URL` | `.env` / `.env.development` | Backend API base URL |
| `BASE_URL` | Vite config | `/` (dev) or `/grapadistrategix/` (production) |

---

## 8. Deployment

### 8.1 Build & Preview Commands
**Backend:**
```bash
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run build          # Production build → dist/
npm run preview        # Preview production build
npm run dev            # Development server (port 5173)
```

### 8.2 Development Server
```bash
# Combined (from backend directory):
composer dev
# Runs: Laravel serve + queue listener + log tailing + Vite dev server
```

### 8.3 File Storage
- **Disk**: `public` (Laravel Storage)
- **Subdirectories**: `logos/`, `photos/`, `workflows/`, `org-charts/`
- **Access routes**: `/get-image/{path}` (proxy) or `/storage/{path}` (direct)

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Frontend bundle split into 4 vendor chunks (React, MUI, Charts, Utils)
- Page components lazy-loaded with React.lazy + Suspense
- Vite 7 with Tailwind CSS 4 plugin for optimized builds
- SingaPay token caching with configurable TTL (default 3000s)
- SingaPay retry configuration (max 3 attempts, 1000ms delay)

### 9.2 Security
- Account status checked on login AND on every authenticated request (middleware)
- Token revoked immediately when user is banned/inactive
- Admin routes protected by triple middleware (auth + account.active + admin)
- CSRF protection via Sanctum
- Webhook signature validation (HMAC-SHA256) for SingaPay
- Webhook rate limiting (60 requests/minute, 10/min for test endpoint)
- Webhook IP whitelisting (optional, configurable via `SINGAPAY_WEBHOOK_IP_WHITELIST`)
- CORS origin whitelisting with credentials support
- Hidden user fields: password, remember_token, otp_code, reset_otp_code
- OTP expiry: 10 minutes

### 9.3 Localization
- UI language: **Bahasa Indonesia** (Indonesian)
- Currency: **IDR (Rupiah)**
- Phone format: Indonesian (+62 / 628xxx)
- Date format: Indonesian locale
- Timezone: Asia/Jakarta (UTC+7)

### 9.4 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- Responsive design (mobile-first with Tailwind CSS breakpoints)

---

## 10. Known Limitations & Future Considerations

| # | Limitation | Impact | Location |
|---|-----------|--------|----------|
| 1 | WhatsApp OTP requires valid Fonnte API key (placeholder in dev) | Registration/password reset OTP not sent in dev | `backend/.env` |
| 2 | SingaPay credentials are placeholders in example config | Pro payment flow non-functional without real keys (use `mock` mode for dev) | `backend/.env` |
| 3 | SQLite-specific `strftime` in AdminController | Will break on MySQL/PostgreSQL without adaptation | `AdminController.php` |
| 4 | Two chart libraries (chart.js + recharts) coexist | Larger bundle size (~550 KB for charts alone) | Multiple components |
| 5 | react-icons/fa kept for 2 files (brand icons) | Minor — no lucide-react equivalent | WhatsAppWidget, Footer |
| 6 | User dummy data incomplete for pandu123 | Only financial data seeded, no business plan data | Seeders |
| 7 | UserSeeder uses `create()` not `updateOrCreate()` | UNIQUE constraint error on re-seeding | `UserSeeder.php` |
| 8 | Financial Plan module disabled (routes commented out) | 9 frontend components + backend model exist but API routes inactive | `api.php` line 147-167 |
| 9 | Debug storage route exposed in web.php | Should be removed or protected in production | `web.php` line 51-73 |
| 10 | Production base path hardcoded as `/grapadistrategix/` | Must match hosting subdirectory; needs env variable for flexibility | `vite.config.js` |
| 11 | phpoffice/phpword and ilovepdf packages installed | Unclear if actively used; may be for future Word export features | `composer.json` |

---

## 11. Test Accounts

| Role | Username | Password | Phone |
|------|----------|----------|-------|
| Admin | `admin` | `admin123` | 628000000000 |
| User | `pandu123` | `password` | 628123456789 |

---

## 12. Frontend Route Map

| Route | Component | Auth | Description |
|-------|-----------|------|-------------|
| `/` | `LandingPage` | Public | Homepage with hero, features, pricing |
| `/features` | `FeaturesPage` | Public | Features showcase |
| `/pricing` | `PricingPage` | Public | Pricing comparison |
| `/faq` | `FAQ` | Public | FAQ accordion |
| `/terms` | `Terms` | Public | Terms & conditions |
| `/login` | `Login` | PublicRoute | Login form (redirects to dashboard if authenticated) |
| `/register` | `Register` | PublicRoute | Registration form |
| `/verify-otp` | `OtpVerification` | VerificationRoute | OTP verification (both auth/unauth) |
| `/forgot-password` | `ForgotPassword` | PublicRoute | Forgot password flow |
| `/reset-password` | `ResetPassword` | PublicRoute | Reset password form |
| `/dashboard/*` | `Dashboard` | ProtectedRoute | Main dashboard (state-based navigation) |
| `/payment/success` | `PaymentSuccess` | Public | Payment success callback |
| `/affiliate/:slug` | `AffiliateLinkRedirect` | Public | Affiliate link tracking + redirect |
| `*` (catch-all) | `NavigateToCorrectRoot` | — | Redirects to `/` or `/dashboard` |

---

*Document generated: March 7, 2026*
*Version: 2.0 — Comprehensive audit from codebase*
