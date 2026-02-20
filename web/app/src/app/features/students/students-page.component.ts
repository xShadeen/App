import { Component, inject, signal } from '@angular/core';
import { Student } from './student.model';
import { StudentsService } from './students.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/internal/operators/finalize';

@Component({
  standalone: true,
  selector: 'app-students-page',
  templateUrl: './students-page.component.html',
  styleUrls: ['./students-page.component.scss'],
})
export class StudentsPageComponent {
  private studentsService = inject(StudentsService);

  loading = signal(true);

  students = toSignal(
    this.studentsService.getStudents().pipe(finalize(() => this.loading.set(false))),
    { initialValue: [] as Student[] },
  );
}
