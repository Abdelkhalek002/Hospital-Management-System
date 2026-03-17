import express from "express";

// Import all system data routes
import clinics from "./clinics.js";
import faculties from "./faculties.js";
import governorates from "./governorates.js";
import hospitals from "./hospitals.js";
import levels from "./levels.js";

const router = express.Router();

// Mount all system data routes under one parent router
router.use(clinics);
router.use(faculties);
router.use(governorates);
router.use(hospitals);
router.use(levels);

export default router;
