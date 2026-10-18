import SystemDataRepository, {
  SYSTEM_DATA_RESOURCES,
} from "./system-data.repository.js";
import ApiError from "../../utils/api-error.js";
import { StatusCode } from "../../utils/status-codes.js";

export const getAll = async (resourceKey, filter = {}) => {
  const repo = new SystemDataRepository(resourceKey);
  return await repo.getAll(filter);
};

export const getOne = async (resourceKey, id) => {
  const repo = new SystemDataRepository(resourceKey);
  const item = await repo.getById(id);
  if (!item) {
    throw new ApiError(`${repo.config.label} غير موجود`, StatusCode.NOT_FOUND);
  }
  return item;
};

export const createOne = async (resourceKey, name, isActive = true) => {
  const repo = new SystemDataRepository(resourceKey);
  const exists = await repo.existsByName(name);
  if (exists) {
    throw new ApiError(
      `${repo.config.label} (${name}) موجود بالفعل`,
      StatusCode.CONFLICT,
    );
  }

  const result = await repo.create(name, isActive);
  return {
    id: result.insertId,
    [repo.config.column]: name,
    [repo.config.alias]: name,
    is_active: Boolean(isActive),
  };
};

export const updateOne = async (resourceKey, id, updateData) => {
  const repo = new SystemDataRepository(resourceKey);

  // 1. Check if item exists
  const existing = await repo.getById(id);
  if (!existing) {
    throw new ApiError(`${repo.config.label} غير موجود`, StatusCode.NOT_FOUND);
  }

  const isObject = typeof updateData === "object" && updateData !== null;
  const name = isObject ? updateData.name : updateData;
  const isActive = isObject ? updateData.isActive : undefined;

  // 2. Check duplicate name excluding current item if name is changing
  if (name && name !== existing[repo.config.column]) {
    const isDuplicate = await repo.existsByName(name, id);
    if (isDuplicate) {
      throw new ApiError(
        `${repo.config.label} (${name}) موجود بالفعل`,
        StatusCode.CONFLICT,
      );
    }
  }

  await repo.update(id, { name, isActive });
  return await repo.getById(id);
};

export const deleteOne = async (resourceKey, id) => {
  const repo = new SystemDataRepository(resourceKey);

  // 1. Check if item exists
  const existing = await repo.getById(id);
  if (!existing) {
    throw new ApiError(`${repo.config.label} غير موجود`, StatusCode.NOT_FOUND);
  }

  try {
    await repo.delete(id);
    return {
      id: Number(id),
      name: existing[repo.config.column],
    };
  } catch (error) {
    // Foreign key constraint violation: connected to other tables
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.errno === 1451) {
      throw new ApiError(
        `لا يمكن حذف ${repo.config.label} لوجود بيانات مرتبطة به في النظام`,
        StatusCode.BAD_REQUEST,
      );
    }
    throw error;
  }
};
