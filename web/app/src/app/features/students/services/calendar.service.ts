import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/calendar';

  syncCalendar() {
    return this.http.post(`${this.apiUrl}/sync`, {});
  }
}