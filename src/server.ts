import express from "express";
import path from "path";
import cors from "cors";
import routes from "./routes/index.route";

import env from "./configurations/environment";
import { responseFormatter } from "./middlewares/formatResponse";
import { authenticateDatabase, syncDatabase } from "./configurations/database";

const app = express();
const port = env.port;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(responseFormatter);
routes(app);

const startServer = async () => {
  try {
    await authenticateDatabase();
    await syncDatabase();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
      console.log(`http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
  }
};

startServer();
