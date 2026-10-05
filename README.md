# Hospital Management System

Backend API for a hospital and student medical-examination workflow ( Helwan University Hospital management application ). The project is built with Express, MySQL, JWT-based authentication, email flows, file uploads, and a controller/service/repository structure.

This README is based on the current codebase state in this repository.

## Overview

The application currently supports:

- student signup with document uploads
- login/logout for students, admins, and super admins
- email activation and password-reset OTP flow
- student self-service profile and reservation endpoints
- admin reservation management, transfers, logs, and stats
- system-data management for clinics, faculties, governorates, hospitals, and levels
- yearly scheduled deactivation job

Base API prefix:

```text
/api/v1
```

## Tech Stack

- Node.js with ES modules
- Express 5
- Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-mariadb`, `prisma`)
- MySQL (`mysql2/promise`)
- JWT authentication
- Nodemailer
- Multer for file uploads (with in-memory buffers and collision-safe disk persistence)
- Sharp for image processing
- Cron jobs via `cron`
- Validation with `express-validator` and `joi`

## Project Structure

```text
.
|-- app.js
|-- server.js
|-- config/
|   |-- db.js
|   |-- db-helpers.js
|   |-- prisma.js
|   `-- Database.sql
|-- middlewares/
|   |-- auth.middleware.js
|   |-- error.middleware.js
|   |-- file-upload.middleware.js
|   `-- validator.middleware.js
|-- modules/
|   |-- admin/
|   |-- auth/
|   |-- reservation/
|   |-- students/
|   |-- super-admin/
|   |-- system-data/
|   `-- transfer/
|-- prisma/
|   |-- schema.prisma
|   `-- migrations/
|-- repositories/
|-- services/
|-- uploads/
|   |-- admins/
|   `-- students/
`-- utils/
```

## Architecture Notes

The codebase is organized in layered modules:

- `routes` define the HTTP endpoints and middleware chain
- `controllers` handle request/response orchestration and status codes
- `services` contain business logic, password hashing, and uniqueness checks
- `repositories` contain database queries (`Base` repository, Prisma, and `db-helpers.js`)
- `middlewares` handle auth, role verification, validation, file uploads, and global errors

There is also a shared `Base` repository in `repositories/base.repository.js` that provides pagination, search building, and generic lookup helpers.

## Main Mounted Routes

These are the route groups mounted in `app.js`:

| Route prefix             | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `/api/v1/auth`           | signup, login, logout, activation, password reset           |
| `/api/v1/super-admins`   | super-admin management (CRUD, unique accounts)              |
| `/api/v1/admins`         | admin CRUD, photos, transfers, reservations, logs, stats    |
| `/api/v1/reservations`   | admin reservation endpoints                                 |
| `/api/v1/users`          | student self-service and student management                 |
| `/api/v1/Myreservations` | student reservation endpoints                               |
| `/api/v1/sysdata`        | clinics, faculties, governorates, hospitals, levels         |
| `/api/v1/uploads`        | static access to uploaded student and admin files           |

## Feature Summary

### Authentication

Implemented under `modules/auth/`.

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgetPassword`
- `POST /api/v1/auth/resetPassword`
- `GET /api/v1/auth/activate/:token`
- `GET /api/v1/auth/confirmEmail/:token`

Login routing is selected by email domain:

- student emails end with `USER_EMAIL_DOMAIN`
- admin emails end with `ADMIN_EMAIL_DOMAIN`
- super-admin emails end with `SUPER_ADMIN_EMAIL_DOMAIN`

### Student Accounts

Implemented under `modules/students/`.

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `PATCH /api/v1/users/:id`

Student self-service routes require a valid JWT and a student email domain.

### Reservations

Implemented under `modules/reservation/`.

Student side:

- `POST /api/v1/Myreservations/:student_id`
- `GET /api/v1/Myreservations/:student_id`
- `PUT /api/v1/Myreservations/:student_id/:medicEx_id`
- `GET /api/v1/Myreservations/:student_id/:medicEx_id`
- `DELETE /api/v1/Myreservations/:student_id/:medicEx_id`

Admin side:

- `GET /api/v1/reservations/byMonth`
- `PATCH /api/v1/reservations/accept/:id`
- `POST /api/v1/reservations`
- `GET /api/v1/reservations`
- `GET /api/v1/reservations/emergency`
- `PUT /api/v1/reservations/:emergencyUser_id`
- `GET /api/v1/reservations/:emergencyUser_id`
- `DELETE /api/v1/reservations/:emergencyUser_id`

### Admins and Transfers

Implemented under `modules/admin/` and `modules/transfer/`.

- `GET /api/v1/admins` - returns complete list with `id`, status, timestamps, and dynamic `profile_photo_url`
- `POST /api/v1/admins` - create new admin with validation, optional profile photo upload, and audit logging
- `GET /api/v1/admins/:id` - get single admin profile with photo URL
- `PUT /api/v1/admins/:id` and `PATCH /api/v1/admins/:id` - update admin details, handle photo replacement/removal and auto-cleanup
- `DELETE /api/v1/admins/:id` - remove admin and clean up their stored photo file
- `GET /api/v1/admins/logs` & `DELETE /api/v1/admins/logs` - paginated admin activity logs
- `GET /api/v1/admins/:admin_id/logs` & `DELETE /api/v1/admins/:admin_id/logs` - logs for a specific admin
- `GET /api/v1/admins/stats` - dashboard summary metrics and reservation statistics
- transfer endpoints under `/api/v1/admins/transfers`

Role validation supports both internal hash codes and friendly names (`counter`, `second_manager`, `viewer`, `observer`, `medical_check_manager`, `super_admin`).

### System Data

Implemented under `modules/system-data/`.

Current dictionaries:

- clinics
- faculties
- governorates
- hospitals
- levels

The `GET` endpoints are generally public, while create/update/delete operations are protected.

## Uploads

Handled in `middlewares/file-upload.middleware.js`:

- Student registration fields: `user_image_file`, `national_id_file`, `fees_file`
- Admin profile photo fields: `profile_photo`, `photo`, `avatar`, `user_image_file`
- Accepted file types: images (`image/jpeg`, `image/jpg`, `image/png`, `image/webp`) and PDFs (`application/pdf`)
- Maximum file size: **10 MB** (exceeding files return an operational `400 Bad Request` with a clear message)
- Student files are stored in `uploads/students/<username>/`
- Admin profile photos are stored in `uploads/admins/`
- Uploaded files are served statically from `/api/v1/uploads`

## Validation Rules

From the current validators:

- Admin signup/creation requires unique username and email, password (min 6 characters), and valid role from the whitelist
- Super-admin signup requires password (8 to 40 characters) starting with an uppercase letter and standard email domain
- Student national ID must be numeric and exactly 14 digits
- Phone number is validated with the `ar-EG` mobile format
- Daily reservation-cap check limits reservations per date

## Database & Prisma Migrations

Database connection is managed via `mysql2/promise` (`config/db.js`) and Prisma (`prisma/schema.prisma`).

Prisma commands available via npm scripts:

```bash
# Apply pending migrations and generate new ones from schema changes
npm run prisma:migrate

# Regenerate Prisma Client
npm run prisma:generate

# Launch Prisma Studio GUI
npm run prisma:studio

# Pull schema from existing database
npm run prisma:pull
```

Migrations are version-controlled in `prisma/migrations/`:
- `0_init`: baseline migration for existing schema
- `20261005152652_add_profile_photo_to_admins`: added `profile_photo` column to `admins`

## Environment Variables

Create a `.env` file in the project root and define the variables used by the codebase:

```env
PORT=7000
NODE_ENV=development

DATABASE_URL="mysql://root:password@localhost:3306/hms_test"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
TEST_DB=hms_test
PROD_DB=hms_prod

JWT_SECRET=
JWT_EXPIRE_TIME=
JWT_SHORT_EXPIRE_TIME=
JWT_COOKIE_EXPIRES_IN=7

USER_EMAIL_DOMAIN=
ADMIN_EMAIL_DOMAIN=
SUPER_ADMIN_EMAIL_DOMAIN=
ADMIN_DOMAIN=

EMAIL_FROM=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

SENDGRID_USERNAME=
SENDGRID_PASSWORD=
```

Notes:

- when `NODE_ENV=development`, the app connects to `TEST_DB`
- otherwise it connects to `PROD_DB`
- production mail transport uses SendGrid credentials

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the root and fill the values shown above.

### 3. Run database migrations

```bash
npm run prisma:migrate
```

### 4. Start the server

Development:

```bash
npm start
```

## Authentication

Protected routes expect:

```http
Authorization: Bearer <token>
```

The app also sets a `jwt` cookie during signup.

## Scheduled Jobs

`services/scheduler.service.js` starts a cron job intended to deactivate student accounts yearly using the `Africa/Cairo` timezone.

## Error Handling

Global error handling lives in `middlewares/error.middleware.js`:

- Development mode returns detailed error stack traces
- Production mode returns sanitized responses for non-operational errors
- Dedicated handlers for JWT errors (`JsonWebTokenError`, `TokenExpiredError`)
- Dedicated handler for Multer errors (`MulterError`, file size limit returns `400 Bad Request`)

## Current Status

- Admin module refactored to clean async/await repository/service pattern with profile photo uploads and dynamic URL generation
- Super-admin module fully implemented with password hashing and uniqueness validation
- Route ordering issues in admin router resolved (specific `/logs` and `/stats` precede parameterized routes)
- Prisma migrations enabled and integrated alongside raw SQL helpers for schema evolution

