import express, { Express, Router } from "express";
import AuthRoute from "./Auth.route";

const router: Router = express.Router();
const routes = (app: Express): void => {
  router.use("/auth",AuthRoute);

  app.use("/api", router);
};
export default routes;
