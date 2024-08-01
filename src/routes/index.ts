import express, { Express, Router } from "express";
import AuthRoute from "./Auth.route";
import StudentRoute from "./Student.route";
// import Course from "../models/Course.model";
// import SubcribeCourse from "../models/SubcribeCourse.model";
// import Lesson from "../models/Lesson.model";

const router: Router = express.Router();
const routes = (app: Express): void => {
  router.use("/auth", AuthRoute);
  router.use("/student", StudentRoute);
  // router.use("/course", async (req, res) => {
  //   await Course.findAll();
  // });
  // router.use("/sub", async (req, res) => {
  //   await SubcribeCourse.findAll();
  // });
  // router.use("/less", async (req, res) => {
  //   await Lesson.findAll();
  // });
  // // router.use("/course");

  app.use("/api", router);
};
export default routes;
