import { Component, inject, signal } from '@angular/core';
import { GroupsService } from '../students/services/groups.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, startWith, Subject, switchMap } from 'rxjs';
import { StudentsService } from '../students/services/students.service';

@Component({
  standalone: true,
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss',
})
export class GroupsComponent {
  private groupsService = inject(GroupsService);
  private studentsService = inject(StudentsService);

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

  removeFromGroup(studentId: number) {
    this.studentsService.removeFromGroup(studentId).subscribe(() => {
      this.refresh$.next(); // 👈 reload danych
    });
  }
}
