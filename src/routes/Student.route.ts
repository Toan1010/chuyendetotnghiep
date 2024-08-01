import express, { Router } from "express";
import * as Student from "../controllers/Student.controller";

const router: Router = express.Router();

router.get("/list/", Student.ListStudent); // v
router.post("/create/", Student.AddNewStudent); // v
router.post("/create/bulk/", Student.BulkAdd); // x
router.get("/:id", Student.DetailStudent); // v
router.put("/:id", Student.UpdateStudent); // v

export default router;
