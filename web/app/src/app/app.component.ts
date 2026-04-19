import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StudentsService } from './features/students/services/students.service';
import { ConfirmModalComponent } from './features/components/confirm-modal/confirm-modal.component';
import { Student } from './features/students/models/student.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { CalendarService } from './features/students/services/calendar.service';
import { ToastService } from './core/toast/toast.service';
import { ToastContainerComponent } from './core/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ConfirmModalComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  studentsService = inject(StudentsService);
  calendarService = inject(CalendarService);
  private toast = inject(ToastService);

  protected readonly studentsOpen = signal(false);
  protected readonly sidebarStudentSearch = signal('');
  students = toSignal(this.studentsService.students$, { initialValue: [] });
  protected readonly selectedStudent = signal<Student | null>(null);
  protected readonly isDeleteModalOpen = signal(false);
  protected isSyncing = signal(false);

  activeStudents = computed(() => {
    const q = this.sidebarStudentSearch().trim().toLowerCase();
    const active = this.students().filter((s) => s.isActive);
    const sorted = [...active].sort((a, b) =>
      a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' }),
    );
    if (!q) return sorted;
    return sorted.filter((s) => s.firstName.toLowerCase().includes(q));
  });

  constructor() {
    const hasSynced = localStorage.getItem('calendarSynced');

    if (!hasSynced) {
      this.calendarService.syncCalendar().subscribe({
        next: () => {
          localStorage.setItem('calendarSynced', 'true');
        },
        error: (err) => {
          console.error('Calendar sync failed', err);
        },
      });
    }
  }

  toggleStudents() {
    this.studentsOpen.set(!this.studentsOpen());
  }

  onSidebarSearchInput(event: Event) {
    this.sidebarStudentSearch.set((event.target as HTMLInputElement).value);
  }

  onDeleteStudentClick(event: Event, student: Student) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedStudent.set(student);
    this.isDeleteModalOpen.set(true);
  }

  sidebarStudentCount = computed(() => this.students().filter((s) => s.isActive).length);

  closeModal() {
    this.isDeleteModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  confirmDelete() {
    const student = this.selectedStudent();
    if (!student) return;

    this.studentsService.deleteStudent(Number(student.id)).subscribe({
      next: () => {
        this.toast.show(`“${student.firstName}” was removed`, 'success');
        this.studentsService.triggerRefresh();
        this.closeModal();
      },
      error: () => {
        this.toast.show('Could not delete student', 'error');
      },
    });
  }

  syncCalendar() {
    this.isSyncing.set(true);

    this.calendarService.syncCalendar().subscribe({
      next: () => {
        this.isSyncing.set(false);
        this.toast.show('Calendar synced successfully', 'success');
      },
      error: () => {
        this.isSyncing.set(false);
        this.toast.show('Calendar sync failed', 'error');
      },
    });
  }
}
