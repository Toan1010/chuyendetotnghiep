export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  STUDENT_ADMIN = "student_admin",
  COURSE_ADMIN = "course_admin",
}

export interface TokenPayload {
  id: number;
  name: string;
  role: string;
}

export interface ResetPasswordData {
  email: string;
  expired: string;
}

export interface Student {
  student_name: string;
  student_email: string;
  hash_password: string;
  phone: string;
  avatar: string;
}

export interface UpdateStudentData {
  student_name?: string;
  student_email?: string;
  phone?: string;
  avatar?: string;
}
