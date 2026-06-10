import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface CalendarSyncResult {
  eventsFetched: number;
  lessonsCreated: number;
  lessonsDeleted: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/calendar';

  private readonly syncCompletedSubject = new Subject<CalendarSyncResult>();
  readonly syncCompleted$ = this.syncCompletedSubject.asObservable();

  syncCalendar() {
    return this.http.post<CalendarSyncResult>(`${this.apiUrl}/sync`, {});
  }

  notifySyncCompleted(result: CalendarSyncResult) {
    this.syncCompletedSubject.next(result);
  }
}
