export interface Student {
  id: string;
  firstName: string;
  email?: string;
  phone: string;
}

export interface CreateStudentDto {
  firstName: string;
  email?: string;
  phone: string;
}
