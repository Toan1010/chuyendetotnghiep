import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Survey from "./Survey.Model";

class SurveyQuestion extends Model {
  public id!: number;
  public survey_id!: number;
  public name!: string;
  public yes!: number;
  public no!: number;
}

SurveyQuestion.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    yes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { sequelize, timestamps: false, tableName: "survey_question" }
);

Survey.hasMany(SurveyQuestion, { foreignKey: "survey_id", as: "question" });
SurveyQuestion.belongsTo(Survey, { foreignKey: "survey_id", as: "survey" });

export default SurveyQuestion;
