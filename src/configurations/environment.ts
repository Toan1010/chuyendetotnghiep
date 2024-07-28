import dotenv from "dotenv";

dotenv.config();

interface Environment {
  port: number;
  access_token_key: string;
  refresh_token_key: string;
  crypto_key: string;
  db_host: string;
  db_port: number;
  db_user: string;
  db_password: string;
  db_name: string;
  email_app: string;
  email_password: string;
}

const environment: Environment = {
  port: parseInt(process.env.PORT || "3000", 10),
  access_token_key: process.env.JWT_ACCESS_KEY || "",
  crypto_key: process.env.CRYPTO_KEY || "",
  refresh_token_key: process.env.JWT_REFRESH_KEY || "",
  db_host: process.env.DB_HOST || "",
  db_port: parseInt(process.env.DB_PORT || "3306", 10),
  db_user: process.env.DB_USER || "root",
  db_password: process.env.DB_PASSWORD || "",
  db_name: process.env.DB_NAME || "chuyendetotnghiep",
  email_app: process.env.EMAIL_APP || "",
  email_password: process.env.EMAIL_PASSWORD || "",
};

export default environment;
