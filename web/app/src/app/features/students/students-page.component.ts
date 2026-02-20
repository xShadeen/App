import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { Student } from './student.model';
import { StudentsService } from './students.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  finalize,
  startWith,
  switchMap,
  tap,
  Subject,
  catchError,
  of,
  EMPTY,
  Observable,
} from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-students-page',
  templateUrl: './students-page.component.html',
  styleUrls: ['./students-page.component.scss'],
})
export class StudentsPageComponent {
  @ViewChild('firstNameInput')
  private firstNameInput?: ElementRef<HTMLInputElement>;

  private studentsService = inject(StudentsService);
  private fb = inject(FormBuilder);
  private refresh$ = new Subject<void>();
  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    email: ['', Validators.email],
    phone: ['', Validators.required],
  });

  loading = signal(true);
  error = signal<string | null>(null);
  actionError = signal<string | null>(null);
  actionLoading = signal(false);

  students = toSignal(
    this.refresh$.pipe(
      startWith(void 0),
      switchMap(() => {
        this.loading.set(true);
        return this.studentsService.getStudents().pipe(
          catchError((err) => {
            this.error.set('Failed to load students');
            return of([] as Student[]);
          }),
          finalize(() => this.loading.set(false)),
        );
      }),
    ),
    { initialValue: [] as Student[] },
  );

  onSubmit() {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();

    this.handleAction(
      this.studentsService.createStudent(value),
      () => {
        this.form.reset();
        this.refresh$.next();
        this.firstNameInput?.nativeElement.focus();
      },
      'Failed to create student',
    );
  }

  onDelete(id: string) {
    this.handleAction(
      this.studentsService.deleteStudent(id),
      () => {
        this.refresh$.next();
      },
      'Failed to delete student',
    );
  }

  private handleAction(request$: Observable<unknown>, onSuccess: () => void, errorMessage: string) {
    this.actionError.set(null);
    this.actionLoading.set(true); // ⭐ DODAJ TO

    request$
      .pipe(
        tap(() => {
          onSuccess();
        }),
        catchError(() => {
          this.actionError.set(errorMessage);
          return EMPTY;
        }),
        finalize(() => this.actionLoading.set(false)),
      )
      .subscribe();
  }
}
