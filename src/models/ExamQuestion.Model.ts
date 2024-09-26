import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Exam from "./Exam.Model";

class ExamQuestion extends Model {
  public id!: number;
  public name!: string;
  public type!: "radio" | "checkbox";
  public choice!: string[];
  public correctAns!: string[];
  public exam_id!: number;
}

ExamQuestion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("radio", "checkbox"),
      allowNull: false,
    },
    choice: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correctAns: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    exam_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Exam,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  { sequelize, tableName: "exam_question", timestamps: false }
);

Exam.hasMany(ExamQuestion, { foreignKey: "exam_id", as: "exam_quesion" });
ExamQuestion.belongsTo(Exam, { foreignKey: "exam_id", as: "quesion_exam" });

export default ExamQuestion;
