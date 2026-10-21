import asyncHandler from "express-async-handler";
import * as systemDataService from "./system-data.service.js";
import { SYSTEM_DATA_RESOURCES } from "./system-data.repository.js";
import { StatusCode } from "../../utils/status-codes.js";
import { logAction } from "../../utils/audit-log.js";
import { AuditAction } from "../../utils/audit-actions.js";

const extractName = (req, resourceKey) => {
  const config = SYSTEM_DATA_RESOURCES[resourceKey];
  return (
    req.body[config.column] ??
    req.body[config.alias] ??
    req.body.name ??
    req.body.hospital_name ??
    req.body.clinic_name ??
    req.body.faculty_name ??
    req.body.gov_name ??
    req.body.level_name);
};

const extractId = (req, resourceKey) => {
  const config = SYSTEM_DATA_RESOURCES[resourceKey];
  return (
    req.params.id ??
    req.params[config.paramKey] ??
    req.params.clinic_id ??
    req.params.faculty_id ??
    req.params.gov_id ??
    req.params.exHosp_id ??
    req.params.level_id
  );
};

const extractIsActive = (req) => {
  if (req.body.is_active !== undefined) {
    return req.body.is_active === true || req.body.is_active === "true" || req.body.is_active === 1 || req.body.is_active === "1";
  }
  if (req.body.isActive !== undefined) {
    return req.body.isActive === true || req.body.isActive === "true" || req.body.isActive === 1 || req.body.isActive === "1";
  }
  return undefined;
};

export const createItem = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const name = extractName(req, resourceKey);
    const isActive = extractIsActive(req) ?? true;
    const data = await systemDataService.createOne(resourceKey, name, isActive);

    logAction(req, {
      action: AuditAction.SYSTEM_DATA_CREATE,
      entityType: resourceKey,
      entityId: data?.id || data?.insertId || null,
      details: { name, isActive, resource: SYSTEM_DATA_RESOURCES[resourceKey]?.label },
      method: `إضافة ${SYSTEM_DATA_RESOURCES[resourceKey]?.label || resourceKey} جديد`,
    });

    return res.status(StatusCode.CREATED).json({
      status: "success",
      message: `تم إضافة ${SYSTEM_DATA_RESOURCES[resourceKey].label} بنجاح`,
      data,
    });
  });

export const getItems = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const { active, is_active, status } = req.query;
    let isActiveFilter;
    if (active === "true" || is_active === "true" || status === "active") {
      isActiveFilter = true;
    } else if (active === "false" || is_active === "false" || status === "inactive") {
      isActiveFilter = false;
    }

    const results = await systemDataService.getAll(resourceKey, { isActive: isActiveFilter });
    return res.status(StatusCode.OK).json(results);
  });

export const getItem = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const id = extractId(req, resourceKey);
    const data = await systemDataService.getOne(resourceKey, id);

    return res.status(StatusCode.OK).json({
      status: "success",
      data,
    });
  });

export const updateItem = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const id = extractId(req, resourceKey);
    const name = extractName(req, resourceKey);
    const isActive = extractIsActive(req);
    const data = await systemDataService.updateOne(resourceKey, id, { name, isActive });

    logAction(req, {
      action: AuditAction.SYSTEM_DATA_UPDATE,
      entityType: resourceKey,
      entityId: id,
      details: { name, isActive, resource: SYSTEM_DATA_RESOURCES[resourceKey]?.label },
      method: `تعديل ${SYSTEM_DATA_RESOURCES[resourceKey]?.label || resourceKey}`,
    });

    return res.status(StatusCode.OK).json({
      status: "success",
      message: `تم تعديل ${SYSTEM_DATA_RESOURCES[resourceKey].label} بنجاح`,
      data,
    });
  });

export const deleteItem = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const id = extractId(req, resourceKey);
    const data = await systemDataService.deleteOne(resourceKey, id);

    logAction(req, {
      action: AuditAction.SYSTEM_DATA_DELETE,
      entityType: resourceKey,
      entityId: id,
      details: { resource: SYSTEM_DATA_RESOURCES[resourceKey]?.label },
      method: `حذف ${SYSTEM_DATA_RESOURCES[resourceKey]?.label || resourceKey}`,
    });

    return res.status(StatusCode.OK).json({
      status: "success",
      message: `تم حذف ${SYSTEM_DATA_RESOURCES[resourceKey].label} بنجاح`,
      data,
      id: Number(id),
    });
  });

// Clinics
export const createClinic = createItem("clinics");
export const getAllClinics = getItems("clinics");
export const getOneClinic = getItem("clinics");
export const updateClinic = updateItem("clinics");
export const deleteClinic = deleteItem("clinics");

// Faculties
export const createFaculty = createItem("faculties");
export const getAllFaculties = getItems("faculties");
export const getOneFaculty = getItem("faculties");
export const updateFaculty = updateItem("faculties");
export const deleteFaculty = deleteItem("faculties");

// Governorates
export const createGovernorate = createItem("governorates");
export const GetAllGovernorates = getItems("governorates");
export const getOneGovernorate = getItem("governorates");
export const updateGovernorate = updateItem("governorates");
export const deleteGovernorate = deleteItem("governorates");

// Hospitals
export const createHospital = createItem("hospitals");
export const getAllhospitals = getItems("hospitals");
export const getOneHospital = getItem("hospitals");
export const updateHospital = updateItem("hospitals");
export const deleteHospital = deleteItem("hospitals");

// Levels
export const createLevel = createItem("levels");
export const GetAllLevels = getItems("levels");
export const getOneLevel = getItem("levels");
export const updateLevel = updateItem("levels");
export const DeleteLevel = deleteItem("levels");
