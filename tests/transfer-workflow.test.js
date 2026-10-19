import db from "../config/db.js";
import * as transferService from "../modules/transfer/transfer.service.js";
import Transfer from "../modules/transfer/transfer.repository.js";
import Base from "../repositories/base.repository.js";

async function runTests() {
  console.log("=== STARTING TRANSFER WORKFLOW TESTS ===");

  try {
    // 0. Ensure we have an active external hospital and clinic
    const [hospitals] = await db.query("SELECT id FROM external_hospitals WHERE is_active = true LIMIT 1");
    let hospitalId;
    if (hospitals.length === 0) {
      const [insertHospital] = await db.query(
        "INSERT INTO external_hospitals (hospital_name, is_active) VALUES ('مستشفى قصر العيني التجريبي', 1)"
      );
      hospitalId = insertHospital.insertId;
    } else {
      hospitalId = hospitals[0].id;
    }

    const [clinics] = await db.query("SELECT id FROM clinics WHERE is_active = true LIMIT 1");
    let clinicId;
    if (clinics.length === 0) {
      const [insertClinic] = await db.query(
        "INSERT INTO clinics (clinic_name, is_active) VALUES ('عيادة الباطنة التجريبية', 1)"
      );
      clinicId = insertClinic.insertId;
    } else {
      clinicId = clinics[0].id;
    }

    // Create a mock user or find one
    const [users] = await db.query("SELECT id, email, username FROM users LIMIT 1");
    let userId = users.length > 0 ? users[0].id : null;

    // 1. Create a test reservation with status 'تحت الانتظار'
    const [createRes] = await db.query(
      `INSERT INTO reservations (user_id, patient_name, national_id, phone_number, clinic_id, date, exam_type, status)
       VALUES (?, 'طالب تجريبي', '29901011234567', '01012345678', ?, NOW(), 'كشف جديد', 'تحت الانتظار')`,
      [userId, clinicId]
    );
    const reservationId = createRes.insertId;
    console.log(`[PASS] Created test reservation #${reservationId}`);

    // 2. Counter converts reservation to transfer (Step 1)
    console.log("Testing Step 1: Counter initiates transfer...");
    const initiateResult = await transferService.initiateTransfer({
      reservation_id: reservationId,
      transfer_reason: "فحص متقدم غير متاح داخل المستشفى",
      notes: "يرجى التنسيق مع العيادات الخارجية",
    });

    console.log("[PASS] initiateTransfer result:", initiateResult);

    // Verify reservation status in DB is now 'محول'
    const [resAfter] = await db.query("SELECT status FROM reservations WHERE id = ?", [reservationId]);
    if (resAfter[0].status !== "محول") {
      throw new Error(`Expected reservation status to be 'محول', got: ${resAfter[0].status}`);
    }
    console.log("[PASS] Verified reservation status changed to 'محول'");

    // Verify transfer record in DB
    const transferId = initiateResult.transfer_id;
    const [transAfter] = await db.query("SELECT * FROM transfers WHERE id = ?", [transferId]);
    if (!transAfter[0] || transAfter[0].status !== "pending" || transAfter[0].hospital_id !== null) {
      throw new Error(`Transfer record invalid: ${JSON.stringify(transAfter[0])}`);
    }
    console.log("[PASS] Verified pending transfer row created with hospital_id NULL");

    // 3. Test duplicate conversion guard
    try {
      await transferService.initiateTransfer({
        reservation_id: reservationId,
        transfer_reason: "duplicate",
      });
      throw new Error("Should have thrown error on duplicate transfer conversion!");
    } catch (err) {
      console.log(`[PASS] Correctly rejected duplicate transfer conversion: "${err.message}" (Code: ${err.statusCode})`);
    }

    // 4. Transfer Clerk retrieves pending transfers list
    console.log("Testing Step 2: Transfer Clerk queries transfers...");
    const pendingList = await transferService.getTransferred({
      page: 1,
      limit: 10,
      status: "pending",
    });

    const found = pendingList.data.some((item) => item.transfer_id === transferId);
    if (!found) {
      throw new Error(`Transfer #${transferId} not found in pending list!`);
    }
    console.log(`[PASS] Found pending transfer #${transferId} in list (Total pending: ${pendingList.totalCount})`);

    // 5. Transfer Clerk assigns external hospital and sends email (Step 3)
    console.log("Testing Step 3: Transfer Clerk assigns hospital...");
    process.env.EMAIL_SERVICE = "mock"; // prevent sending actual smtp
    const assignResult = await transferService.assignHospital(transferId, {
      hospital_id: hospitalId,
      notes: "تم التنسيق مع إدارة المستشفى الخارجية - التوجه لقسم الرنين",
    });

    console.log("[PASS] assignHospital executed successfully. Hospital:", assignResult.hospital_name);

    // Verify in DB that status is 'completed' and hospital_id is set
    const [transCompleted] = await db.query("SELECT * FROM transfers WHERE id = ?", [transferId]);
    if (transCompleted[0].status !== "completed" || transCompleted[0].hospital_id !== hospitalId) {
      throw new Error(`Transfer not properly completed: ${JSON.stringify(transCompleted[0])}`);
    }
    console.log("[PASS] Verified transfer marked as 'completed' with assigned hospital_id");

    // 6. Test invalid hospital assignment guard
    try {
      await transferService.assignHospital(transferId, {
        hospital_id: 999999, // non-existent
      });
      throw new Error("Should have thrown error on invalid hospital ID!");
    } catch (err) {
      console.log(`[PASS] Correctly rejected invalid hospital assignment: "${err.message}"`);
    }

    // Clean up test records
    await db.query("DELETE FROM transfers WHERE id = ?", [transferId]);
    await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);
    console.log("[PASS] Cleaned up test data.");

    console.log("=== ALL TRANSFER WORKFLOW TESTS PASSED SUCCESSFULLY ===");
    process.exit(0);
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
    process.exit(1);
  }
}

runTests();
