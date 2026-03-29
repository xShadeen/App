import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [RouterLink], // 🔥 TO JEST WAŻNE
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss',
})
export class ActionCardComponent {
  @Input() label: string = ''; // 🔥 brakowało
  @Input() route: string = ''; // 🔥 brakowało
}
