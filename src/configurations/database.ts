import { Sequelize } from "sequelize";
import env from "./environment";

const sequelize = new Sequelize(env.db_name, env.db_user, env.db_password, {
  host: env.db_host,
  port: env.db_port,
  dialect: "mysql",
  logging: false,
});

async function authenticateDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
}

async function syncDatabase() {
  try {
    // await sequelize.sync({alter: true});
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (err) {
    console.error("An error occurred while synchronizing the models:", err);
    throw err;
  }
}

export default sequelize;
export { authenticateDatabase, syncDatabase };
