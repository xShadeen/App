import { inject, Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { map, Observable } from 'rxjs';
import { StudentsService } from '../services/students.service';
import { Student, StudentListType } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentListResolver implements Resolve<Student[]> {
  studentsService = inject(StudentsService);

  resolve(route: ActivatedRouteSnapshot): Observable<Student[]> {
    const type = route.data['type'] as StudentListType;

    return this.studentsService.getStudents().pipe(
      map((students) => {
        if (type === StudentListType.INACTIVE) {
          return students.filter((s) => !s.isActive);
        }

        return students.filter((s) => s.isActive);
      }),
    );
  }
}
