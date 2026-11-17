import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type TicketStatus = 'Open' | 'InProgress' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
}

const URL = 'http://localhost:5112/api/tickets';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  list() { return this.http.get<Ticket[]>(URL); }
  create(t: Pick<Ticket, 'title' | 'description' | 'priority'>) { return this.http.post<Ticket>(URL, t); }
  update(t: Ticket) { return this.http.put<void>(`${URL}/${t.id}`, t); }
  remove(id: number) { return this.http.delete<void>(`${URL}/${id}`); }
}
