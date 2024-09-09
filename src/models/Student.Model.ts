import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";

class Student extends Model {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public hashPassword!: string;
  public status!: boolean;
  public avatar!: string;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    hashPassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: "avatar.png",
    },
  },
  { tableName: "student", sequelize, timestamps: true }
);

export default Student;
