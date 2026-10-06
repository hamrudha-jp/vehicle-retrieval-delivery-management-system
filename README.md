# Vehicle Retrieval and Delivery Management System (VRDMS)

VRDMS is a responsive full-stack platform designed to establish a digital chain of custody between vehicle owners and verified drivers when retrieving and delivering vehicles across dynamically selected locations.

---

## 📖 Project Overview

When a vehicle owner cannot personally retrieve their vehicle from a location (such as an airport, repair facility, parking terminal, or another city), VRDMS provides a secure platform to schedule vehicle retrieval requests, assign verified drivers, log pre-trip and post-trip vehicle conditions, perform OTP handovers, and track the request lifecycle through delivery confirmation, simulated payments, and driver reviews.

---

## 🎯 Problem Statement

Handing over a personal vehicle to an unfamiliar third-party driver poses significant trust, evidentiary, and operational challenges:
* **Lack of Handover Verification**: No simple way to ensure the vehicle is handed to the authorized driver.
* **Condition & Dispute Ambiguity**: Pre-existing vehicle damage or mileage disputes due to missing baseline inspection data.
* **Pricing & Route Opacity**: Lack of upfront transparent cost calculation for vehicle retrieval distances.
* **Accountability & Trust Deficit**: Absence of verified driver background profiles and post-delivery review history.

---

## 💡 Proposed Solution

VRDMS addresses these challenges by implementing a **Digital Chain-of-Custody** framework:
1. **Verified Driver Screening**: Drivers must submit professional profiles and obtain explicit Admin verification before viewing or accepting retrieval requests.
2. **Dual-Stage OTP Verification**: Dynamic 6-digit OTP codes required for both Pickup (Owner → Driver) and Delivery (Driver → Owner) handovers.
3. **Structured Vehicle Inspections**: Pre-Trip and Post-Trip vehicle condition logging (odometer readings, fuel level, notes, and photo references) establishing evidentiary documentation.
4. **Transparent Price & Distance Estimation**: Server-calculated route distance (Haversine formula + 1.25x road factor) and vehicle-type pricing multipliers.
5. **Controlled State Progression**: Strict backend state transitions (`CREATED` → `ACCEPTED` → `PICKUP_VERIFIED` → `IN_PROGRESS` → `DESTINATION_REACHED` → `DELIVERY_VERIFIED` → `DELIVERED`).
6. **Delivery Confirmation & Simulated Payments**: Owner delivery confirmation followed by automated billing logging and driver ratings.

*Note: VRDMS provides digital handover verification, evidentiary logging, and accountability. It is not a physical anti-theft system.*

---

## ✨ Key Features

### 👤 Vehicle Owner
* Account registration, login, and JWT session persistence.
* Vehicle management (Add/Remove vehicles with Make, Model, Reg Number, Year, Color, Type).
* Dynamic pickup and destination location selection with interactive Leaflet/OpenStreetMap preview.
* Real-time transparent route distance, travel duration, and cost estimation.
* Generation and viewing of 6-digit Pickup and Delivery OTPs.
* Inspection log viewing before starting and finishing transit.
* Final delivery confirmation action.
* Simulated payment processing (`UPI`, `CARD`, `NET_BANKING`, `CASH`).
* Driver rating (1–5 stars) and written feedback submission.

### 🚚 Driver
* Professional profile submission (License number, experience years, handled vehicle types).
* Profile verification status monitoring (`PENDING`, `APPROVED`, `REJECTED`).
* Browse available retrieval requests (Restricted to APPROVED drivers).
* Request acceptance and job assignment.
* OTP input and verification for Pickup and Delivery steps (with failed attempt limits & 15-minute expiration).
* Pre-Trip and Post-Trip inspection reporting (Odometer, fuel level, condition notes, photo references).
* Trip status progress updates (`IN_PROGRESS`, `DESTINATION_REACHED`).
* View aggregate rating score and owner feedback history.

### 🛡️ Admin
* System-wide operational dashboard.
* Pending driver verification approvals and rejection workflows.
* System-wide retrieval request monitoring table.
* Payment record auditing.
* Customer review and rating logs.

---

## 🔒 Security Implementation

* **JWT Authentication**: Stateless authentication via signed JSON Web Tokens (HMAC-SHA256) with 24-hour expiration.
* **Password Hashing**: Passwords encrypted using BCrypt (`BCryptPasswordEncoder`).
* **Role-Based Access Control (RBAC)**: Fine-grained access control for `OWNER`, `DRIVER`, and `ADMIN` roles enforced at both Security Filter Chain and method levels (`@PreAuthorize`).
* **IDOR Protection & Endpoint Authorization**: Backend checks in service layer ensuring users can only modify or view requests, payments, and inspections belonging to them.
* **OTP Security**: Dynamic 6-digit OTP tokens with 15-minute expiration, 5 max failed attempt lockouts, and single-use verification rules.
* **CORS Security**: Explicit allowed origin pattern matching (`${allowed.origins}`) with credential support.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite, JavaScript (ES6+)
* **Routing**: React Router DOM (v6)
* **HTTP Client**: Axios with request/response interceptors for JWT header management
* **Styling**: Vanilla CSS (Custom tokens, Glassmorphism, responsive CSS grid/flexbox)
* **Icons**: Lucide React
* **Maps**: Leaflet & React-Leaflet (OpenStreetMap tile rendering)

### Backend
* **Language & Framework**: Java 21, Spring Boot (v3.3.4)
* **Security**: Spring Security, Spring Boot Starter Validation
* **Data Access**: Spring Data JPA, Hibernate ORM
* **Build Tool**: Maven

### Database
* **Production/Dev**: PostgreSQL (via `org.postgresql.Driver` configured in `application.yml`)
* **Testing**: In-memory H2 Database (`jdbc:h2:mem:testdb`)

---

## 🔄 System Workflow

```
[Owner] Create Request & Select Locations
   │
   ▼
[Server] Calculate Distance, Duration & Cost Estimate
   │
   ▼
[Driver] Browse Jobs & Accept Request (Approved Drivers Only)
   │
   ▼
[Owner] Generate Pickup OTP ──► [Driver] Verify Pickup OTP
                                         │
                                         ▼
                               [Driver] Submit Pre-Trip Inspection
                                         │
                                         ▼
                               [Driver] Set Status: IN_PROGRESS
                                         │
                                         ▼
                               [Driver] Set Status: DESTINATION_REACHED
                                         │
[Owner] Generate Delivery OTP ◄──────────┘
   │
   ▼
[Driver] Verify Delivery OTP ──► [Driver] Submit Post-Trip Inspection
                                         │
                                         ▼
[Owner] Confirm Delivery ◄───────────────┘
   │
   ▼
[Owner] Complete Simulated Payment
   │
   ▼
[Owner] Submit Driver Review (1–5 Stars)
```

---

## 🏗️ Project Architecture

```
VRDMS Architecture
├── Frontend Client (React 18 / Vite)
│   ├── Pages (Auth, Owner, Driver, Admin)
│   ├── Components (InteractiveMap, LocationPicker, OtpCard, InspectionModal, PaymentReviewCard)
│   └── Services (Axios HTTP Client with JWT interceptor)
│
├── REST API Interface (Spring Boot Controllers)
│   ├── /auth/**, /vehicles/**, /requests/**, /drivers/**, /payments/**, /reviews/**, /admin/**
│
├── Service Layer (Business Logic & Security Validation)
│   ├── AuthService, VehicleService, RetrievalRequestService, OTPService,
│   │   InspectionService, PricingService, PaymentService, ReviewService
│
└── Database Layer (PostgreSQL / Spring Data JPA Entities)
    └── User, Vehicle, DriverProfile, RetrievalRequest, DriverAssignment,
        OTPVerification, VehicleInspection, Payment, DriverReview
```

---

## 💰 Pricing & Cost Estimation

* **Distance Calculation**: Haversine spherical distance formula between pickup and destination coordinates multiplied by a **1.25x road detour factor** to simulate actual road travel distances.
* **Duration Estimation**: Travel speed average (40 km/h) plus a 15-minute buffer.
* **Vehicle Multipliers**:
  * `SEDAN`: 1.0x (Base)
  * `SUV` / `TRUCK`: 1.25x
  * `HATCHBACK`: 0.95x
  * `BIKE` / `MOTORCYCLE`: 0.75x
* **Formula**: `Total Cost = (Base Service Fee ₹300 + [Distance (km) × ₹18/km]) × Vehicle Multiplier`
* *Note: Route distance and cost are server-calculated estimates, not live continuous GPS navigation.*

---

## 💳 Payment Processing

* Payment records are automatically initialized upon vehicle delivery confirmation based on the server-calculated cost.
* Vehicle Owners select a preferred payment method (`UPI`, `CARD`, `NET_BANKING`, `CASH`) and complete the transaction.
* *Note: Payment processing is SIMULATED for demonstration and audit compliance; no real third-party payment gateway keys or banking APIs are integrated.*

---

## ⚠️ Limitations

* **No Real-Time GPS Tracking**: System utilizes coordinate-based distance estimation; live telemetry/GPS tracking is not included in this release.
* **No Physical Anti-Theft Device**: System provides digital handover verification and evidentiary documentation, not physical engine locks or theft prevention hardware.
* **Simulated Payments**: Payment processing logs payment records without contacting live payment processors.
* **No Live SOS System**: Emergency alerts and live monitoring represent future production enhancements.

---

## 🚀 Future Scope

* Integration of continuous real-time GPS tracking and live map telemetry.
* Geofencing and route deviation alerts.
* Emergency SOS notification handling.
* Advanced KYC identity verification for drivers.
* Third-party vehicle insurance claim integration.
* Production integration with live payment gateways (e.g. Stripe / Razorpay).
* Cloud containerized deployment (Docker & Kubernetes).

---

## 💻 Setup Instructions

### Prerequisites
* Java 21 JDK
* Node.js (v18+) & npm
* PostgreSQL (or rely on default testing H2 database)
* Maven (or use embedded wrapper)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure environment variables (optional, defaults provided in `application.yml`):
   ```bash
   export DB_URL="jdbc:postgresql://localhost:5432/vrdms_db"
   export DB_USERNAME="postgres"
   export DB_PASSWORD="yourpassword"
   export JWT_SECRET="YourSuperSecretJWTKeyHere32BytesMinimum"
   ```
3. Compile the backend project:
   ```bash
   mvn clean compile
   ```
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will start on `http://localhost:8080`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🔑 Environment Variables

The application supports the following environment variables:

| Variable | Description | Default Fallback |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `8080` |
| `DB_URL` | PostgreSQL database connection URL | `jdbc:postgresql://localhost:5432/vrdms_db` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres123` |
| `JWT_SECRET` | HMAC-SHA256 signing key for JWT tokens | Pre-configured dev fallback key |
| `JWT_EXPIRATION` | JWT token expiration time in milliseconds | `86400000` (24 Hours) |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origin domains | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8080` |

---

## 📁 Project Structure

```
VRDMS/
├── backend/
│   ├── src/main/java/com/vehicle/retrieval/
│   │   ├── config/          # SecurityConfig, CorsConfig
│   │   ├── controller/      # Auth, Vehicle, Request, Driver, Payment, Review
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities (User, Vehicle, Request, OTP, Inspection, Payment, Review)
│   │   ├── exception/       # GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JWT Filter, UserPrincipal, JwtTokenProvider
│   │   └── service/         # Business services (Auth, Request, OTP, Inspection, Pricing, Payment, Review)
│   ├── src/main/resources/
│   │   └── application.yml  # Spring Boot Configuration
│   └── pom.xml              # Maven dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, InteractiveMap, LocationPicker, OtpCard, InspectionModal, PaymentReviewCard
│   │   ├── context/         # AuthContext (JWT & User state)
│   │   ├── pages/           # Admin, Auth, Driver, Owner pages
│   │   ├── routes/          # AppRoutes & ProtectedRoute guards
│   │   └── services/        # Axios API Client modules
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── test_phase4a.ps1         # Automated test script for Phase 4A workflow
├── test_phase4b.ps1         # Automated test script for Phase 4B route estimation
├── test_phase4c.ps1         # Automated test script for Phase 4C payment & review workflow
├── .gitignore               # Root git ignore rules
└── README.md                # Project documentation
```

---

## 🧪 Testing & Verification

The system has undergone a 26-point end-to-end regression and security authorization test suite:
* **Workflow Verification**: 100% PASS across Owner, Driver, and Admin workflows.
* **Security Authorization**: 100% PASS. Unauthorized requests for another user's request details, payment records, or trip state updates are rejected with **HTTP 403 Forbidden**.
* **State Machine & OTP Validation**: 100% PASS. Invalid OTPs, expired tokens, and invalid state transitions are rejected with proper status codes.

---

## 📄 Disclaimer & Project Scope

VRDMS is a prototype vehicle retrieval management system designed to demonstrate digital chain-of-custody, handover verification, pre/post-trip condition logging, and transparent price estimation. It provides evidentiary documentation and accountability for vehicle transfers, but does not offer physical vehicle security or real-time GPS anti-theft hardware.
