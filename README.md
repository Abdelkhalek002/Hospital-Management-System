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
- MySQL (`mysql2/promise`)
- JWT authentication
- Nodemailer
- Multer for uploads
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
|   `-- test_hms_v1_2.sql
|-- middlewares/
|-- modules/
|   |-- admin/
|   |-- auth/
|   |-- reservation/
|   |-- students/
|   |-- super-admin/
|   |-- system-data/
|   `-- transfer/
|-- repositories/
|-- services/
|-- uploads/
`-- utils/
```

## Architecture Notes

The codebase is mostly organized in layered modules:

- `routes` define the HTTP endpoints
- `controllers` handle request/response flow
- `services` contain business logic
- `repositories` contain database access helpers
- `middlewares` handle auth, validation, uploads, and errors

There is also a shared `Base` repository in `repositories/base.repository.js` that provides pagination, search building, and generic lookup helpers.

## Main Mounted Routes

These are the route groups mounted in `app.js`:

| Route prefix             | Purpose                                                     |
| ------------------------ | ----------------------------------------------------------- |
| `/api/v1/auth`           | signup, login, logout, activation, password reset           |
| `/api/v1/super-admins`   | super-admin management                                      |
| `/api/v1/admins`         | admin CRUD, transfers, admin-side reservations, logs, stats |
| `/api/v1/reservations`   | admin reservation endpoints                                 |
| `/api/v1/users`          | student self-service and student management                 |
| `/api/v1/Myreservations` | student reservation endpoints                               |
| `/api/v1/sysdata`        | clinics, faculties, governorates, hospitals, levels         |
| `/api/v1/uploads`        | static access to uploaded files                             |

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

- admin CRUD under `/api/v1/admins`
- admin logs under `/api/v1/admins/logs`
- stats under `/api/v1/admins/stats`
- transfer endpoints under `/api/v1/admins/transfers`

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

Student registration expects multipart form data with these file fields:

- `user_image_file`
- `national_id_file`
- `fees_file`

Important upload behavior:

- accepted file types: `image/jpeg`, `image/jpg`
- max file size: `2 MB`
- files are written under `uploads/students/<username>/`
- uploaded files are served from `/api/v1/uploads`

## Validation Rules

From the current validators:

- signup password must be 8 to 40 characters
- signup password must start with an uppercase letter
- allowed password characters are lowercase letters, numbers, `#`, and `@`
- national ID must be numeric and exactly 14 digits
- phone number is validated with the `ar-EG` mobile format
- signup email must match the configured student domain

Reservation notes from the current code:

- reservation date is validated before insert
- the code limits each student to one reservation per day
- the daily reservation-cap check currently triggers at 20 records for a date

## Database

Database connection is configured in `config/db.js`.

The repository includes an SQL dump:

```text
config/Database.sql
```

Core tables defined in that dump include:

- `students`
- `admins`
- `super_admins`
- `admin_log`
- `medical_examinations`
- `transfers`
- `password_reset_otps`
- `clinics`
- `faculties`
- `governorates`
- `levels`
- `nationality`
- `external_hospitals`

## Environment Variables

Create a `.env` file in the project root and define the variables used by the codebase:

```env
PORT=7000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
TEST_DB=
PROD_DB=

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

### 2. Import the database

Import:

```text
config/Database.sql
```

into your local MySQL server, then set the matching database name in `.env`.

### 3. Configure environment variables

Create `.env` in the root and fill the values shown above.

### 4. Start the server

Development:

```bash
npm start
```

Alternative scripts currently present:

```bash
npm run dev
npm test
```

Current `package.json` also declares:

- Node engine: `24.11.1`

## Authentication

Protected routes expect:

```http
Authorization: Bearer <token>
```

The app also sets a `jwt` cookie during signup.

## Scheduled Jobs

`services/scheduler.service.js` starts a cron job intended to deactivate student accounts yearly using the `Africa/Cairo` timezone.

## Error Handling

Global error handling lives in `middlewares/error.middleware.js`.

- development mode returns detailed API error output
- production mode returns sanitized responses for non-operational errors
- JWT and Multer errors have dedicated handling branches

## Current Status And Caveats

This repository has a solid backend foundation, but a few areas are still mid-refactor:

- `README.md` now documents the current code, not an idealized future state
- some controllers still mix legacy callback-style SQL with newer repository helpers
- `modules/super-admin/super-admin.controller.js` is incomplete and references an undefined service
- parts of `modules/admin/admin.controller.js` still reference `db` without importing it
- some naming differs between files, such as `id` vs `medicEx_id` and route casing like `/Myreservations`
- there are dev dependencies for testing, but no runnable automated test suite is wired through the current scripts

For local learning and extension, the project is easy to follow. For production use, the incomplete areas should be stabilized first.
