# Hospital Management System API

Backend API for a hospital reservation and student medical profile workflow, built with Node.js, Express, and MySQL.

## Overview

This project provides:

- User authentication and account activation
- Student profile management
- Reservation management (user and admin flows)
- Admin operations (review, transfer, logs, statistics, blocking users)
- Master/system data management (levels, governorates, clinics, faculties, hospitals)
- Password reset and OTP email flow

Base URL prefix: `http://localhost:<PORT>/api/v1`

## Tech Stack

- Node.js (ES Modules)
- Express
- MySQL (`mysql` driver)
- JWT for authentication
- Express Validator + Joi
- Multer + Sharp for upload/image processing
- Nodemailer for email notifications
- Cron jobs (`cron`)

## Project Structure

```text
Hospital-Management-System/
|- APIs/                      # Route modules
|- controllers/               # Request handlers and business logic
|- middlewares/               # Auth, validation, global error handling
|- services/                  # Email, rate limiting, cron, activation utilities
|- config/                    # DB configuration
|- utils/                    # Validators, helpers, enums, API errors
|- uploads/                   # Uploaded files (served statically)
|- server.js                  # Application entry point
|- .env                 # Environment variables (local)
```

## Prerequisites

- Node.js (project `engines` currently pins `24.11.1`)
- npm
- MySQL server

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`.

Recommended template:

```env
NODE_ENV=development
PORT=7000
TEST_PORT=9000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DEV_DB=main_database_v2.6
TEST_DB=main_database_test
PROD_DB=main_database_prod

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE_TIME=120m

REQS_LIMIT=10
REQ_BREAK_TIME=10 * 60 * 1000

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

3. Make sure your MySQL schema/tables are created (this repository does not include migrations or SQL seed files).

## Run

Development:

```bash
npm start
```

Testing mode (runs server with `NODE_ENV=testing`):

```bash
npm test
```

Direct nodemon run:

```bash
npm run dev
```

## Authentication

Protected endpoints expect:

```http
Authorization: Bearer <token>
```

Role/type checks are applied through middleware:

- `Protect`
- `allowedTo(...)` for admin roles
- `allowedToUser(...)` for user type checks

### Role Constants

Defined in `utils/roles.js`:

- `SUPER_ADMIN`
- `COUNTER`
- `OBSERVER`
- `SECOND_MANAGER`
- `MEDICAL_CHECK_MANAGER`
- `TRANSFER_CLERK`
- `BADR_HOSPITAL_ADMIN`

## API Routes

Mounted in `server.js`:

- `/api/v1/auth`
- `/api/v1/password`
- `/api/v1/myProfile`
- `/api/v1/Myreservations`
- `/api/v1/reservations`
- `/api/v1/admin`
- `/api/v1/sysdata`

### Auth (`/api/v1/auth`)

- `POST /signUp`
- `GET /activate`
- `POST /sendOtp`
- `POST /forgetPassword`
- `POST /login`
- `GET /confirmEmail`

### User Security (`/api/v1/password`)

- `POST /change/:student_id`

### User Profile (`/api/v1/myProfile`)

- `GET /:student_id`
- `PUT /:student_id`
- `PATCH /:student_id` (profile photo upload/update)

### User Reservations (`/api/v1/Myreservations`)

- `POST /:student_id`
- `GET /:student_id`
- `PUT /:student_id/:medicEx_id`
- `GET /:student_id/:medicEx_id`
- `DELETE /:student_id/:medicEx_id`

### Admin Reservations (`/api/v1/reservations`)

- `POST /`
- `GET /`
- `GET /emergency`
- `PUT /:emergencyUser_id`
- `GET /:emergencyUser_id`
- `DELETE /:emergencyUser_id`

### Admin (`/api/v1/admin`)

- `GET /statistics`
- `GET /resbymonth`
- `GET /logs`
- `DELETE /logs`
- `GET /logs/:admin_id`
- `DELETE /logs/:admin_id`
- `GET /userProfiles`
- `PUT /userProfiles/:student_id`
- `DELETE /userProfiles/:student_id`
- `PATCH /userProfiles/:student_id/block`
- `PATCH /userProfiles/:student_id/unblock`
- `POST /`
- `POST /add`
- `GET /all`
- `GET /:user_id`
- `PUT /:user_id`
- `PATCH /:user_id`
- `DELETE /:user_id`
- `GET /filter`
- `POST /search`
- `POST /advancedSearch`
- `PATCH /acceptOrDecline/:id`
- `POST /transfer`
- `POST /transferdata`
- `PUT /transfer/:transfer_id`
- `POST /:student_id` (send observation)

### System Data (`/api/v1/sysdata`)

- Levels: `POST/GET /levels`, `PUT/DELETE /levels/:level_id`
- Governorates: `POST/GET /governorates`, `PUT/DELETE /governorates/:gov_id`
- Clinics: `POST/GET /clinics`, `PUT/DELETE /clinics/:clinic_id`
- Faculties: `POST/GET /faculties`, `PUT/DELETE /faculties/:faculty_id`
- Hospitals: `POST/GET /hospitals`, `PUT/DELETE /hospitals/:exHosp_id`

## Static Files

Uploads are served from:

- `/api/v1/uploads/*`
- `/uploads/*` (direct static mount)

## Scheduled Job

`services/cronExpireMiddleware.js` starts a cron job that resets `students.verified` from `1` to `0` yearly at:

- `00:00` on `January 1`
- Time zone: `Africa/Cairo`

## Error Handling

- Unknown routes are converted to `ApiError`
- Centralized global error middleware in `middlewares/errorMiddleware.js`

## Important Notes

- Do not commit real secrets (JWT secrets, DB credentials, email app passwords) to source control.
- Current mail services include hard-coded Gmail credentials in service files; migrate to environment variables before production use.
- There is no automated test suite configured in this repository yet.

## License

`ISC` (as defined in `package.json`).
