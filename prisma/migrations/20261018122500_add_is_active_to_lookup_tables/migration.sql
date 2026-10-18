-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE `external_hospitals` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE `faculties` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE `governorates` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE `levels` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;

-- AlterTable
ALTER TABLE `nationality` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE;
