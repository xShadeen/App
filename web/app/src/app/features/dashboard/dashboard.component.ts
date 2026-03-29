import { Component } from '@angular/core';
import { ActionCardComponent } from './action-card/action-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [ActionCardComponent],
})
export class DashboardComponent {}
