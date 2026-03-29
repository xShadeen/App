import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Lesson } from '../models/lesson.model';
import { environment } from '../../../../enviorments/enviorment';
@Injectable({
  providedIn: 'root',
})
export class LessonsService {
  private http = inject(HttpClient);

  getLessons(studentId: number, year: number, month: number) {
    return this.http.get<Lesson[]>(
      `${environment.apiUrl}/lessons/student/${studentId}?year=${year}&month=${month}`,
    );
  }
  markAsPaid(lessonId: number) {
    return this.http.patch(`${environment.apiUrl}/lessons/${lessonId}/paid`, {});
  }

  updateNotes(lessonId: number, notes: string) {
    return this.http.patch(`${environment.apiUrl}/lessons/${lessonId}/note`, { notes });
  }
}
