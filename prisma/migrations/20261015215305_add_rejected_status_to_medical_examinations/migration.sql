-- AlterTable
ALTER TABLE `medical_examinations` MODIFY `status` ENUM('مقبول', 'تحت الانتظار', 'مرفوض') NOT NULL DEFAULT 'تحت الانتظار';
