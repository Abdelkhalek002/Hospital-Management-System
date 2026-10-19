-- AlterTable reservations: add 'محول' to status enum
ALTER TABLE `reservations` MODIFY COLUMN `status` ENUM('مقبول', 'تحت الانتظار', 'مرفوض', 'محول') NOT NULL DEFAULT 'تحت الانتظار';

-- AlterTable transfers: allow hospital_id to be NULL
ALTER TABLE `transfers` MODIFY COLUMN `hospital_id` INT NULL;
