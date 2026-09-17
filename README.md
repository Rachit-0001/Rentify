# 🏠 Rentify — Rental Management System

Rentify is a web-based rental management system built to simplify property, tenant, billing, and payment management.

The application allows property owners to manage rental properties and tenants, generate monthly bills based on rent, water charges, electricity consumption and previous balances, record payments, and generate printable payment receipts.

---

## ✨ Features

### 👤 Authentication
- Owner and Tenant roles
- Session-based authentication using `express-session`
- Password hashing using `bcryptjs`
- Role-based dashboard redirection
- Logout functionality

### 🏢 Property Management
- Add properties
- View properties
- Track property status
- Mark properties as `Vacant` or `Occupied`
- Delete properties

### 👥 Tenant Management
- Add tenants
- Assign tenants to properties
- Automatically mark assigned properties as occupied
- Create tenant login credentials
- View tenant details

### 💰 Billing Management
- Generate monthly bills
- Calculate electricity consumption
- Calculate electricity charges
- Include rent and water charges
- Carry forward previous balances
- Track total bill amount
- Track amount paid and remaining balance
- Track bill status

### 💳 Payment Management
- Record payments against bills
- Store payment mode
- Generate receipt numbers
- Update bill balances
- Maintain payment history
- Support paid, partial and advance payment states

### 🧾 Receipts
- View payment receipts
- Display payment information
- Print receipts directly from the browser

### 📊 Dashboard
- Total properties
- Occupied properties
- Vacant properties
- Total tenants
- Total bills
- Total payment collection
- Pending balances
- MongoDB aggregation for dashboard totals

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express.js |
| Frontend | EJS |
| UI | HTML, CSS, Bootstrap |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | Express Session |
| Password Hashing | bcryptjs |
| Configuration | dotenv |

---

# 🏗️ Architecture

Rentify follows a server-rendered **Express + EJS + MongoDB** architecture.

```text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Browser    │
                    │   EJS / HTML  │
                    └───────┬───────┘
                            │
                       HTTP Request
                            │
                            ▼
                    ┌───────────────┐
                    │    Express    │
                    │   server.js   │
                    └───────┬───────┘
                            │
                       Route Handler
                            │
                            ▼
                    ┌───────────────┐
                    │    Mongoose   │
                    │     Models    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    MongoDB    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │     EJS       │
                    │    View       │
                    └───────┬───────┘
                            │
                            ▼
                         Browser
```

---

# 📂 Project Structure

```text
Rentify/
│
├── models/
│   ├── User.js
│   ├── Property.js
│   ├── Tenant.js
│   ├── Bill.js
│   ├── Payment.js
│   └── Agreement.js
│
├── views/
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── properties.ejs
│   ├── tenants.ejs
│   ├── tenantDetails.ejs
│   ├── tenantDashboard.ejs
│   ├── bills.ejs
│   ├── payment.ejs
│   ├── receipt.ejs
│   ├── addProperty.ejs
│   ├── addTenant.ejs
│   └── addBill.ejs
│
├── public/
│   └── css/
│       └── style.css
│
├── server.js
├── package.json
├── .gitignore
└── .env
```

> Never commit `.env` to GitHub. Keep credentials and secrets in environment variables.

---

# 🗄️ Database Design

Rentify uses **MongoDB with Mongoose**.

The project contains six Mongoose models:

```text
User
Property
Tenant
Bill
Payment
Agreement
```

## Database Relationship

```text
┌──────────────┐
│     User     │
├──────────────┤
│ username     │
│ password     │
│ role         │
│ tenant       │──────────────┐
└──────────────┘              │
                              ▼
                       ┌──────────────┐
                       │    Tenant    │
                       ├──────────────┤
                       │ name         │
                       │ phone        │
                       │ property     │──────────────┐
                       │ joinDate     │              │
                       │ active       │              ▼
                       └──────┬───────┘       ┌──────────────┐
                              │               │   Property   │
                              │               ├──────────────┤
                              ▼               │ propertyNo   │
                       ┌──────────────┐       │ type         │
                       │     Bill     │       │ rent         │
                       ├──────────────┤       │ waterCharge  │
                       │ tenant       │       │ status       │
                       │ month        │       └──────────────┘
                       │ year         │
                       │ totalBill    │
                       │ amountPaid   │
                       │ balance      │
                       │ status       │
                       └──────┬───────┘
                              │
                              │ bill
                              ▼
                       ┌──────────────┐
                       │   Payment    │
                       ├──────────────┤
                       │ bill         │
                       │ amount       │
                       │ paymentMode  │
                       │ receiptNo    │
                       │ paymentDate  │
                       └──────────────┘
```

### Relationships

- `User → Tenant`
- `Tenant → Property`
- `Bill → Tenant`
- `Payment → Bill`
- `Agreement → Tenant`
- `Agreement → Property`

Mongoose `populate()` is used to retrieve referenced documents.

---

# 🔐 Authentication Flow

Rentify uses **session-based authentication**, not JWT.

```text
User
 │
 ▼
Login Form
 │
 │ POST /login
 ▼
Express Route
 │
 ▼
User.findOne()
 │
 ▼
MongoDB
 │
 ▼
bcrypt.compare()
 │
 ├─────────────── Invalid
 │                    │
 │                    ▼
 │               Login Error
 │
 └─────────────── Valid
                      │
                      ▼
                Create Session
                      │
                ┌─────┴─────┐
                ▼           ▼
              userId       role
                │           │
                └─────┬─────┘
                      ▼
                  Role Check
                 ┌────┴────┐
                 ▼         ▼
               Owner     Tenant
                 │         │
                 ▼         ▼
             Dashboard  Tenant Dashboard
```

Passwords are hashed with `bcryptjs` before storage.

---

# 🏢 Tenant Creation Flow

```text
Add Tenant Form
       │
       ▼
POST /tenant/add
       │
       ▼
Create Tenant
       │
       ▼
Update Property
       │
       ▼
Property = Occupied
       │
       ▼
Hash Password
       │
       ▼
Create User
       │
       ▼
Link User → Tenant
       │
       ▼
Tenant Created
```

The current implementation uses the tenant's phone number as the username when creating the tenant's login.

---

# 💰 Billing System

Rentify calculates electricity consumption from meter readings.

### Electricity Units

```text
Units Consumed
      =
Current Reading - Previous Reading
```

### Electricity Bill

```text
Electricity Bill
      =
Units Consumed × Electricity Rate
```

### Total Bill

```text
Total Bill
      =
Rent
+
Water Charge
+
Electricity Bill
+
Previous Balance
```

### Complete Billing Flow

```text
Tenant
  │
  ▼
Property Information
  │
  ▼
Previous Bill
  │
  ▼
Previous Balance
  │
  ▼
Current Meter Reading
  │
  ▼
Calculate Units
  │
  ▼
Calculate Electricity Cost
  │
  ▼
Add Rent + Water + Electricity
  │
  ▼
Add Previous Balance
  │
  ▼
Create Bill
```

---

# 💳 Payment Flow

```text
Payment Form
      │
      ▼
POST /payment/:id
      │
      ▼
Find Bill
      │
      ▼
Read Payment Amount
      │
      ▼
Calculate New Balance
      │
      ▼
Create Payment Record
      │
      ▼
Update Bill
      │
      ├──────────┬───────────┐
      ▼          ▼           ▼
     Paid      Partial     Advance
      │          │           │
      └──────────┴───────────┘
                 │
                 ▼
             Save Bill
                 │
                 ▼
              Receipt
```

Payment records are stored separately from bills so that payment history can be maintained.

---

# 🧾 Receipt Flow

```text
Payment
   │
   ▼
GET /receipt/:paymentId
   │
   ▼
Find Payment
   │
   ▼
Retrieve Related Data
   │
   ▼
Render receipt.ejs
   │
   ▼
HTML Receipt
   │
   ▼
Browser Print
```

The current receipt is an HTML/EJS printable receipt.

> `pdfkit` appears in the dependency list, but actual PDF generation was not verified in the source code.

---

# 📡 Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Login page |
| POST | `/login` | User login |
| GET | `/logout` | Logout |
| GET | `/check-users` | Retrieve users |
| GET | `/create-owner` | Create owner |
| GET | `/dashboard` | Owner dashboard |
| GET | `/tenant-dashboard` | Tenant dashboard |
| GET | `/tenant-dashboard/:id` | Tenant dashboard by ID |
| GET | `/property/add` | Property form |
| POST | `/property/add` | Create property |
| GET | `/properties` | List properties |
| GET | `/property/delete/:id` | Delete property |
| GET | `/tenant/add` | Tenant form |
| POST | `/tenant/add` | Create tenant |
| GET | `/tenants` | List tenants |
| GET | `/tenant/:id` | Tenant details |
| GET | `/bill/add` | Bill form |
| POST | `/bill/add` | Generate bill |
| GET | `/bills` | List bills |
| GET | `/payment/:id` | Payment form |
| POST | `/payment/:id` | Record payment |
| GET | `/receipt/:paymentId` | Payment receipt |

---

# 📊 Dashboard

The owner dashboard provides:

- Total properties
- Occupied properties
- Vacant properties
- Total tenants
- Total bills
- Total payment collection
- Pending balances

MongoDB aggregation is used for dashboard totals.

```text
Payment Collection
       │
       ▼
Payment.aggregate()
       │
       ▼
$group + $sum
       │
       ▼
Total Collection
```

Similarly, bill balances can be aggregated to calculate pending amounts.

---

# 🔒 Security

## Implemented

- Password hashing with bcrypt
- Session-based authentication
- Environment variables using dotenv
- `.env` ignored through `.gitignore`

## Current Limitations

The current version should be hardened before production.

### Authentication Middleware

There is no dedicated authentication middleware that consistently protects all private routes.

### RBAC

Owner and Tenant roles exist, but there is no dedicated route-level RBAC middleware.

### Tenant Authorization

The route:

```text
/tenant-dashboard/:id
```

accepts a tenant ID directly. A production implementation should verify that the authenticated user is authorized to access that tenant.

### User Exposure

The `/check-users` route should not expose user information without authorization.

### Owner Creation

The `/create-owner` route should not remain publicly accessible in a production application.

### Input Validation

Stronger validation should be added for:

- payment amounts
- meter readings
- rent
- phone numbers
- IDs
- required fields

### Database Consistency

Operations that update multiple documents should use transactions or atomic operations where appropriate.

---

# 🧪 Testing

Automated testing is not currently implemented.

A future testing strategy could be:

```text
Unit Tests
    │
    ├── Bill calculations
    ├── Payment calculations
    └── Validation
          │
          ▼
Integration Tests
    │
    ├── Login
    ├── Tenant creation
    ├── Billing
    └── Payments
          │
          ▼
End-to-End Tests
```

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
```

## 2. Navigate to the project

```bash
cd Rentify
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create `.env`

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
PORT=3000
```

## 5. Start the server

```bash
node server.js
```

If a development script is configured:

```bash
npm run dev
```

## 6. Open the application

```text
http://localhost:3000
```

---

# 📁 Important Files

### `server.js`

Main application entry point containing:

- Express configuration
- Middleware
- MongoDB connection
- Session configuration
- Authentication
- Routes
- Business logic

### `models/User.js`

Defines user authentication data and roles.

### `models/Property.js`

Defines rental property data.

### `models/Tenant.js`

Defines tenant information and property reference.

### `models/Bill.js`

Defines monthly billing information.

### `models/Payment.js`

Defines payment records.

### `models/Agreement.js`

Defines agreement-related data. Complete agreement-management functionality was not verified in the current source.

### `views/`

Contains EJS templates rendered by Express.

### `public/css/style.css`

Contains application styling.

---

# 🧠 Key Technical Concepts

- Node.js backend development
- Express.js routing
- Server-side rendering
- EJS templates
- MongoDB
- Mongoose ODM
- MongoDB ObjectId references
- Mongoose `populate()`
- Session-based authentication
- Password hashing
- CRUD operations
- MongoDB aggregation
- Rental billing calculations
- Payment tracking
- Form processing
- Server-side business logic

---

# 🔮 Future Improvements

For a production-ready version, I would add:

- Dedicated authentication middleware
- Complete RBAC authorization
- Input validation
- Centralized error handling
- MongoDB transactions
- Atomic payment updates
- Secure session cookies
- CSRF protection
- Rate limiting
- Security headers
- Automated tests
- Logging and monitoring
- Pagination
- Database indexes
- Separate controllers and services
- Production deployment configuration
- PDF receipt generation

---

# 🏗️ Future Production Architecture

```text
                         Users
                           │
                           ▼
                    ┌──────────────┐
                    │Load Balancer │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │ Express App │          │ Express App │
       │   Server 1  │          │   Server 2  │
       └──────┬──────┘          └──────┬──────┘
              │                         │
              └────────────┬────────────┘
                           ▼
                  Authentication
                           │
                           ▼
                    Authorization
                           │
                           ▼
                     Controllers
                           │
                           ▼
                       Services
                           │
                           ▼
                       Mongoose
                           │
                           ▼
                        MongoDB
                           │
                    ┌──────┴──────┐
                    ▼             ▼
                 Logging      Monitoring
```

---

# 👨‍💻 Author

**Rachit Gangwar**

B.Tech — Computer Science & Engineering (Artificial Intelligence)

Noida Institute of Engineering & Technology (NIET)

---

# ⭐ Project Summary

Rentify combines:

```text
Properties
    +
Tenants
    +
Authentication
    +
Billing
    +
Payments
    +
Receipts
    +
Dashboard
```

The project demonstrates practical backend and full-stack web development using **Node.js, Express.js, EJS, MongoDB, Mongoose, Express Sessions and bcryptjs**.

---

## ⚠️ Implementation Accuracy

This README describes the implementation found in the current Rentify source.

The uploaded source does **not** verify the following technologies/features:

- React
- Vite
- Tailwind CSS
- MySQL
- JWT
- Gemini/AI
- Axios
- Dedicated RBAC middleware
- Dedicated controllers/services architecture
- Automated testing
- Docker
- Vercel/Render/Railway deployment

These should only be added to the README if they are actually implemented in the repository.
