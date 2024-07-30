import express, { Express, Router } from "express";
import AuthRoute from "./Auth.route";
import StudentRoute from "./Student.route";

const router: Router = express.Router();
const routes = (app: Express): void => {
  router.use("/auth", AuthRoute);
  router.use("/student", StudentRoute);
  // router.use("/admin");
  // router.use("/course");

  app.use("/api", router);
};
export default routes;
