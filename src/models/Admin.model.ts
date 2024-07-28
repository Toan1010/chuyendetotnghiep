import sequelize from "../configurations/database";
import { DataTypes, Model } from "sequelize";

class Admin extends Model {
  public id!: number;
  public admin_name!: string;
  public admin_email!: string;
  public hash_password!: string;
  public role!: string;
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
      type: DataTypes.STRING,
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
