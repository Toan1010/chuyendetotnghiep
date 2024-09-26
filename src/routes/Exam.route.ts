import express, { Router } from "express";
import {
  verifyAccessToken,
  verifyCanExam,
  verifyStudent,
  
} from "../middlewares/authentication";
import * as ExamController from "../controllers/Exam.controller";

const router: Router = express.Router();

router.get("/list/",ExamController.ListExam);//v
router.get("/list-question/:exam_id", ExamController.AllQuestionOnExam);//v
router.get("/list-student/:exam_id",  ExamController.ListStudentAttend);

router.get("/list-attend/:exam_id", ExamController.AllExamResult);
router.get("/detail-result/:result_id", ExamController.DetailResult);
// wait
router.post("/attend/:exam_id", verifyStudent);
router.post("/submit/:exam_id", verifyStudent);
//check done
router.get("/detail/:exam_id", ExamController.DetailExam);
router.post("/create/:course_id", ExamController.CreateExam);
router.put("/update/:exam_id", ExamController.UpdateExam);
router.delete("/delete/:exam_id", ExamController.DeleteExam);
// check done
router.post("/add-questions/:exam_id", ExamController.AddQuestions);
router.post("/add-question/:exam_id", ExamController.AddQuestion);
router.get("/detail-question/:question_id", ExamController.DetailQuestion);
router.put("/update-question/:question_id", ExamController.UpdateQuestion);
router.delete("/delete-question/:question_id", ExamController.DeleteQuestion);

export default router;
