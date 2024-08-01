import { Sequelize } from "sequelize";
import env from "./environment";

// Tạo một instance của Sequelize với cấu hình từ biến môi trường
const sequelize = new Sequelize(env.db_name, env.db_user, env.db_password, {
  host: env.db_host,
  port: env.db_port,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Hàm kiểm tra kết nối với cơ sở dữ liệu
async function authenticateDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
}

// Hàm đồng bộ hóa các mô hình với cơ sở dữ liệu
async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (err) {
    console.error("An error occurred while synchronizing the models:", err);
    throw err;
  }
}

// Xuất các hàm và instance của Sequelize
export default sequelize;
export { authenticateDatabase, syncDatabase };
