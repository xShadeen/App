import { Group } from './group.model';

export interface Student {
  id: number;
  firstName: string;
  email?: string;
  phone: string;
  isActive: boolean;
  deletedAt?: Date | null;
  group?: Group | null;
}

export interface CreateStudentDto {
  firstName: string;
  email?: string;
  phone: string;
}

export enum StudentListType {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
