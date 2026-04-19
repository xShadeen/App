import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { Student } from '../../models/student.model';
import { StudentsService } from '../../services/students.service';
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
import { phoneValidator } from '../../../../core/phone.validator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../models/group.model';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule],
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent {
  @ViewChild('firstNameInput')
  private firstNameInput?: ElementRef<HTMLInputElement>;

  private studentsService = inject(StudentsService);
  private groupsService = inject(GroupsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private refresh$ = new Subject<void>();
  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    email: ['', Validators.email],
    phone: ['', [Validators.required, phoneValidator]],
    groupId: [''],
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

  groups = toSignal(this.groupsService.getGroups().pipe(catchError(() => of([]))), {
    initialValue: [],
  });
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
      `Student “${value.firstName}” was added`,
    );
  }

  private handleAction(
    request$: Observable<unknown>,
    onSuccess: () => void,
    errorMessage: string,
    successToast?: string,
  ) {
    this.actionError.set(null);
    this.actionLoading.set(true);

    request$
      .pipe(
        tap(() => {
          onSuccess();
          if (successToast) {
            this.toast.show(successToast, 'success');
          }
        }),
        catchError((err) => {
          const msg = err?.error?.message || errorMessage;
          this.actionError.set(msg);
          this.toast.show(msg, 'error');
          return EMPTY;
        }),
        finalize(() => this.actionLoading.set(false)),
      )
      .subscribe();
  }
}
