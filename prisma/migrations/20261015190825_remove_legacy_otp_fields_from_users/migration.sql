/*
  Warnings:

  - You are about to drop the column `otp` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expires_at` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone_otp` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone_otp_expires_at` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `super_admins` table. All the data in the column will be lost.
  - You are about to drop the column `otp_expires_at` on the `super_admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `students` DROP COLUMN `otp`,
    DROP COLUMN `otp_expires_at`,
    DROP COLUMN `phone_otp`,
    DROP COLUMN `phone_otp_expires_at`;

-- AlterTable
ALTER TABLE `super_admins` DROP COLUMN `otp`,
    DROP COLUMN `otp_expires_at`;
