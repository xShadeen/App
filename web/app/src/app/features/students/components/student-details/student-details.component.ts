import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../services/students.service';
import { Student } from '../../models/student.model';
import { catchError, of, switchMap, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LessonsService } from '../../services/lessons.service';
import { Lesson } from '../../models/lesson.model';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
  imports: [MatCardModule, MatProgressSpinnerModule, DatePipe, MatIcon],
})
export class StudentDetailsComponent {
  private route = inject(ActivatedRoute);
  private studentsService = inject(StudentsService);
  private lessonsService = inject(LessonsService);

  student = signal<Student | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  error = signal(false);
  notFound = signal(false);
  currentDate = signal(new Date());
  editingLessonId = signal<number | null>(null);
  currentMonthLabel = computed(() => {
    const date = this.currentDate();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  lessonsParams = computed(() => {
    const date = this.currentDate();
    const student = this.student();

    if (!student) return null;

    return {
      studentId: student.id,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  });

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

    // 🔥 lessons effect
    effect(() => {
      const params = this.lessonsParams();
      if (!params) return;

      this.lessonsService
        .getLessons(Number(params.studentId), params.year, params.month)
        .subscribe((lessons) => {
          // console.log('Lessons loaded:', lessons);
          this.lessons.set(lessons);
        });
    });
  }

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }
  togglePaid(lesson: Lesson) {
    const previous = lesson.paid;

    // optimistic update
    lesson.paid = !lesson.paid;

    this.lessonsService.markAsPaid(lesson.id).subscribe({
      next: () => {
        console.log('Updated successfully');
      },
      error: () => {
        // rollback jeśli coś pójdzie nie tak
        lesson.paid = previous;
        console.error('Failed to update');
      },
    });
  }

  startEditing(lesson: any) {
    this.editingLessonId.set(lesson.id);

    setTimeout(() => {
      const input = document.querySelector('input');
      input?.focus();
    });
  }

  cancelEditing(lesson: any) {
    this.editingLessonId.set(null);
  }
  saveNotes(lesson: any, event: any) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    const previous = lesson.notes;

    lesson.notes = newValue;
    this.editingLessonId.set(null);

    this.lessonsService.updateNotes(lesson.id, newValue).subscribe({
      error: () => {
        lesson.notes = previous;
        console.error('Failed to update notes');
      },
    });
  }
}
