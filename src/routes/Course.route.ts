import express, { Router } from "express";
import * as Course from "../controllers/Course.controller";
import {
  verifyAccessToken,
  verifyCanCourse,
} from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", verifyAccessToken, Course.GetListCourse);
router.get("/:slug", verifyAccessToken, Course.DetailCourse);

router.post("/create/", verifyCanCourse, Course.CreateCourse);
router.post("/add-student/:id", verifyCanCourse, Course.AddToCourse);

router.put("/update/:id", verifyCanCourse, Course.UpdateCourse);
router.delete("/delete/:id", verifyCanCourse, Course.DeleteCourse);

export default router;
