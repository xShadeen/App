import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviorments/enviorment';

export interface SendSmsResponse {
  success: boolean;
  sid?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SmsService {
  private http = inject(HttpClient);

  send(to: string, message: string) {
    return this.http.post<SendSmsResponse>(`${environment.apiUrl}/send-sms`, {
      to,
      message,
    });
  }
}
