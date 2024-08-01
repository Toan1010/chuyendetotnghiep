import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";

class Student extends Model {
  public id!: number;
  public student_name!: string;
  public student_email!: string;
  public hash_password!: string;
  public phone!: string;
  public avatar!: string;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    student_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [10, 10],
          msg: "Phone number must be exactly 10 digits",
        },
        isNumeric: {
          msg: "Phone number must contain only digits",
        },
      },
    },
  },
  { tableName: "student", sequelize, timestamps: false }
);
export default Student;
