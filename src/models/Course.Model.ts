import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Topic from "./Topic.Model";

class Course extends Model {
  public id!: number;
  public topic_id!: number;
  public name!: string;
  public description!: string;
  public thumbnail!: string;
  public slug!: string;
  public type!: boolean;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
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
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "course.png",
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  { tableName: "course", sequelize, timestamps: true }
);

Topic.hasMany(Course, { foreignKey: "topic_id", as: "course" });
Course.belongsTo(Topic, { foreignKey: "topic_id", as: "topic" });

export default Course;
