import express, { Router } from "express";
import * as Auth from "../controllers/Auth.controller";

const router: Router = express.Router();

router.post("/student/create/", Auth.LoginStudent);
router.post("/admin/create/", Auth.LoginAdmin);
router.post("/refresh/", Auth.RefreshToken);
router.post("/logout/", Auth.Logout);
router.post("/forgot_password/", Auth.ForgotPassword);
router.post("/forgot_password/:id/", Auth.ResetPassword);

export default router;
