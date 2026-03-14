import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../students.service';
import { Student } from '../student.model';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
})
export class StudentDetailsComponent {
  private route = inject(ActivatedRoute);
  private studentsService = inject(StudentsService);

  student = signal<Student | null>(null);
  loading = signal(true);
  error = signal(false);
  notFound = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
          this.notFound.set(false);
          this.student.set(null);
        }),
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.studentsService.getStudentById(id);
        }),
        catchError((err) => {
          this.loading.set(false);

          if (err.status === 404) {
            this.notFound.set(true);
          } else {
            this.error.set(true);
          }

          return of(null);
        }),
      )
      .subscribe((student) => {
        this.student.set(student);
        this.loading.set(false);
      });
  }
}
