import crypto from "crypto";
import env from "../configurations/environment";
import { ResetPasswordData } from "../type";

const key = env.crypto_key;

const encrypt = (data: any) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(key).slice(0, 16)
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encryptedText: any): ResetPasswordData => {
   const decipher = crypto.createDecipheriv(
     "aes-256-cbc",
     Buffer.from(key, "utf-8"),
     Buffer.from(key.slice(0, 16), "utf-8") // Sử dụng 16 byte đầu tiên của key làm IV
   );

   let decrypted = decipher.update(encryptedText, "hex", "utf8");
   decrypted += decipher.final("utf8");

   // Chuyển đổi chuỗi JSON thành đối tượng
   return JSON.parse(decrypted);
};

export { encrypt, decrypt };
