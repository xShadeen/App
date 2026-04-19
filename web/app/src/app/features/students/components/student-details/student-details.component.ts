import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsService } from '../../services/students.service';
import { Student } from '../../models/student.model';
import { catchError, combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LessonsService } from '../../services/lessons.service';
import { Lesson } from '../../models/lesson.model';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GroupsService } from '../../services/groups.service';
import { Group } from '../../models/group.model';
import { ToastService } from '../../../../core/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
  imports: [
    MatCardModule,
    MatProgressSpinnerModule,
    DatePipe,
    MatIcon,
    MatButtonModule,
  ],
})
export class StudentDetailsComponent {
  private route = inject(ActivatedRoute);
  private studentsService = inject(StudentsService);
  private lessonsService = inject(LessonsService);
  private groupsService = inject(GroupsService);
  private toast = inject(ToastService);

  student = signal<Student | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  error = signal(false);
  notFound = signal(false);
  currentDate = signal(new Date());
  editingLessonId = signal<number | null>(null);

  groupPickerOpen = signal(false);
  groupPickerGroups = signal<Group[]>([]);
  groupPickerSelectedId = signal<string | null>(null);
  groupPickerError = signal<string | null>(null);
  groupActionError = signal<string | null>(null);
  smsModalOpen = signal(false);

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

    if (!student?.isActive) return null;

    return {
      studentId: student.id,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    };
  });

  constructor() {
    const studentId$ = this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      distinctUntilChanged(),
    );

    combineLatest([studentId$, this.studentsService.students$])
      .pipe(
        tap(([id]) => {
          const cur = this.student();
          const idChanged = cur == null || cur.id !== id;
          if (idChanged) {
            this.loading.set(true);
            this.error.set(false);
            this.notFound.set(false);
            this.student.set(null);
          }
        }),
        switchMap(([id]) =>
          this.studentsService.getStudentById(id).pipe(
            catchError((err) => {
              this.loading.set(false);

              if (err.status === 404) {
                this.notFound.set(true);
              } else {
                this.error.set(true);
              }

              return of(null);
            }),
          ),
        ),
      )
      .subscribe((student) => {
        this.student.set(student);
        this.loading.set(false);
      });

    effect(() => {
      const params = this.lessonsParams();
      if (!params) {
        this.lessons.set([]);
        return;
      }

      this.lessonsService
        .getLessons(Number(params.studentId), params.year, params.month)
        .subscribe((lessons) => {
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

    lesson.paid = !lesson.paid;

    this.lessonsService.markAsPaid(lesson.id).subscribe({
      next: () => {
        console.log('Updated successfully');
      },
      error: () => {
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

  openGroupPicker() {
    const s = this.student();
    if (!s) return;

    this.groupActionError.set(null);
    this.groupPickerError.set(null);

    this.groupsService.getGroups().subscribe({
      next: (groups) => {
        this.groupPickerGroups.set(groups);
        this.groupPickerSelectedId.set(s.group?.id ?? null);
        this.groupPickerOpen.set(true);
      },
      error: () => {
        this.groupActionError.set('Could not load groups');
        this.toast.show('Could not load groups', 'error');
      },
    });
  }

  closeGroupPicker() {
    this.groupPickerOpen.set(false);
    this.groupPickerError.set(null);
  }

  onPickerSelectChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.groupPickerSelectedId.set(value === '' ? null : value);
  }

  canConfirmGroup(): boolean {
    const groups = this.groupPickerGroups();
    const sel = this.groupPickerSelectedId();
    return groups.length === 0 ? false : sel != null;
  }

  confirmGroupPicker() {
    const s = this.student();
    if (!s || !this.canConfirmGroup()) return;

    const groupId = this.groupPickerSelectedId();
    this.groupPickerError.set(null);

    this.studentsService.updateStudentGroup(s.id, groupId).subscribe({
      next: (student) => {
        this.student.set(student);
        this.closeGroupPicker();
        this.toast.show('Group updated', 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Could not update group';
        this.groupPickerError.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  removeFromGroupInPicker() {
    const s = this.student();
    if (!s) return;

    this.groupPickerError.set(null);

    this.studentsService.updateStudentGroup(s.id, null).subscribe({
      next: (student) => {
        this.student.set(student);
        this.closeGroupPicker();
        this.toast.show('Removed from group', 'success');
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Could not update group';
        this.groupPickerError.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  dismissGroupActionError() {
    this.groupActionError.set(null);
  }

  openSmsModal() {
    this.smsModalOpen.set(true);
  }

  closeSmsModal() {
    this.smsModalOpen.set(false);
  }
}
