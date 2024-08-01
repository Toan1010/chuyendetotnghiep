import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";

class Course extends Model {
  public id!: number;
  public course_name!: string;
  public course_description!: string;
  public course_image!: string;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    course_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    course_image: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
  },
  {
    tableName: "course",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Course;
