import express, { Router } from "express";
import {
  verifyAccessToken,
  verifyAdmin,
  verifyCanExam,
  verifyStudent,
  
} from "../middlewares/authentication";
import * as ExamController from "../controllers/Exam.controller";

const router: Router = express.Router();

router.get("/list/", ExamController.ListExam);//v
router.get("/list-question/:exam_id", verifyCanExam, ExamController.AllQuestionOnExam);//v
router.get("/list-student/:exam_id", verifyAdmin, ExamController.ListStudentAttend);

router.get("/list-attend/:exam_id",verifyAccessToken , ExamController.AllExamResult);//v
router.get("/detail-result/:result_id",verifyAccessToken, ExamController.DetailResultExam);//v
// wait
router.get("/attend/:exam_id", verifyStudent, ExamController.AttendExam);
router.post("/submit/:result_id", verifyStudent, ExamController.SubmitExam);
//check done
router.get("/detail/:exam_id",verifyAccessToken, ExamController.DetailExam);
router.post("/create/:course_id", verifyCanExam,ExamController.CreateExam);
router.put("/update/:exam_id", verifyCanExam,ExamController.UpdateExam);
router.delete("/delete/:exam_id", verifyCanExam,ExamController.DeleteExam);
// check done
router.post("/add-questions/:exam_id", verifyCanExam,ExamController.AddQuestions);
router.post("/add-question/:exam_id", verifyCanExam,ExamController.AddQuestion);
router.get("/detail-question/:question_id", verifyCanExam,ExamController.DetailQuestion);
router.put("/update-question/:question_id", verifyCanExam,ExamController.UpdateQuestion);
router.delete("/delete-question/:question_id", verifyCanExam,ExamController.DeleteQuestion);

export default router;
