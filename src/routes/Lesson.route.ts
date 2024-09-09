import express, { Router } from "express";
import * as Lesson from "../controllers/Lesson.controller";
import { verifyCanCourse } from "../middlewares/authentication";

const router: Router = express.Router();

router.put("/update/:id", verifyCanCourse, Lesson.UpdateLesson);
router.delete("/delete/:id", verifyCanCourse, Lesson.DeleteLesson);

export default router;
