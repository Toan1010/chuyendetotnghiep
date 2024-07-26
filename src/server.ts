import express from "express";
import path from "path";
import cors from "cors";

import env from "./configurations/enviroment";
import { responseFormatter } from "./middlewares/formatResponse";

const app = express();
const port = env.port;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(responseFormatter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


