import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";
import Student from "./Student.model";
import Course from "./Course.model";

class SubcribeCourse extends Model {
  public id!: number;
  public student_id!: string;
  public course_id!: string;
  public rate!: number;
  public process_lesson!: number;
}

SubcribeCourse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Student,
        key: "id",
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: "id",
      },
    },
    rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    process_lesson: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    tableName: "subcribe_course",
    sequelize,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Course.hasMany(SubcribeCourse, {
  foreignKey: "course_id",
  as: "subcribe_course",
});
SubcribeCourse.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Student.hasMany(SubcribeCourse, {
  foreignKey: "student_id",
  as: "subcribe_course",
});
SubcribeCourse.belongsTo(Student, { foreignKey: "course_id", as: "student" });

export default SubcribeCourse;
