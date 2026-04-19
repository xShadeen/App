import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Student, StudentListType } from '../../models/student.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { StudentsService } from '../../services/students.service';
import { DatePipe } from '@angular/common';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../../core/toast/toast.service';

const HIGHLIGHT_STORAGE_KEY = 'studentListHighlight';

function sortStudentsByName(students: Student[]): Student[] {
  return [...students].sort((a, b) =>
    a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' }),
  );
}

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  imports: [DatePipe, ConfirmModalComponent],
})
export class StudentListComponent {
  private studentsService = inject(StudentsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private data = toSignal(this.route.data);
  /** Emits whenever `triggerRefresh()` runs (e.g. after delete); resolver data alone does not update. */
  private studentsFromApi = toSignal(this.studentsService.students$);

  protected studentsState = signal<Student[]>([]);
  protected searchQuery = signal('');
  protected highlightedStudentId = signal<number | null>(null);

  protected listType = computed(() => this.data()?.['type'] as StudentListType | undefined);

  protected isInactiveList = computed(() => this.listType() === StudentListType.INACTIVE);

  protected listTitle = computed(() =>
    this.isInactiveList() ? 'Inactive students' : 'Active students',
  );

  protected displayedStudents = computed(() => {
    const sorted = sortStudentsByName(this.studentsState());
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((s) => s.firstName.toLowerCase().includes(q));
  });

  protected showRestoreModal = signal(false);
  protected studentToRestore = signal<Student | null>(null);
  protected restoringIds = signal<number[]>([]);

  constructor() {
    effect(() => {
      const type = this.listType();
      if (type === undefined) return;

      const resolved = this.data()?.['students'] as Student[] | undefined;
      const fromApi = this.studentsFromApi();
      const allStudents = fromApi !== undefined ? fromApi : (resolved ?? []);

      const filtered =
        type === StudentListType.INACTIVE
          ? allStudents.filter((s) => !s.isActive)
          : allStudents.filter((s) => s.isActive);

      this.studentsState.set(sortStudentsByName(filtered));

      const raw = sessionStorage.getItem(HIGHLIGHT_STORAGE_KEY);
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as { listType: StudentListType; studentId: number };
        if (parsed.listType !== type) return;

        const sid = Number(parsed.studentId);
        if (!filtered.some((s) => Number(s.id) === sid)) {
          sessionStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
          return;
        }

        this.highlightedStudentId.set(sid);
        sessionStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
      } catch {
        sessionStorage.removeItem(HIGHLIGHT_STORAGE_KEY);
      }
    });

    effect((onCleanup) => {
      const id = this.highlightedStudentId();
      if (id == null) return;

      const t = window.setTimeout(() => this.highlightedStudentId.set(null), 4000);
      onCleanup(() => window.clearTimeout(t));
    });

    effect(() => {
      if (this.searchQuery().trim().length > 0) {
        this.highlightedStudentId.set(null);
      }
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  goToDetails(student: Student) {
    const type = this.listType();
    if (type === undefined) return;

    sessionStorage.setItem(
      HIGHLIGHT_STORAGE_KEY,
      JSON.stringify({ listType: type, studentId: Number(student.id) }),
    );
    void this.router.navigate(['/students', student.id]);
  }

  isHighlighted(student: Student): boolean {
    const h = this.highlightedStudentId();
    return h != null && Number(student.id) === h;
  }

  onRestore(student: Student) {
    this.studentToRestore.set(student);
    this.showRestoreModal.set(true);
  }

  confirmRestore() {
    const student = this.studentToRestore();
    if (!student) return;

    const id = Number(student.id);

    this.restoringIds.set([...this.restoringIds(), id]);

    this.studentsService.restoreStudent(id).subscribe({
      next: () => {
        this.toast.show(`“${student.firstName}” was restored`, 'success');
        this.studentsState.update((students) =>
          sortStudentsByName(students.filter((s) => Number(s.id) !== id)),
        );
        this.restoringIds.update((ids) => ids.filter((i) => i !== id));
        this.closeModal();
      },
      error: () => {
        this.toast.show('Could not restore student', 'error');
        this.restoringIds.update((ids) => ids.filter((i) => i !== id));
        this.closeModal();
      },
    });
  }

  closeModal() {
    this.showRestoreModal.set(false);
    this.studentToRestore.set(null);
  }
}
