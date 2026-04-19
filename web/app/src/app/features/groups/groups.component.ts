import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../students/services/groups.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { StudentsService } from '../students/services/students.service';
import { ToastService } from '../../core/toast/toast.service';

@Component({
  standalone: true,
  selector: 'app-groups',
  imports: [RouterLink],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  private groupsService = inject(GroupsService);
  private studentsService = inject(StudentsService);
  private toast = inject(ToastService);

  private refresh$ = new Subject<void>();

  groups = toSignal(
    this.refresh$.pipe(
      startWith(void 0),
      switchMap(() => this.groupsService.getGroups().pipe(catchError(() => of([])))),
    ),
    { initialValue: [] },
  );

  selectedGroup = signal<any | null>(null);
  selectGroup(group: any) {
    if (this.selectedGroup()?.id === group.id) {
      this.selectedGroup.set(null); // 👈 zwija
    } else {
      this.selectedGroup.set(group);
    }
  }

  removeFromGroup(event: Event, studentId: number) {
    event.preventDefault();
    event.stopPropagation();

    this.studentsService.removeFromGroup(studentId).subscribe({
      next: () => {
        this.toast.show('Removed from group', 'success');
        this.selectedGroup.set(null);
        this.refresh$.next();
      },
      error: () => this.toast.show('Could not remove student from group', 'error'),
    });
  }
}
