import express, { Router } from "express";
import * as Admin from "../controllers/Admin.controller";
import { verifySupadmin, veriyAdmin } from "../middlewares/authentication";

const router: Router = express.Router();

router.get("/list/", verifySupadmin, Admin.GetListAdmin);
router.post("/create/", verifySupadmin, Admin.CreateAdmin);
router.put("/update_status/:id", verifySupadmin, Admin.UpdateStatus);
router.put("/update_permission/:id", verifySupadmin, Admin.UpdatePermission);

router.get("/my_info/", veriyAdmin, Admin.MyInfo);
router.put("/my_info/update", veriyAdmin, Admin.UpdateMyInfo);
router.put("/my_info/change_password", veriyAdmin, Admin.ChangePassword);

router.post("/forgot_password/", Admin.ForgotPassword);
router.post("/forgot_password/:reset/", Admin.ResetPassword);

export default router;
