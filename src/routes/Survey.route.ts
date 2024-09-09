import express, { Router } from "express";
import * as Survey from "../controllers/Survey.controller";
import { verifyAccessToken, verifyStudent, verifySupadmin } from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", verifyAccessToken, Survey.GetListSurvey);
router.get("/:survey_id/", verifyAccessToken, Survey.DetailSurvey);

router.post("/attend/:survey_id", verifyStudent, Survey.TakeSurvey)

router.post("/create/", verifySupadmin, Survey.CreateSurvey);
router.put("/update/:id", verifySupadmin, Survey.UpdateSurvey);
router.delete("/delete/:id", verifySupadmin, Survey.DeleteSurvey);

export default router;
