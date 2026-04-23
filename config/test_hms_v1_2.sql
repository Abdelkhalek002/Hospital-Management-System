-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2026 at 06:53 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;
--
-- Database: `test_hms_v1_1`
--

-- --------------------------------------------------------
--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum(
    'hsh_2_sa_4',
    'hsh_2!sm!6',
    'hsh_4*ob*5',
    'hsh_$mcm$9',
    'hsh_3#co#0'
  ) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `is_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `password` varchar(255) NOT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (
    `id`,
    `username`,
    `email`,
    `role`,
    `is_active`,
    `is_confirmed`,
    `password`,
    `password_changed_at`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    'admin01',
    'admin01@gmail.com',
    'hsh_$mcm$9',
    1,
    0,
    '$2b$10$Mup0ek/j51FugF4L4JB3/e.wqDmf6CvUdSSjNWSNYRglGMtdVCfi6',
    NULL,
    '2026-03-17 07:15:40',
    '2026-03-17 07:15:40'
  ),
  (
    6,
    'admin02',
    'admin02@admin.io',
    '',
    1,
    0,
    '$2b$12$coDqOaLRVWUPvk8IpSIwyOFmpJt0MCA/wreEegWShJRJVZ9rHOdeO',
    NULL,
    '2026-04-22 14:53:13',
    '2026-04-22 16:02:25'
  ),
  (
    7,
    'admin03',
    'admin03@admin.io',
    '',
    0,
    0,
    '$2b$12$Q9qlVT65FhPJHE6MDh1/xe7tklGjHPeVGSGLUHH3m7btdst4pgFKu',
    NULL,
    '2026-04-22 14:57:05',
    '2026-04-22 16:00:40'
  ),
  (
    8,
    'admin04',
    'admin04@admin.io',
    '',
    0,
    0,
    '$2b$12$CTbGl5drNCFoa9XsOz/HG.Rw.Nfee6FDNS5INcurcqW9WVle.ixcu',
    NULL,
    '2026-04-22 14:58:58',
    '2026-04-22 16:00:45'
  ),
  (
    9,
    'admin05',
    'admin05@admin.io',
    '',
    0,
    0,
    '$2b$12$WwEYsyN5C1Zy1ELJSFE38OmXSmbAghcHwxGpOPDF1i0oIixAw2PZy',
    NULL,
    '2026-04-22 15:24:48',
    '2026-04-22 16:00:48'
  ),
  (
    10,
    'admin06',
    'admin06@admin.io',
    '',
    0,
    0,
    '$2b$12$dfvqL0xlIJN9xWj1CUS0r.eWocAW9dLbjrfxDownDFZKg9EE58lGS',
    NULL,
    '2026-04-22 16:13:25',
    '2026-04-22 16:13:25'
  );
-- --------------------------------------------------------
--
-- Table structure for table `admin_log`
--

CREATE TABLE `admin_log` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `method` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `admin_log`
--

INSERT INTO `admin_log` (`id`, `admin_id`, `method`, `created_at`)
VALUES (2, 6, 'اضافة ادمن جديد', '2026-04-22 12:58:58'),
  (3, 6, 'اضافة ادمن جديد', '2026-04-22 14:13:25'),
  (
    4,
    6,
    'تحويل طالب لمستشفي خارجية',
    '2026-04-23 11:59:11'
  ),
  (
    5,
    6,
    'تحويل طالب لمستشفي خارجية',
    '2026-04-23 12:04:22'
  ),
  (
    6,
    6,
    'تعديل طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:30:04'
  ),
  (
    7,
    6,
    'تحويل طالب لمستشفي خارجية',
    '2026-04-23 14:35:09'
  ),
  (
    8,
    6,
    'تعديل طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:35:26'
  ),
  (
    9,
    6,
    'تحديث طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:38:04'
  ),
  (
    10,
    6,
    'تحديث طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:39:31'
  ),
  (
    11,
    6,
    'تحديث طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:40:47'
  ),
  (
    12,
    6,
    'تحديث طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:46:15'
  ),
  (
    13,
    6,
    'تحديث طلب تحويل لمستشفي خارجية',
    '2026-04-23 14:48:22'
  );
-- --------------------------------------------------------
--
-- Table structure for table `clinics`
--

CREATE TABLE `clinics` (
  `id` int(11) NOT NULL,
  `clinic_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `clinics`
--

INSERT INTO `clinics` (`id`, `clinic_name`, `created_at`, `updated_at`)
VALUES (
    1,
    'الباطنة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'النفسية والعصبية',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    3,
    'العظام',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    4,
    'الجلدية',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `emergency_bookings`
--

CREATE TABLE `emergency_bookings` (
  `id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `national_id` bigint(20) NOT NULL,
  `type` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'طوارئ',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `external_hospitals`
--

CREATE TABLE `external_hospitals` (
  `id` int(11) NOT NULL,
  `hospital_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `external_hospitals`
--

INSERT INTO `external_hospitals` (
    `id`,
    `hospital_name`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    'الدمرداش',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'المقطم',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    3,
    'الزيتون',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` int(11) NOT NULL,
  `faculty_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `faculty_name`, `created_at`, `updated_at`)
VALUES (
    1,
    'هندسة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'علاج طبيعي',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    3,
    'طب',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    4,
    'حاسبات و ذكاء اصطناعي',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `governorates`
--

CREATE TABLE `governorates` (
  `id` int(11) NOT NULL,
  `gov_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `governorates`
--

INSERT INTO `governorates` (`id`, `gov_name`, `created_at`, `updated_at`)
VALUES (
    1,
    'القاهرة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'العريش',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    3,
    'الاقصر',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    4,
    'الإسكندرية',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    5,
    'كفر الشيخ',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `laboratory`
--

CREATE TABLE `laboratory` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `medical_exam_id` int(11) NOT NULL,
  `medical_test_id` int(11) NOT NULL,
  `test_result` enum('إيجابي', 'سلبي') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `levels`
--

CREATE TABLE `levels` (
  `id` int(11) NOT NULL,
  `level_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `levels`
--

INSERT INTO `levels` (`id`, `level_name`, `created_at`, `updated_at`)
VALUES (
    1,
    'أولي',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'ثانية',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    3,
    'تالتة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    4,
    'رابعة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    5,
    'خامسة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    6,
    'سادسة',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `medical_examinations`
--

CREATE TABLE `medical_examinations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `clinic_id` int(11) NOT NULL,
  `exam_type` enum('طواريْ', 'متابعة', 'كشف جديد') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'طواريْ',
  `status` enum('مقبول', 'تحت الانتظار') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'تحت الانتظار',
  `date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `medical_examinations`
--

INSERT INTO `medical_examinations` (
    `id`,
    `student_id`,
    `clinic_id`,
    `exam_type`,
    `status`,
    `date`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    49,
    1,
    'كشف جديد',
    'مقبول',
    '2026-04-23 15:35:54',
    '2026-04-23 13:36:43',
    '2026-04-23 13:36:43'
  );
-- --------------------------------------------------------
--
-- Table structure for table `medical_tests`
--

CREATE TABLE `medical_tests` (
  `id` int(11) NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `test_type` enum('براز', 'دم', 'مزرعة', 'بول') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `state` enum('متاح', 'غير متاح') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `nationality`
--

CREATE TABLE `nationality` (
  `id` int(11) NOT NULL,
  `nationality_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `nationality`
--

INSERT INTO `nationality` (
    `id`,
    `nationality_name`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    'مصري',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  ),
  (
    2,
    'وافد',
    '2026-03-17 07:15:41',
    '2026-03-17 07:15:41'
  );
-- --------------------------------------------------------
--
-- Table structure for table `password_reset_otps`
--

CREATE TABLE `password_reset_otps` (
  `email` varchar(255) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts_count` int(11) NOT NULL DEFAULT 0,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `last_sent_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
-- --------------------------------------------------------
--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `national_id` bigint(20) NOT NULL,
  `nationality_id` int(11) NOT NULL,
  `level_id` int(11) NOT NULL,
  `gov_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `otp` char(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `gender` enum('ذكر', 'أنثي') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `birth_date` date NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `phone_otp` varchar(255) NOT NULL,
  `phone_otp_expires_at` datetime DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `user_image_file` varchar(255) NOT NULL,
  `national_id_file` varchar(255) NOT NULL,
  `fees_file` varchar(255) NOT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `students`
--

INSERT INTO `students` (
    `id`,
    `username`,
    `email`,
    `password`,
    `national_id`,
    `nationality_id`,
    `level_id`,
    `gov_id`,
    `faculty_id`,
    `otp`,
    `otp_expires_at`,
    `gender`,
    `birth_date`,
    `phone_number`,
    `phone_otp`,
    `phone_otp_expires_at`,
    `verified`,
    `is_active`,
    `user_image_file`,
    `national_id_file`,
    `fees_file`,
    `password_changed_at`,
    `created_at`,
    `updated_at`
  )
VALUES (
    3,
    'regTest01',
    'test01@fci.helwan.edu.eg',
    '$2b$12$N88cMQ9H8OuIrnPQFlZi4esCboBMcXsSB4AaqWNsGKCMyCLWLTWiq',
    12343678916944,
    2,
    1,
    1,
    1,
    NULL,
    NULL,
    'ذكر',
    '2002-11-05',
    '1234327891',
    '',
    NULL,
    0,
    0,
    'Document-f9bddabf-13f4-418f-9206-8d8386058d62-1774455986616.jpeg',
    'Document-5aee8eee-0011-44c2-a2ca-dba45b66ef62-1774455986660.jpeg',
    'Document-f8eb2fc0-72ac-4617-9c88-eaed207e2384-1774455987011.jpeg',
    NULL,
    '2026-03-25 16:26:27',
    '2026-03-25 16:26:27'
  ),
  (
    6,
    'reqtest02',
    'test02@fci.helwan.edu.eg',
    '$2b$12$qog9qxfD1xEV4zksB9Zbpul1tRodbm7OBv..abYwLxOUG9Cym8D0.',
    12343678916945,
    2,
    1,
    1,
    1,
    NULL,
    NULL,
    'ذكر',
    '2002-11-05',
    '1234327892',
    '',
    NULL,
    0,
    1,
    'Document-488f6e35-27cc-4dfd-99c0-38a80fd9837a-1774541386170.jpeg',
    'Document-06f4930f-03d2-4550-b44e-7df1c22192e4-1774541386424.jpeg',
    'Document-4619205b-0672-43fb-a982-ee434c734a93-1774541386427.jpeg',
    NULL,
    '2026-03-26 16:09:46',
    '2026-03-26 16:48:43'
  ),
  (
    7,
    'reqtest02',
    'test03@fci.helwan.edu.eg',
    '$2b$12$D2ZdQ3rXZOyA6nBNBqiQbusUCVS3za8AZtJC0mYrIuimh5wvPJEqi',
    12343678916942,
    2,
    1,
    1,
    1,
    NULL,
    NULL,
    'ذكر',
    '2002-11-05',
    '1234327893',
    '',
    NULL,
    0,
    0,
    'Document-60598bd8-06c1-42ef-9a69-fed252e0e2b6-1774541905456.jpeg',
    'Document-2808c53f-1ef9-4740-88af-40af1b00f858-1774541905714.jpeg',
    'Document-4ddf20ec-de6a-4916-acc8-6226faac4427-1774541905716.jpeg',
    NULL,
    '2026-03-26 16:18:25',
    '2026-03-26 16:18:25'
  ),
  (
    8,
    'reqtest02',
    'test04@fci.helwan.edu.eg',
    '$2b$12$na1PCuSHNbOBLblI/Tb3c.zL.UoFhDFNBUOuyOOOHgrJ.u7BOs3fK',
    12343678916947,
    2,
    1,
    1,
    1,
    NULL,
    NULL,
    'ذكر',
    '2002-11-05',
    '1234327897',
    '',
    NULL,
    0,
    0,
    'Document-56bfa4b9-0f02-4613-ab82-d98961f1c620-1774541969510.jpeg',
    'Document-07669346-9718-4a5e-81f9-eaf8119afe59-1774541969662.jpeg',
    'Document-3d8b06de-797b-4efa-b346-58e487567c33-1774541969773.jpeg',
    NULL,
    '2026-03-26 16:19:30',
    '2026-03-26 16:19:30'
  ),
  (
    49,
    'John Doe',
    'test10@fci.helwan.edu.eg',
    '$2b$12$XBFXZWyitEOmB93tPXZxU.WAmZboFm/IEqpTKKCt3K023wKuRfAa.',
    12343678916971,
    2,
    1,
    1,
    1,
    NULL,
    NULL,
    'ذكر',
    '2002-11-05',
    '1234327898',
    '',
    NULL,
    1,
    0,
    'Document-38867ffe-4ce2-4eda-9f70-b21729e8c5cf-1775042459951.jpeg',
    'Document-4ba19cee-4fad-43a0-8b15-417a2c0d92b0-1775042460677.jpeg',
    'Document-c9a5d6aa-e9e1-4736-be53-5e3133fdff37-1775042460679.jpeg',
    NULL,
    '2026-04-01 11:21:00',
    '2026-04-01 12:24:53'
  );
-- --------------------------------------------------------
--
-- Table structure for table `super_admins`
--

CREATE TABLE `super_admins` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `is_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `password_changed_at` datetime DEFAULT NULL,
  `otp` char(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `super_admins`
--

INSERT INTO `super_admins` (
    `id`,
    `username`,
    `email`,
    `password`,
    `role`,
    `is_confirmed`,
    `is_active`,
    `password_changed_at`,
    `otp`,
    `otp_expires_at`,
    `created_at`,
    `updated_at`
  )
VALUES (
    1,
    'superAdmin001',
    'superAdmin01@hsh.io',
    '$2b$10$PsKi2UfMbZy9IqHv/eQYKeekr5zK3g/e8hCIcunbzLGfLfA.niYoG',
    'مدير النظام',
    1,
    1,
    NULL,
    NULL,
    NULL,
    '2026-03-17 07:15:40',
    '2026-04-22 13:10:40'
  ),
  (
    6,
    'SuperAdmin02',
    'test10@hsh.io',
    '$2b$12$anZHUE72UaXIW6u0v/H1PerLPxYjfXa6bU4HcvRkPR71Ne.5zcL3O',
    'مدير النظام',
    0,
    1,
    NULL,
    NULL,
    NULL,
    '2026-04-06 17:55:37',
    '2026-04-22 14:43:30'
  );
-- --------------------------------------------------------
--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` int(11) NOT NULL,
  `medical_exam_id` int(11) NOT NULL,
  `hospital_id` int(11) NOT NULL,
  `transfer_reason` varchar(500) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `status` enum('pending', 'accepted', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (
    `id`,
    `medical_exam_id`,
    `hospital_id`,
    `transfer_reason`,
    `notes`,
    `status`,
    `created_at`,
    `updated_at`
  )
VALUES (
    2,
    1,
    1,
    'سميلامشسيبشهعسيب',
    'شيسلبلهشسيلبلهعشسيل',
    'pending',
    '2026-04-23 14:04:22',
    '2026-04-23 14:04:22'
  ),
  (
    3,
    1,
    2,
    'fgh sff',
    'ddeffwww',
    'pending',
    '2026-04-23 16:35:09',
    '2026-04-23 16:35:09'
  );
--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admins_email` (`email`),
  ADD UNIQUE KEY `uq_admins_username` (`username`);
--
-- Indexes for table `admin_log`
--
ALTER TABLE `admin_log`
ADD PRIMARY KEY (`id`),
  ADD KEY `admin_log_ibfk_1` (`admin_id`);
--
-- Indexes for table `clinics`
--
ALTER TABLE `clinics`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_clinics_name` (`clinic_name`);
--
-- Indexes for table `emergency_bookings`
--
ALTER TABLE `emergency_bookings`
ADD PRIMARY KEY (`id`);
--
-- Indexes for table `external_hospitals`
--
ALTER TABLE `external_hospitals`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_hospitals_name` (`hospital_name`);
--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_faculties_name` (`faculty_name`);
--
-- Indexes for table `governorates`
--
ALTER TABLE `governorates`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_governorates_name` (`gov_name`);
--
-- Indexes for table `laboratory`
--
ALTER TABLE `laboratory`
ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `medical_exam_id` (`medical_exam_id`),
  ADD KEY `medical_test_id` (`medical_test_id`);
--
-- Indexes for table `levels`
--
ALTER TABLE `levels`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_levels_name` (`level_name`);
--
-- Indexes for table `medical_examinations`
--
ALTER TABLE `medical_examinations`
ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `clinic_id` (`clinic_id`);
--
-- Indexes for table `medical_tests`
--
ALTER TABLE `medical_tests`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_medical_tests_name` (`test_name`);
--
-- Indexes for table `nationality`
--
ALTER TABLE `nationality`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_nationality_name` (`nationality_name`);
--
-- Indexes for table `password_reset_otps`
--
ALTER TABLE `password_reset_otps`
ADD PRIMARY KEY (`email`);
--
-- Indexes for table `students`
--
ALTER TABLE `students`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_students_email` (`email`),
  ADD UNIQUE KEY `uq_students_national_id` (`national_id`),
  ADD UNIQUE KEY `uq_students_phone` (`phone_number`),
  ADD KEY `nationality_id` (
    `nationality_id`,
    `level_id`,
    `gov_id`,
    `faculty_id`
  ),
  ADD KEY `level_id` (`level_id`),
  ADD KEY `gov_id` (`gov_id`),
  ADD KEY `faculty_id` (`faculty_id`);
--
-- Indexes for table `super_admins`
--
ALTER TABLE `super_admins`
ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_super_admins_email` (`email`);
--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`medical_exam_id`, `hospital_id`),
  ADD KEY `medicExam_id` (`medical_exam_id`),
  ADD KEY `hospital_id` (`hospital_id`);
--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 11;
--
-- AUTO_INCREMENT for table `admin_log`
--
ALTER TABLE `admin_log`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 14;
--
-- AUTO_INCREMENT for table `clinics`
--
ALTER TABLE `clinics`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 5;
--
-- AUTO_INCREMENT for table `emergency_bookings`
--
ALTER TABLE `emergency_bookings`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 2;
--
-- AUTO_INCREMENT for table `external_hospitals`
--
ALTER TABLE `external_hospitals`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 4;
--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 5;
--
-- AUTO_INCREMENT for table `governorates`
--
ALTER TABLE `governorates`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 6;
--
-- AUTO_INCREMENT for table `laboratory`
--
ALTER TABLE `laboratory`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `levels`
--
ALTER TABLE `levels`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 7;
--
-- AUTO_INCREMENT for table `medical_examinations`
--
ALTER TABLE `medical_examinations`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 2;
--
-- AUTO_INCREMENT for table `medical_tests`
--
ALTER TABLE `medical_tests`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `nationality`
--
ALTER TABLE `nationality`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 3;
--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 50;
--
-- AUTO_INCREMENT for table `super_admins`
--
ALTER TABLE `super_admins`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 13;
--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 4;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_log`
--
ALTER TABLE `admin_log`
ADD CONSTRAINT `admin_log_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE
SET NULL ON UPDATE CASCADE;
--
-- Constraints for table `laboratory`
--
ALTER TABLE `laboratory`
ADD CONSTRAINT `laboratory_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `laboratory_ibfk_2` FOREIGN KEY (`medical_exam_id`) REFERENCES `medical_examinations` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `laboratory_ibfk_3` FOREIGN KEY (`medical_test_id`) REFERENCES `medical_tests` (`id`) ON UPDATE CASCADE;
--
-- Constraints for table `medical_examinations`
--
ALTER TABLE `medical_examinations`
ADD CONSTRAINT `medical_examinations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_examinations_ibfk_2` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON UPDATE CASCADE;
--
-- Constraints for table `students`
--
ALTER TABLE `students`
ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`nationality_id`) REFERENCES `nationality` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `levels` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`gov_id`) REFERENCES `governorates` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `students_ibfk_4` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON UPDATE CASCADE;
--
-- Constraints for table `transfers`
--
ALTER TABLE `transfers`
ADD CONSTRAINT `transfers_ibfk_1` FOREIGN KEY (`medical_exam_id`) REFERENCES `medical_examinations` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transfers_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `external_hospitals` (`id`) ON UPDATE CASCADE;
COMMIT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;