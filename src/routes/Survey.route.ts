import express, { Router } from "express";
import * as Survey from "../controllers/Survey.controller";
import {
  optionalAuth,
  verifyAccessToken,
  verifyStudent,
  verifySupadmin,
} from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", optionalAuth, Survey.GetListSurvey);
router.get("/:slug/", verifyAccessToken, Survey.DetailSurvey);

router.post("/attend/:survey_id", verifyStudent, Survey.TakeSurvey);

router.post("/create/", verifySupadmin, Survey.CreateSurvey);
router.put("/update/:id", verifySupadmin, Survey.UpdateSurvey);
router.delete("/delete/:id", verifySupadmin, Survey.DeleteSurvey);

export default router;
