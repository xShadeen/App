import { Routes } from '@angular/router';
import { StudentsPageComponent } from './features/students/students-page.component';
import { StudentDetailsComponent } from './features/students/student-details/student-details.component';

export const routes: Routes = [
  {
    path: 'students',
    children: [
        {
            path: '',
            component: StudentsPageComponent,
        },
        {
            path: ':id',
            component: StudentDetailsComponent
        }
    ]
  },
];
