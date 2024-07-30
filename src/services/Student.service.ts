import Student from "../models/Student.model";

export const getListStudent = async () => {};

export const getStudentByID = async (id: number) => {
  const student = await Student.findByPk(id);
  return student;
};

export const getStudentbyEmail = async (email: string) => {
  const student = await Student.findOne({ where: { student_email: email } });
  return student;
};

export const changePassword = async (email: string, password: string) => {
  const [updated] = await Student.update(
    { hash_password: password },
    { where: { student_email: email } }
  );
  return updated > 0;
};
