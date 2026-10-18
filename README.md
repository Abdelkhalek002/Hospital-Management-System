# Hospital Management System (HMS) - Backend API

Backend RESTful API for **Helwan University Hospital Management & Student Medical Examination System**. Built with Express 5, Prisma ORM 7, MySQL/MariaDB, modular Layered Architecture (Controller-Service-Repository), comprehensive Role-Based Access Control (RBAC), multi-part secure file processing, OTP email verification, and a unified medical reservations engine.

---

## Table of Contents

- [Overview & Key Features](#overview--key-features)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Roles & Permissions (RBAC)](#roles--permissions-rbac)
- [API Endpoints Reference](#api-endpoints-reference)
  - [Authentication (`/api/v1/auth`)](#authentication-apiv1auth)
  - [Users & Students (`/api/v1/users`)](#users--students-apiv1users)
  - [Student Reservations (`/api/v1/Myreservations`)](#student-reservations-apiv1myreservations)
  - [Admin Reservations & Emergency (`/api/v1/reservations`)](#admin-reservations--emergency-apiv1reservations)
  - [Admin & Staff Management (`/api/v1/admins`)](#admin--staff-management-apiv1admins)
  - [Patient Transfers (`/api/v1/admins/transfers`)](#patient-transfers-apiv1adminstransfers)
  - [System Lookup Data (`/api/v1/...`)](#system-lookup-data-apiv1)
  - [Static Uploads (`/api/v1/uploads`)](#static-uploads-apiv1uploads)
- [Database Schema & Prisma Migrations](#database-schema--prisma-migrations)
- [File Uploads & Image Processing](#file-uploads--image-processing)
- [Environment Variables](#environment-variables)
- [Getting Started & Installation](#getting-started--installation)
- [Error Handling & Security](#error-handling--security)
- [Testing](#testing)

---

## Overview & Key Features

- **Authentication & Dual Domain Routing**:
  - Distinct access portals separated by email domains (`USER_EMAIL_DOMAIN`, `ADMIN_EMAIL_DOMAIN`, `SUPER_ADMIN_EMAIL_DOMAIN`).
  - Secure bcrypt password hashing and stateless JWT bearer tokens stored in HTTP headers or cookies.
  - 6-digit OTP email verification with cooldown rate limiting and anti-brute-force attempt counters.
  - Multi-step password reset flow via time-limited OTP tokens.
- **Student Profile & Document Lifecycle**:
  - Multi-file onboarding (Personal Profile Photo, National ID scan, University Tuition Receipt).
  - Admin document review pipeline with three distinct states: `pending`, `approved`, and `rejected` (with customizable rejection reasons).
  - Student self-service document resubmission endpoint.
- **Unified Medical Examination & Emergency Triage**:
  - Unified data model handling both scheduled student examinations and hospital emergency walk-ins.
  - Exam types: `EMERGENCY` (طوارئ), `NEW_EXAM` (كشف جديد), `FOLLOW_UP` (متابعة).
  - Advanced query filtering (search keyword, clinic, exam type, status, year, month, pagination).
  - Dedicated reservation status transition (`PENDING` -> `ACCEPTED` / `REJECTED`).
- **Staff & Admin Management**:
  - Granular permissions matrix supporting 6 distinct staff roles.
  - Dedicated admin audit logs (`admin_log`) tracking all sensitive administrative actions.
  - Dashboard analytics and real-time reservation metrics.
  - Dynamic avatar / profile photo uploads with automatic disk cleanup on replacement or deletion.
- **External Hospital Transfers**:
  - Medical transfer dispatch to affiliated external hospitals (e.g., Badr University Hospital, 15th of May Hospital).
- **System Dictionaries & Soft Toggles**:
  - Administrative lookup management for Clinics, Faculties, Governorates, External Hospitals, Academic Levels, and Nationalities with `is_active` soft-activation flags.
- **Automated Cron Jobs**:
  - Scheduled background tasks for annual student account deactivation in the `Africa/Cairo` timezone.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime & Language** | Node.js (v24+ / ESM `import/export`), JavaScript |
| **Framework** | Express 5 (`^5.2.1`) |
| **Database & ORM** | MySQL / MariaDB via `mysql2/promise` and Prisma ORM 7 (`^7.10.0`) with `@prisma/adapter-mariadb` |
| **Authentication & Crypto** | JSON Web Tokens (`jsonwebtoken`), `bcrypt` |
| **File Processing & Media** | `multer` (in-memory buffer parsing), `sharp` (WebP/JPEG optimization), `sanitize-filename` |
| **Validation & Sanitization** | `express-validator` (`^7.3.1`) |
| **Mailing & Templates** | `nodemailer` with SendGrid, Gmail, or custom SMTP + responsive HTML templates |
| **Scheduling & Security** | `cron` (`^4.4.0`), `express-rate-limit`, `cors`, `cookie-parser`, `morgan` |

---

## Project Directory Structure

```text
.
|-- app.js                              # Express application setup, global middlewares & routes
|-- server.js                           # HTTP server bootstrap & database connectivity check
|-- config/
|   |-- db.js                           # MySQL2 connection pool setup
|   |-- db-helpers.js                   # Generic SQL query execution helpers
|   |-- prisma.js                       # Prisma Client with MariaDB driver adapter
|   `-- Database.sql                    # Baseline raw SQL schema dump
|-- middlewares/
|   |-- auth.middleware.js              # Token verification, role check & permission guards
|   |-- error.middleware.js             # Global centralized error handling & formatting
|   |-- file-upload.middleware.js       # Multer storage, file filters, and Sharp pipelines
|   `-- validator.middleware.js         # Express-validator result inspection middleware
|-- modules/
|   |-- admin/                          # Admin accounts, audit logs, stats & profile photos
|   |-- auth/                           # Signup, login, logout, OTP email verification & reset
|   |-- reservation/                    # Unified medical examinations & student booking engine
|   |-- system-data/                    # Clinics, faculties, governorates, hospitals, levels
|   |-- transfer/                       # Hospital transfer requests and tracking
|   `-- user/                           # Student self-service, document review & approval
|-- prisma/
|   |-- schema.prisma                   # Prisma declarative data models & relations
|   |-- seed.js                         # Database seeder script
|   `-- migrations/                     # Versioned SQL migrations history
|-- repositories/
|   `-- base.repository.js              # Generic repository class with pagination & lookup helpers
|-- services/
|   |-- email.service.js                # Nodemailer email dispatch & HTML template renderer
|   |-- rate-limit.service.js           # Express rate-limiting configurations
|   `-- scheduler.service.js            # Node cron jobs for annual student deactivation
|-- tests/
|   `-- auth-signup-upload.test.js      # Integration test suite for signup and file uploads
|-- uploads/                            # Static disk persistence for media
|   |-- admins/                         # Admin profile photos
|   `-- students/                       # Student document folders (<username>/)
`-- utils/
    |-- api-error.js                    # Operational error custom class
    |-- permissions.js                  # Granular permissions constants & role permission maps
    |-- roles.js                        # System role definitions & enums
    `-- sanitize-data.js                # Data sanitization and projection utilities
```

---

## Architecture & Design Patterns

The backend follows the **Layered Architecture (Controller-Service-Repository)** pattern:

1. **Routes Layer (`*.routes.js`)**:
   Defines URL paths, attaches authentication guards (`protect`, `restrictToUser`), enforces permissions (`hasPermission`), applies upload middleware, and validates requests.
2. **Controller Layer (`*.controller.js`)**:
   Orchestrates HTTP requests and responses, handles status codes, and delegates business logic to services.
3. **Service Layer (`*.service.js`)**:
   Encapsulates core business rules, password hashing, token generation, conflict validation, and domain-specific operations.
4. **Repository Layer (`*.repository.js`)**:
   Abstracts all database access using either Prisma ORM or parameterized MySQL connection pools. Extends `BaseRepository` for standardized pagination and searching.
5. **Resource/Presenter Layer (`*.resource.js`)**:
   Transforms raw database models into client-ready JSON structures, attaching computed properties (such as absolute URL paths for uploaded media).

---

## Roles & Permissions (RBAC)

The application enforces strict Role-Based Access Control using system roles and granular permission strings.

### System Roles (`utils/roles.js`)

- `SUPER_ADMIN`: Root administrator with wildcard access (`*`) to all system features.
- `MEDICAL_TESTS_MANAGER`: Oversees laboratory tests and medical results.
- `MEDICAL_CHECK_MANAGER`: Reviews medical examinations and diagnostic reservations.
- `COUNTER`: Handles student inquiries, check-ins, and reads student records (`users:read`).
- `TRANSFER_CLERK`: Manages external hospital patient transfers (`transfers:read`, `transfers:write`).
- `OBSERVER`: Read-only reporting access across system modules.

### Granular Permissions (`utils/permissions.js`)

| Permission Name | String | Description |
|---|---|---|
| `ADMINS_READ` | `admins:read` | View administrative staff accounts |
| `ADMINS_CREATE` | `admins:create` | Register new staff administrator accounts |
| `ADMINS_UPDATE` | `admins:update` | Modify staff profiles and permissions |
| `ADMINS_DELETE` | `admins:delete` | Delete staff accounts |
| `STATS_READ` | `stats:read` | Access management analytics and statistics |
| `LOGS_READ` | `logs:read` | Read system activity audit logs |
| `LOGS_DELETE` | `logs:delete` | Purge audit logs |
| `USERS_READ` | `users:read` | View student/patient accounts and submitted documents |
| `USERS_WRITE` | `users:write` | Approve, reject, or modify student accounts |
| `RESERVATIONS_READ` | `reservations:read` | Query and filter medical reservations |
| `RESERVATIONS_WRITE` | `reservations:write` | Create, update, or cancel medical reservations |
| `RESERVATIONS_APPROVE` | `reservations:approve` | Accept or reject pending examination reservations |
| `TRANSFERS_READ` | `transfers:read` | List external hospital transfers |
| `TRANSFERS_WRITE` | `transfers:write` | Create or update external hospital transfers |

---

## API Endpoints Reference

Base API prefix: `/api/v1`

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Register a student account with document uploads (`user_image_file`, `national_id_file`, `fees_file`) |
| `POST` | `/verify-otp` | Public | Verify student email using a 6-digit OTP code |
| `POST` | `/resend-otp` | Public (Rate Limited) | Request a fresh verification OTP |
| `POST` | `/login` | Public | Authenticate user/admin via email domain dispatch and retrieve JWT |
| `POST` | `/logout` | Public | Clear session and cookies |
| `POST` | `/forgetPassword` | Public (Rate Limited) | Send 6-digit password reset OTP to email |
| `POST` | `/resetPassword` | Public | Reset password using the verified OTP token |
| `GET` | `/activate/:token` | Public | Legacy token-based account activation link |
| `GET` | `/confirmEmail/:token` | Public | Legacy token-based email confirmation link |

### Users & Students (`/api/v1/users`)

| Method | Endpoint | Required Permission | Description |
|---|---|---|---|
| `GET` | `/me` | Student Only | Get current student profile details |
| `PUT` | `/me` | Student Only | Update self profile (allows updating profile picture) |
| `PATCH` | `/me/resubmit-documents`| Student Only | Resubmit `national_id_file` and `fees_file` if previously rejected |
| `GET` | `/` | `users:read` | List all students with pagination and search |
| `GET` | `/:id` | `users:read` | View single student profile, documents, and status |
| `PATCH` | `/:id` | `users:write` | Update student status / activate account |
| `PATCH` | `/:id/approve` | `users:write` | Approve student uploaded documents |
| `PATCH` | `/:id/reject` | `users:write` | Reject documents with a mandatory `rejection_reason` |

### Student Reservations (`/api/v1/Myreservations`)

*All student reservation endpoints require authentication and an approved student account (`document_status === 'approved'`).*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Approved Student | List all reservations belonging to the authenticated student |
| `POST` | `/` | Approved Student | Book a new medical examination |
| `GET` | `/:student_id/:medicEx_id` | Approved Student | View single reservation details |
| `PUT` | `/:student_id/:medicEx_id` | Approved Student | Update reservation date or clinic |
| `DELETE` | `/:student_id/:medicEx_id` | Approved Student | Cancel pending reservation |

### Admin Reservations & Emergency (`/api/v1/reservations`)

| Method | Endpoint | Required Permission | Description |
|---|---|---|---|
| `GET` | `/` | `reservations:read` | Search reservations. Query filters: `?month=`, `?year=`, `?examType=`, `?clinic_id=`, `?status=`, `?searchKey=`, `?page=`, `?limit=` |
| `POST` | `/` | `reservations:write` | Admin creates reservation (walk-in or student) |
| `GET` | `/emergency` | `reservations:read` | List emergency examination bookings |
| `GET` | `/:id` | `reservations:read` | View single reservation record |
| `PUT` | `/:id` | `reservations:write` | Update reservation details |
| `PUT` | `/:id/status` | `reservations:approve` | Accept or reject reservation status (`status: "مقبول"` / `"مرفوض"`) |
| `DELETE` | `/:id` | `reservations:write` | Delete reservation |

### Admin & Staff Management (`/api/v1/admins`)

| Method | Endpoint | Required Permission | Description |
|---|---|---|---|
| `GET` | `/` | `admins:read` | List all staff admins with dynamic `profile_photo_url` |
| `POST` | `/` | `admins:create` | Create new staff account with assigned role and photo |
| `GET` | `/stats` | `stats:read` | View hospital metrics and reservation statistics |
| `GET` | `/logs` | `logs:read` | View paginated administrative activity audit logs |
| `DELETE` | `/logs` | `logs:delete` | Clear administrative audit logs |
| `GET` | `/:id` | Owner / `SUPER_ADMIN` | View single staff account details |
| `PUT`, `PATCH`| `/:id` | Owner / `SUPER_ADMIN` | Update staff details, replace or remove profile photo |
| `DELETE` | `/:id` | `admins:delete` | Delete staff account and purge associated photo file |
| `GET` | `/:admin_id/logs` | `logs:read` | View audit logs for a specific admin |
| `DELETE` | `/:admin_id/logs` | `logs:delete` | Clear audit logs for a specific admin |

### Patient Transfers (`/api/v1/admins/transfers`)

| Method | Endpoint | Required Permission | Description |
|---|---|---|---|
| `GET` | `/` | `transfers:read` | List all external hospital transfers |
| `POST` | `/` | `transfers:write` | Transfer patient to an external hospital |
| `PATCH` | `/:id` | `transfers:write` | Update transfer record or status |

### System Lookup Data (`/api/v1`)

*Lookup dictionaries support `GET` publicly. Create, Update, and Delete endpoints require `SUPER_ADMIN` credentials and rate-limiting.*

| Resource | Endpoints |
|---|---|
| **Clinics** | `GET /clinics`, `POST /clinics`, `GET /clinics/:id`, `PUT /clinics/:id`, `DELETE /clinics/:id` |
| **Faculties** | `GET /faculties`, `POST /faculties`, `GET /faculties/:id`, `PUT /faculties/:id`, `DELETE /faculties/:id` |
| **Governorates** | `GET /governorates`, `POST /governorates`, `GET /governorates/:id`, `PUT /governorates/:id`, `DELETE /governorates/:id` |
| **Hospitals** | `GET /hospitals`, `POST /hospitals`, `GET /hospitals/:id`, `PUT /hospitals/:id`, `DELETE /hospitals/:id` |
| **Academic Levels**| `GET /levels`, `POST /levels`, `GET /levels/:id`, `PUT /levels/:id`, `DELETE /levels/:id` |

### Static Uploads (`/api/v1/uploads`)

- Served directly through `express.static`:
  - Student documents: `/api/v1/uploads/students/<username>/<filename>`
  - Admin avatars: `/api/v1/uploads/admins/<filename>`

---

## Database Schema & Prisma Migrations

The database is defined in `prisma/schema.prisma` and connected via MariaDB/MySQL driver adapters.

### Core Models

- `users`: Student accounts with academic affiliation, document paths, approval status, and verification state.
- `admins`: Administrative accounts with role enums (`admins_role`), active state (`admin_status`), and profile photos.
- `reservations`: Unified examinations table combining student reservations and emergency bookings.
- `transfers`: Referrals to external hospitals.
- `external_hospitals`, `clinics`, `faculties`, `governorates`, `levels`, `nationality`: Lookup dictionaries with `is_active` flags.
- `medical_tests`, `laboratory`: Clinical tests and test results.
- `email_verification_otps`, `password_reset_otps`: OTP tokens with expiration dates and attempt counters.
- `admin_log`: Audit log recording admin actions.

### Migrations History

All migrations are located in `prisma/migrations/`:

1. `0_init`: Baseline migration for the initial schema.
2. `20261005152652_add_profile_photo_to_admins`: Added `profile_photo_path` to the `admins` table.
3. `20261015190825_remove_legacy_otp_fields_from_users`: Decoupled OTP storage to dedicated tables.
4. `20261015215305_add_rejected_status_to_medical_examinations`: Added `REJECTED` status to medical reservations.
5. `20261016144000_refactor_users_admins_and_roles`: Consolidated super-admins into `admins` with role enums and active status.
6. `20261018122500_add_is_active_to_lookup_tables`: Added `is_active` boolean flags across all lookup tables.
7. `20261018160000_unify_reservations_and_emergency_bookings`: Merged emergency requests and standard reservations into a unified table.

---

## File Uploads & Image Processing

Managed in `middlewares/file-upload.middleware.js`:

- **Memory Buffers**: Multer processes incoming multipart data in memory buffers before optimizing and saving to disk.
- **Image Optimization**: Images are automatically converted and compressed to WebP/JPEG using `sharp` (90% quality, resized).
- **Collision Safety**: Filenames include timestamps and cryptographic random hex strings.
- **Allowed MIME Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, and `application/pdf`.
- **Max File Size**: **10 MB**. Any file exceeding this limit is cleanly intercepted by the global error handler, returning an operational `400 Bad Request`.
- **Auto Cleanup**: When an admin profile photo is updated or deleted, the previous file on disk is automatically purged.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
PORT=7000
NODE_ENV=development
BASE_URL=http://localhost:7000
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Database Configuration
DATABASE_URL="mysql://root:@localhost:3306/hms_dev"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DEV_DB=hms_dev
PROD_DB=hms_prod

# Authentication & JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE_TIME=90d
JWT_SHORT_EXPIRE_TIME=10m
JWT_COOKIE_EXPIRES_IN=7

# Email Domains Routing
USER_EMAIL_DOMAIN=@fci.helwan.edu.eg
ADMIN_EMAIL_DOMAIN=@admin.helwan.edu.eg
SUPER_ADMIN_EMAIL_DOMAIN=@super.helwan.edu.eg
ADMIN_DOMAIN=@admin.helwan.edu.eg

# Email Dispatcher (Nodemailer)
DISABLE_EMAIL=false
EMAIL_SERVICE=gmail
EMAIL_FROM=no-reply@helwan.edu.eg
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SendGrid (Production Optional)
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=your_sendgrid_key
```

---

## Getting Started & Installation

### 1. Prerequisites

- **Node.js**: v24.11.1 or higher
- **MySQL / MariaDB**: v8.0+ / v10.5+

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/Abdelkhalek002/Hospital-Management-System.git
cd Hospital-Management-System
npm install
```

### 3. Setup Environment File

Copy or create `.env` in the root directory and populate your database and email credentials as shown above.

### 4. Run Prisma Migrations

Execute pending database migrations:

```bash
npm run prisma:migrate
```

Regenerate Prisma client:

```bash
npm run prisma:generate
```

### 5. Seed Initial System Data

Populate default clinics, levels, external hospitals, nationalities, and initial admin accounts:

```bash
npm run prisma:seed
```

### 6. Start the Server

```bash
# Development with hot-reload
npm start

# Standalone development
npm run dev

# Launch Prisma Studio GUI
npm run prisma:studio
```

The API will be accessible at `http://localhost:7000/api/v1`.

---

## Error Handling & Security

- **Centralized Error Handling**: Built via `middlewares/error.middleware.js` and `utils/api-error.js`.
- **Operational vs Programming Errors**: Production mode sanitizes unexpected database or syntax errors, presenting clean and secure messages.
- **JWT Errors**: Automatic interception of `JsonWebTokenError` and `TokenExpiredError`, returning `401 Unauthorized`.
- **Multer Errors**: Intercepts `LIMIT_FILE_SIZE` and returns a user-friendly `400 Bad Request` stating file size limit.
- **Rate Limiting**: Applied to OTP request, password reset, and lookup creation endpoints to prevent brute-force attacks and abuse.
- **CORS & Cookies**: Configured for secure cross-origin requests from client URLs with cookie credential support.

---

## Testing

The project uses Node.js's native test runner (`node:test`) and assertion library (`node:assert/strict`).

Run the automated integration test suite:

```bash
# Run tests with testing environment configuration
npm test

# Or execute directly via Node test runner
node --test tests/auth-signup-upload.test.js
```