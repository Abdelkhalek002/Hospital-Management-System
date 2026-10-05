import asyncHandler from "express-async-handler";
import * as systemDataService from "./system-data.service.js";
import { SYSTEM_DATA_RESOURCES } from "./system-data.repository.js";
import { StatusCode } from "../../utils/status-codes.js";

const extractName = (req, resourceKey) => {
  const config = SYSTEM_DATA_RESOURCES[resourceKey];
  return (
    req.body[config.column] ??
    req.body[config.alias] ??
    req.body.name ??
    req.body.hospital_name ??
    req.body.hospName ??
    req.body.clinic_name ??
    req.body.clinicName ??
    req.body.faculty_name ??
    req.body.facultyName ??
    req.body.gov_name ??
    req.body.govName ??
    req.body.level_name ??
    req.body.levelName
  );
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

export const createItem = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const name = extractName(req, resourceKey);
    const data = await systemDataService.createOne(resourceKey, name);

    return res.status(StatusCode.CREATED).json({
      status: "success",
      message: `تم إضافة ${SYSTEM_DATA_RESOURCES[resourceKey].label} بنجاح`,
      data,
    });
  });

export const getItems = (resourceKey) =>
  asyncHandler(async (req, res) => {
    const results = await systemDataService.getAll(resourceKey);
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
    const data = await systemDataService.updateOne(resourceKey, id, name);

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
