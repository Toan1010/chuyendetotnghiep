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
  expired: string; // Hoặc Date nếu bạn lưu trữ dưới dạng đối tượng Date
}
