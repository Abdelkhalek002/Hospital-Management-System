import Base from "../../repositories/base.repository.js";
import Student from "../../repositories/student.repository.js";
import { StatusCode } from "../../utils/status-codes.js";

export const getMe = async (user) => {
  const result = await new Student().getOne(user.id);
  return result;
};

export const updateMe = async (user, data) => {
  // 1. check existence
  // a. level
  const levelExists = await new Base("levels").findById();
  if (!levelExists) throw new ApiError("Invalid Level Data");
  // a. governorate
  const govExists = await new Base("governorates").findById();
  if (!govExists) throw new ApiError("Invalid Level Data");

  // 2. update data
  // 4. return result

  // const nationalIdSql = "SELECT COUNT(*) AS count FROM students WHERE national_id = ?";

  db.query(levelCheckSql, [level_id], (err, levelResult) => {
    if (err) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ msg: "Error checking level_id: " + err.message });
    } else if (levelResult[0].count === 0) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .json({ msg: `Invalid level_id: ${level_id}` });
    } else {
      db.query(govCheckSql, [gov_id], (err, govResult) => {
        if (err) {
          return res
            .status(StatusCode.BAD_REQUEST)
            .json({ msg: "Error checking gov_id: " + err.message });
        } else if (govResult[0].count === 0) {
          return res
            .status(StatusCode.BAD_REQUEST)
            .json({ msg: `Invalid gov_id: ${gov_id}` });
        } else {
          // db.query(nationalIdSql, [national_id], (err, nationalIdResult) => {
          //   if (err) {
          //     return res.status(StatusCode.BAD_REQUEST).json({ msg: "Error checking national_id: " + err.message });
          //   } else if (nationalIdResult[0].count > 0) {
          //     return res.status(StatusCode.CONFLICT).json({ msg: `الرقم القومي موجود بالفعل` });
          //   } else {
          // If both level_id and gov_id are valid and national_id does not exist, proceed to update the user profile
          const sql =
            "UPDATE students SET userName=?, phone_number=?, level_id=?, gov_id=?, national_id=? WHERE student_id=?";
          db.query(
            sql,
            [userName, phone_number, level_id, gov_id, national_id, student_id],
            (err, result) => {
              if (err) {
                return res.status(StatusCode.BAD_REQUEST).json(err.message);
              } else {
                if (result.affectedRows === 0) {
                  return res
                    .status(StatusCode.NOT_FOUND)
                    .json({ msg: `No student found with ID ${student_id}` });
                } else {
                  return res
                    .status(StatusCode.OK)
                    .json({ message: "تم تحديث البيانات بنجاح" });
                }
              }
            },
          );
        }
      });
    }
  });
};
