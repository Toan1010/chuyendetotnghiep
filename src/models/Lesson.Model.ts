import { DataTypes, Model } from "sequelize";
import sequelize from "../configurations/database";
import Course from "./Course.Model";

class Lesson extends Model {
  public id!: number;
  public course_id!: number;
  public inCourse!: number;
  public name!: string;
  public description!: string;
  public context!: string;
  public slug!: string;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    course_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: Course,
        key: "id",
      },
      allowNull: false,
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    inCourse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    context: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { tableName: "lesson", sequelize, timestamps: true }
);

Course.hasMany(Lesson, { foreignKey: "course_id", as: "lesson" });
Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

export default Lesson;
