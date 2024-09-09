import express, { Router } from "express";
import * as Course from "../controllers/Course.controller";
import * as Lesson from "../controllers/Lesson.controller";
import {
  verifyAccessToken,
  verifyCanCourse,
} from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", verifyAccessToken, Course.GetListCourse);
router.get("/:id", verifyAccessToken, Course.DetailCourse);
router.get("/list_lesson/:id", verifyAccessToken, Lesson.ListLessonInCourse);

router.post("/create/", verifyCanCourse, Course.CreateCourse);
router.post("/add_lesson/:id", verifyCanCourse, Lesson.CreateLesson);
router.post("/add_student/:id", verifyCanCourse, Course.AddToCourse);

router.put("/update/:id", verifyCanCourse, Course.UpdateCourse);
router.delete("/delete/:id", verifyCanCourse, Course.DeleteCourse);

export default router;
