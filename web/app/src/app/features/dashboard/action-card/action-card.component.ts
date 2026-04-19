import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [RouterLink, MatIcon],
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss',
})
export class ActionCardComponent {
  @Input() label = '';
  @Input() route = '';
  /** Material icon ligature name, e.g. `person_add`, `groups`. */
  @Input() icon = 'add';
}
