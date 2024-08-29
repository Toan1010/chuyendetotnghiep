import { DataType, Model } from "sequelize";
import sequelize from "../configurations/database";

class Admin extends Model {
  public id!: number;
  public fullName!: string;
  public role!: string;
  public hashPassword!: string;
  public status!: boolean;
}


