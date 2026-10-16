-- 1. Drop old foreign keys and indexes
ALTER TABLE `laboratory` DROP FOREIGN KEY `laboratory_ibfk_1`;
ALTER TABLE `medical_examinations` DROP FOREIGN KEY `medical_examinations_ibfk_1`;
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_1`;
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_2`;
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_3`;
ALTER TABLE `students` DROP FOREIGN KEY `students_ibfk_4`;

DROP INDEX `student_id` ON `laboratory`;
DROP INDEX `student_id` ON `medical_examinations`;

-- 2. Migrate super_admins data into admins table before altering
-- First ensure role column can take string/temporary value if needed
ALTER TABLE `admins` MODIFY `role` VARCHAR(255) NOT NULL;

UPDATE `admins` SET `role` = 'SUPER_ADMIN' WHERE `role` = 'hsh_2_sa_4' OR `role` = 'super_admin';
UPDATE `admins` SET `role` = 'SECOND_MANAGER' WHERE `role` = 'hsh_2!sm!6' OR `role` = 'second_manager';
UPDATE `admins` SET `role` = 'OBSERVER' WHERE `role` = 'hsh_4*ob*5' OR `role` = 'observer' OR `role` = 'viewer';
UPDATE `admins` SET `role` = 'MEDICAL_CHECK_MANAGER' WHERE `role` = 'hsh_$mcm$9' OR `role` = 'medical_check_manager';
UPDATE `admins` SET `role` = 'COUNTER' WHERE `role` = 'hsh_3#co#0' OR `role` = 'counter';
UPDATE `admins` SET `role` = 'TRANSFER_CLERK' WHERE `role` = 'transfer_clerk';

-- Insert any super_admins into admins if not already present
INSERT INTO `admins` (`username`, `email`, `password`, `role`, `is_active`, `is_confirmed`, `created_at`, `updated_at`)
SELECT `username`, `email`, `password`, 'SUPER_ADMIN', `is_active`, `is_confirmed`, `created_at`, `updated_at`
FROM `super_admins`
ON DUPLICATE KEY UPDATE `role` = 'SUPER_ADMIN';

-- Drop super_admins table
DROP TABLE `super_admins`;

-- Alter admins table to new structure
ALTER TABLE `admins`
  ADD COLUMN `profile_photo_path` VARCHAR(255) NULL,
  ADD COLUMN `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active';

UPDATE `admins` SET `status` = IF(`is_active` = 1, 'active', 'inactive');
UPDATE `admins` SET `profile_photo_path` = `profile_photo` WHERE `profile_photo` IS NOT NULL;

ALTER TABLE `admins`
  DROP COLUMN `is_active`,
  DROP COLUMN `is_confirmed`,
  DROP COLUMN `profile_photo`,
  MODIFY `role` ENUM('SUPER_ADMIN', 'SECOND_MANAGER', 'MEDICAL_CHECK_MANAGER', 'COUNTER', 'TRANSFER_CLERK', 'OBSERVER') NOT NULL;

-- 3. Rename students table to users and update columns
RENAME TABLE `students` TO `users`;

ALTER TABLE `users`
  MODIFY `national_id` VARCHAR(14) NOT NULL,
  CHANGE COLUMN `user_image_file` `user_image_path` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `national_id_file` `national_id_path` VARCHAR(255) NOT NULL,
  CHANGE COLUMN `fees_file` `fees_path` VARCHAR(255) NOT NULL;

-- Update unique constraints/indexes on users if needed
ALTER TABLE `users`
  RENAME INDEX `uq_students_email` TO `uq_users_email`,
  RENAME INDEX `uq_students_national_id` TO `uq_users_national_id`,
  RENAME INDEX `uq_students_phone` TO `uq_users_phone`;

-- 4. Update laboratory and medical_examinations: rename student_id to user_id
ALTER TABLE `laboratory`
  CHANGE COLUMN `student_id` `user_id` INTEGER NOT NULL;

ALTER TABLE `medical_examinations`
  CHANGE COLUMN `student_id` `user_id` INTEGER NOT NULL;

-- 5. Update emergency_bookings
ALTER TABLE `emergency_bookings`
  CHANGE COLUMN `student_name` `user_name` VARCHAR(255) NOT NULL,
  MODIFY `national_id` VARCHAR(14) NOT NULL;

-- 6. Update transfers index
ALTER TABLE `transfers` RENAME INDEX `student_id` TO `transfer_medic_hospital_idx`;

-- 7. Re-create indexes and foreign keys
CREATE INDEX `user_id` ON `laboratory`(`user_id`);
CREATE INDEX `user_id` ON `medical_examinations`(`user_id`);

ALTER TABLE `laboratory` ADD CONSTRAINT `laboratory_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE `medical_examinations` ADD CONSTRAINT `medical_examinations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`nationality_id`) REFERENCES `nationality`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`gov_id`) REFERENCES `governorates`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `users_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculties`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
