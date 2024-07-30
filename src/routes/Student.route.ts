import express, { Router } from "express";
import * as Student from "../controllers/Student.controller";

const router: Router = express.Router();

router.get("/list/", Student.ListStudent);
router.post("/create/", Student.AddNewStudent);
router.post("/create/bulk/", Student.BulkAdd);
router.get("/:id", Student.DetailStudent);
router.put("/:id", Student.UpdateStudent);
router.delete("/:id", Student.DeleteStudent);

export default router;
