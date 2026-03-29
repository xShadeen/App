import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';
  getGroups() {
    return this.http.get<Group[]>(`${this.apiUrl}/groups`);
  }
}
