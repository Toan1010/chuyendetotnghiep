import express, { Router } from "express";
import * as Admin from "../controllers/Admin.controller";
import { verifySupadmin, veriyAdmin } from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", verifySupadmin, Admin.GetListAdmin);
router.post("/create/", verifySupadmin, Admin.CreateAdmin);
router.put("/update-status/:id", verifySupadmin, Admin.UpdateStatus);
router.put("/update-permission/:id", verifySupadmin, Admin.UpdatePermission);

router.get("/my-info/", veriyAdmin, Admin.MyInfo);
router.put("/my-info/update", veriyAdmin, Admin.UpdateMyInfo);
router.put("/my-info/change-password", veriyAdmin, Admin.ChangePassword);

router.post("/forgot-password/", Admin.ForgotPassword);
router.post("/forgot-password/:reset/", Admin.ResetPassword);

export default router;
