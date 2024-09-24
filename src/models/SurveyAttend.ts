import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Survey from "./Survey.Model";
import Student from "./Student.Model";

class SurveyAttend extends Model {
  public id!: number;
  public survey_id!: number;
  public student_id!: number;
  public detail!: object;
}

SurveyAttend.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    survey_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Survey,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Student,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    detail: {
      type: DataTypes.JSON, 
    },
  },
  { sequelize, timestamps: true, tableName: "survey_attend" }
);

SurveyAttend.belongsTo(Survey, { foreignKey: "survey_id", as: "survey" });
SurveyAttend.belongsTo(Student, { foreignKey: "student_id", as: "student" });

Survey.hasMany(SurveyAttend, { foreignKey: "survey_id", as: "attend" });
Student.hasMany(SurveyAttend, { foreignKey: "student_id", as: "attend" });

export default SurveyAttend;
