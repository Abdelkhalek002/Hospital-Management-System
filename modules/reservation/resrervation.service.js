import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";
import Reservation from "./reservation.repository.js";

export const isAccepted = async (id, operation) => {
  if (operation === 1) return await new Reservation().accept(id);
  if (operation === 0) return !(await new Reservation().decline(id));
  throw new ApiError(
    "error reciveing operation data (only 1 or 0)",
    StatusCode.BAD_REQUEST,
  );
};
