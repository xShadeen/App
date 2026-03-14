import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from './student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/students';

  getStudents() {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number) {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(data: { firstName: string }) {
    return this.http.post<Student>(this.apiUrl, data);
  }

  deleteStudent(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
