import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Student } from '../../models/student.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { StudentsService } from '../../services/students.service';
import { DatePipe } from '@angular/common';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  imports: [DatePipe, ConfirmModalComponent],
})
export class StudentListComponent {
  private studentsService = inject(StudentsService);
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  private studentsState = signal<Student[]>([]);
  protected showRestoreModal = signal(false);
  protected studentToRestore = signal<Student | null>(null);
  protected students = computed(() => this.studentsState());
  protected restoringIds = signal<number[]>([]);

  constructor() {
    const initial = (this.data()?.['students'] as Student[]) ?? [];
    this.studentsState.set(initial);
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
        this.studentsState.update((students) => students.filter((s) => Number(s.id) !== id));
        this.restoringIds.update((ids) => ids.filter((i) => i !== id));
        this.closeModal();
      },
      error: () => {
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
