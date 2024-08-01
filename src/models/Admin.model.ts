import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";
import { AdminRole } from "../type";

class Admin extends Model {
  public id!: number;
  public admin_name!: string;
  public admin_email!: string;
  public hash_password!: string;
  public role!: AdminRole;
  public phone!: string;
  public avatar!: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admin_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("super_admin", "student_admin", "course_admin"),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [10, 10],
          msg: "Phone number must be exactly 10 digits",
        },
        isNumeric: {
          msg: "Phone number must contain only digits",
        },
      },
    },
  },
  { tableName: "admin", sequelize, timestamps: false }
);
export default Admin;
