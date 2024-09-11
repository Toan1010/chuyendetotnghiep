import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Topic from "./Topic.Model";

class Survey extends Model {
  public id!: number;
  public topic_id!: number;
  public name!: string;
  public description!: string;
  public slug!: string;
  public dueAt!: Date;
}

Survey.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    topic_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Topic,
        key: "id",
      },
      allowNull: true,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    dueAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  },
  { sequelize, timestamps: true, tableName: "survey" }
);

export default Survey;
