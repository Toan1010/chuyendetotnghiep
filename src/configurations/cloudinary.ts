import env from "./environment";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: env.cloud_name,
  api_key: env.cloud_key,
  api_secret: env.cloud_secret,
});

export default cloudinary;
