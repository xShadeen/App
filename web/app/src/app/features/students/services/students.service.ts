import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '../models/student.model';
import { map } from 'rxjs/internal/operators/map';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/students';

  private refresh$ = new BehaviorSubject<void>(undefined);
  students$ = this.refresh$.pipe(switchMap(() => this.getStudents()));

  triggerRefresh() {
    this.refresh$.next();
  }
  getStudents() {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudentById(id: number) {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(data: { firstName: string }) {
    return this.http.post<Student>(this.apiUrl, data).pipe(
      tap(() => {
        this.triggerRefresh();
      }),
    );
  }

  deleteStudent(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getActiveStudents() {
    return this.getStudents().pipe(map((students) => students.filter((s) => s.isActive)));
  }

  restoreStudent(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/restore`, {}).pipe(
      tap(() => {
        this.triggerRefresh();
      }),
    );
  }

  removeFromGroup(studentId: number) {
    return this.http.patch(`${this.apiUrl}/${studentId}/group`, {
      groupId: null,
    });
  }
}
