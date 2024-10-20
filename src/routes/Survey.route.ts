import express, { Router } from "express";
import * as Survey from "../controllers/Survey.controller";
import {
  optionalAuth,
  verifyAccessToken,
  verifyStudent,
  verifyAdmin,
} from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", optionalAuth, Survey.GetListSurvey);
router.get("/:slug/", verifyAccessToken, Survey.DetailSurvey);
router.get("/student-list/:slug", verifyAdmin, Survey.GetListAttendSurvey);

router.post("/attend/:survey_id", verifyStudent, Survey.TakeSurvey);

router.post("/create/", verifyAdmin, Survey.CreateSurvey);
router.put("/update/:id", verifyAdmin, Survey.UpdateSurvey);
router.delete("/delete/:id", verifyAdmin, Survey.DeleteSurvey);

export default router;
