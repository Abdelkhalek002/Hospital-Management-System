-- CreateTable
CREATE TABLE `admin_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NULL,
    `method` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `admin_log_ibfk_1`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `role` ENUM('hsh_2_sa_4', 'hsh_2!sm!6', 'hsh_4*ob*5', 'hsh_$mcm$9', 'hsh_3#co#0') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `is_confirmed` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(255) NOT NULL,
    `password_changed_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_admins_username`(`username`),
    UNIQUE INDEX `uq_admins_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clinics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinic_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_clinics_name`(`clinic_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_name` VARCHAR(255) NOT NULL,
    `national_id` BIGINT NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'طوارئ',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `external_hospitals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hospital_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_hospitals_name`(`hospital_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `faculty_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_faculties_name`(`faculty_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `governorates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gov_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_governorates_name`(`gov_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `laboratory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `medical_exam_id` INTEGER NOT NULL,
    `medical_test_id` INTEGER NOT NULL,
    `test_result` ENUM('إيجابي', 'سلبي') NOT NULL,

    INDEX `medical_exam_id`(`medical_exam_id`),
    INDEX `medical_test_id`(`medical_test_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_levels_name`(`level_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_examinations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `clinic_id` INTEGER NOT NULL,
    `exam_type` ENUM('طواريْ', 'متابعة', 'كشف جديد') NOT NULL DEFAULT 'طواريْ',
    `status` ENUM('مقبول', 'تحت الانتظار') NOT NULL DEFAULT 'تحت الانتظار',
    `date` DATETIME(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `clinic_id`(`clinic_id`),
    INDEX `student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_tests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `test_name` VARCHAR(255) NOT NULL,
    `test_type` ENUM('براز', 'دم', 'مزرعة', 'بول') NOT NULL,
    `state` ENUM('متاح', 'غير متاح') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_medical_tests_name`(`test_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nationality` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nationality_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_nationality_name`(`nationality_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_otps` (
    `email` VARCHAR(255) NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `attempts_count` INTEGER NOT NULL DEFAULT 0,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `last_sent_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `national_id` BIGINT NOT NULL,
    `nationality_id` INTEGER NOT NULL,
    `level_id` INTEGER NOT NULL,
    `gov_id` INTEGER NOT NULL,
    `faculty_id` INTEGER NOT NULL,
    `otp` CHAR(6) NULL,
    `otp_expires_at` DATETIME(0) NULL,
    `gender` ENUM('ذكر', 'أنثي') NOT NULL,
    `birth_date` DATE NOT NULL,
    `phone_number` VARCHAR(255) NOT NULL,
    `phone_otp` VARCHAR(255) NOT NULL,
    `phone_otp_expires_at` DATETIME(0) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `user_image_file` VARCHAR(255) NOT NULL,
    `national_id_file` VARCHAR(255) NOT NULL,
    `fees_file` VARCHAR(255) NOT NULL,
    `password_changed_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_students_email`(`email`),
    UNIQUE INDEX `uq_students_national_id`(`national_id`),
    UNIQUE INDEX `uq_students_phone`(`phone_number`),
    INDEX `faculty_id`(`faculty_id`),
    INDEX `gov_id`(`gov_id`),
    INDEX `level_id`(`level_id`),
    INDEX `nationality_id`(`nationality_id`, `level_id`, `gov_id`, `faculty_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `super_admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `is_confirmed` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `password_changed_at` DATETIME(0) NULL,
    `otp` CHAR(6) NULL,
    `otp_expires_at` DATETIME(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_super_admins_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `medical_exam_id` INTEGER NOT NULL,
    `hospital_id` INTEGER NOT NULL,
    `transfer_reason` VARCHAR(500) NOT NULL,
    `notes` VARCHAR(500) NULL,
    `status` ENUM('pending', 'accepted', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `hospital_id`(`hospital_id`),
    INDEX `medicExam_id`(`medical_exam_id`),
    INDEX `student_id`(`medical_exam_id`, `hospital_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_log` ADD CONSTRAINT `admin_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory` ADD CONSTRAINT `laboratory_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory` ADD CONSTRAINT `laboratory_ibfk_2` FOREIGN KEY (`medical_exam_id`) REFERENCES `medical_examinations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `laboratory` ADD CONSTRAINT `laboratory_ibfk_3` FOREIGN KEY (`medical_test_id`) REFERENCES `medical_tests`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_examinations` ADD CONSTRAINT `medical_examinations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_examinations` ADD CONSTRAINT `medical_examinations_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`nationality_id`) REFERENCES `nationality`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`gov_id`) REFERENCES `governorates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`medical_exam_id`) REFERENCES `medical_examinations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfers` ADD CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `external_hospitals`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
