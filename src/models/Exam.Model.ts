import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Course from "./Course.Model";

class Exam extends Model {
  public id!: number;
  public name!: string;
  public numberQuestion!: number;
  public passingQuestion!: number;
  public submitTime!: number;
  public reDoTime!: number;
  public course_id!: number;
}

Exam.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
    },
    numberQuestion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 10,
      },
    },
    passingQuestion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    submitTime: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 20,
      },
    },
    reDoTime: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Course,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  { sequelize, timestamps: true, tableName: "exam" }
);

Course.hasMany(Exam, { foreignKey: "course_id", as: "course_exam" });
Exam.belongsTo(Course, { foreignKey: "course_id", as: "exam_course" });

export default Exam;
