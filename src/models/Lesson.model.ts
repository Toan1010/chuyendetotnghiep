import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";
import Course from "./Course.model";

class Lesson extends Model {
  public id!: number;
  public course_id!: number;
  public lesson_name!: string;
  public lesson_description!: string;
  public lesson_context!: string;
}

Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: "id",
      },
    },
    lesson_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lesson_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lesson_context: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "lesson",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Course.hasMany(Lesson, { foreignKey: "course_id", as: "lesson" });
Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

export default Lesson;
