import express, { Router } from "express";
import * as Auth from "../controllers/Auth.controller";

const router: Router = express.Router();

router.post("/student/", Auth.LoginStudent);
router.post("/admin/", Auth.LoginAdmin);
router.post("/refresh/", Auth.RefreshToken);
router.post("/logout/", Auth.Logout);

export default router;
