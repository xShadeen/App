import { Routes } from '@angular/router';
import { StudentDetailsComponent } from './features/students/components/student-details/student-details.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StudentFormComponent } from './features/students/components/student-form/student-form.component';
import { StudentListComponent } from './features/students/components/student-list/student-list.component';
import { StudentListResolver } from './features/students/resolvers/student-list.resolver';
import { StudentListType } from './features/students/models/student.model';
import { GroupsComponent } from './features/groups/groups.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'students/new',
    component: StudentFormComponent,
  },
  {
    path: 'students/inactive',
    component: StudentListComponent,
    resolve: {
      students: StudentListResolver,
    },
    data: {
      type: StudentListType.INACTIVE,
    },
  },
  {
    path: 'students/active',
    component: StudentListComponent,
    resolve: {
      students: StudentListResolver,
    },
    data: {
      type: StudentListType.ACTIVE,
    },
  },
  {
    path: 'groups',
    component: GroupsComponent,
  },
  {
    path: 'students/:id',
    component: StudentDetailsComponent,
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
