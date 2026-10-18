-- 1. Drop foreign keys referencing medical_examinations
ALTER TABLE `laboratory` DROP FOREIGN KEY `laboratory_ibfk_2`;
ALTER TABLE `transfers` DROP FOREIGN KEY `transfers_ibfk_1`;

-- 2. Modify laboratory: rename medical_exam_id to reservation_id and make user_id nullable
ALTER TABLE `laboratory`
  CHANGE COLUMN `medical_exam_id` `reservation_id` INTEGER NOT NULL,
  MODIFY COLUMN `user_id` INTEGER NULL;

-- 3. Modify transfers: rename medical_exam_id to reservation_id
ALTER TABLE `transfers`
  CHANGE COLUMN `medical_exam_id` `reservation_id` INTEGER NOT NULL;

-- 4. Update index names
ALTER TABLE `transfers` RENAME INDEX `medicExam_id` TO `reservation_id`;
ALTER TABLE `transfers` RENAME INDEX `transfer_medic_hospital_idx` TO `transfer_res_hospital_idx`;
ALTER TABLE `laboratory` RENAME INDEX `medical_exam_id` TO `reservation_id`;

-- 5. Drop foreign keys on medical_examinations before renaming
ALTER TABLE `medical_examinations` DROP FOREIGN KEY `medical_examinations_ibfk_1`;
ALTER TABLE `medical_examinations` DROP FOREIGN KEY `medical_examinations_ibfk_2`;

-- 6. Rename table medical_examinations to reservations
RENAME TABLE `medical_examinations` TO `reservations`;

-- 7. Modify reservations table: make user_id & clinic_id nullable, add guest walk-in fields, set default date
ALTER TABLE `reservations`
  MODIFY COLUMN `user_id` INTEGER NULL,
  MODIFY COLUMN `clinic_id` INTEGER NULL,
  ADD COLUMN `patient_name` VARCHAR(255) NULL AFTER `user_id`,
  ADD COLUMN `national_id` VARCHAR(14) NULL AFTER `patient_name`,
  ADD COLUMN `phone_number` VARCHAR(255) NULL AFTER `national_id`,
  MODIFY COLUMN `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 8. Re-add foreign keys on reservations
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- 9. Re-add foreign keys on laboratory and transfers pointing to reservations
ALTER TABLE `laboratory`
  ADD CONSTRAINT `laboratory_ibfk_2` FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE `transfers`
  ADD CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- 10. Drop redundant emergency_bookings table
DROP TABLE IF EXISTS `emergency_bookings`;
