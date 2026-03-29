import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StudentsService } from './features/students/services/students.service';
import { ConfirmModalComponent } from './features/components/confirm-modal/confirm-modal.component';
import { Student } from './features/students/models/student.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { CalendarService } from './features/students/services/calendar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ConfirmModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  studentsService = inject(StudentsService);
  calendarService = inject(CalendarService);

  protected readonly studentsOpen = signal(false);
  students = toSignal(this.studentsService.students$, { initialValue: [] });
  protected readonly selectedStudent = signal<Student | null>(null);
  protected readonly isDeleteModalOpen = signal(false);
  protected isSyncing = signal(false);

  activeStudents = computed(() => this.students().filter((s) => s.isActive));

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
    console.log(this.students());
    this.studentsOpen.set(!this.studentsOpen());
  }

  onDeleteStudentClick(student: Student) {
    console.log(student);
    this.selectedStudent.set(student);
    this.isDeleteModalOpen.set(true);
  }

  closeModal() {
    this.isDeleteModalOpen.set(false);
    this.selectedStudent.set(null);
  }

  confirmDelete() {
    const student = this.selectedStudent();
    if (!student) return;

    this.studentsService.deleteStudent(Number(student.id)).subscribe({
      next: () => {
        this.studentsService.triggerRefresh();
        this.closeModal();
      },
      error: (err) => console.error(err),
    });
  }

  syncCalendar() {
    this.isSyncing.set(true);

    this.calendarService.syncCalendar().subscribe({
      next: () => {
        this.isSyncing.set(false);
        console.log('Manual sync done');
      },
      error: () => {
        this.isSyncing.set(false);
        console.error('Manual sync failed');
      },
    });
  }
}
