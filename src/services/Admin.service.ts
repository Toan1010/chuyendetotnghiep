import Admin from "../models/Admin.model";

export const getListAdmin = async () => {};

export const getAdminByID = async (id: number) => {
  const admin = await Admin.findByPk(id);
  return admin;
};

export const getAdminbyEmail = async (email: string) => {
  const admin = await Admin.findOne({ where: { admin_email: email } });
  return admin;
};
