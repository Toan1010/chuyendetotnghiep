import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";

class Survey extends Model {
  public id!: number;
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
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
