import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Topic from "./Topic.Model";

class Exam extends Model {
  public id!: number;
  public name!: string;
  public slug!: string;
  public numberQuestion!: number;
  public passingQuestion!: number;
  public submitTime!: number;
  public reDoTime!: number;
  public studentDid!: number;
  public topic_id!: number;
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    studentDid: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    topic_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Topic,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  { sequelize, timestamps: true, tableName: "exam" }
);

Topic.hasMany(Exam, { foreignKey: "topic_id", as: "exam" });
Exam.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });

export default Exam;
