import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ticket, TicketPriority, TicketService, TicketStatus } from './ticket.service';

@Component({
  selector: 'app-tickets',
  imports: [FormsModule, DatePipe],
  template: `
    <h1 class="h3 mb-3">Support Tickets</h1>

    <div class="row g-3 mb-4">
      @for (s of stats(); track s.label) {
        <div class="col-12 col-md-4">
          <div class="card stat-card" [style.--stat]="s.color">
            <div class="card-body">
              <div class="text-uppercase small text-secondary">{{ s.label }}</div>
              <div class="display-6 fw-semibold">{{ s.count }}</div>
            </div>
          </div>
        </div>
      }
    </div>

    @if (error()) {
      <div class="alert alert-danger" role="alert">{{ error() }}</div>
    }

    <div class="card mb-4">
      <div class="card-body">
        <h2 class="h6 mb-3">New ticket</h2>
        <form class="row g-2" (ngSubmit)="add()">
          <div class="col-12 col-md-4">
            <input class="form-control" name="title" [(ngModel)]="title" placeholder="Title" required maxlength="200" aria-label="Title" />
          </div>
          <div class="col-12 col-md-4">
            <input class="form-control" name="description" [(ngModel)]="description" placeholder="Description" aria-label="Description" />
          </div>
          <div class="col-6 col-md-2">
            <select class="form-select" name="priority" [(ngModel)]="priority" aria-label="Priority">
              @for (p of priorities; track p) { <option [value]="p">{{ p }}</option> }
            </select>
          </div>
          <div class="col-6 col-md-2 d-grid">
            <button class="btn btn-brand" [disabled]="!title.trim()">Add ticket</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead>
            <tr><th class="ps-3">Title</th><th>Priority</th><th>Created</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            @for (t of tickets(); track t.id) {
              <tr>
                <td class="ps-3">
                  <div class="fw-medium">{{ t.title }}</div>
                  @if (t.description) { <div class="small text-secondary">{{ t.description }}</div> }
                </td>
                <td><span [class]="priorityBadge[t.priority]">{{ t.priority }}</span></td>
                <td class="text-secondary small">{{ created(t) | date: 'mediumDate' }}</td>
                <td>
                  <select class="form-select form-select-sm w-auto" [ngModel]="t.status" (ngModelChange)="setStatus(t, $event)" aria-label="Status">
                    @for (s of statuses; track s) { <option [value]="s">{{ statusLabel[s] }}</option> }
                  </select>
                </td>
                <td class="text-end pe-3">
                  <button class="btn btn-sm btn-outline-danger" (click)="remove(t)">Delete</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center text-secondary py-5">No tickets yet. Create the first one above.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class Tickets {
  private svc = inject(TicketService);
  tickets = signal<Ticket[]>([]);
  error = signal('');
  title = '';
  description = '';
  priority: TicketPriority = 'Medium';
  readonly priorities: TicketPriority[] = ['Low', 'Medium', 'High'];
  readonly statuses: TicketStatus[] = ['Open', 'InProgress', 'Closed'];
  readonly statusLabel: Record<TicketStatus, string> = { Open: 'Open', InProgress: 'In Progress', Closed: 'Closed' };
  readonly priorityBadge: Record<TicketPriority, string> = {
    Low: 'badge text-bg-secondary',
    Medium: 'badge text-bg-warning',
    High: 'badge text-bg-danger',
  };

  stats = computed(() => {
    const count = (s: TicketStatus) => this.tickets().filter((t) => t.status === s).length;
    return [
      { label: 'Open', count: count('Open'), color: '#0d6efd' },
      { label: 'In Progress', count: count('InProgress'), color: '#f59e0b' },
      { label: 'Closed', count: count('Closed'), color: '#198754' },
    ];
  });

  constructor() { this.load(); }

  // The API stores UTC but SQL Server returns it without a "Z"; add it so the date shows in local time.
  created(t: Ticket) { return /Z|[+-]\d\d:\d\d$/.test(t.createdAt) ? t.createdAt : t.createdAt + 'Z'; }

  private load() {
    this.svc.list().subscribe({
      next: (t) => { this.tickets.set(t); this.error.set(''); },
      error: () => this.error.set('Could not reach the API.'),
    });
  }

  add() {
    this.svc.create({ title: this.title.trim(), description: this.description, priority: this.priority })
      .subscribe({ next: () => { this.title = this.description = ''; this.load(); }, error: () => this.error.set('Could not add ticket.') });
  }

  setStatus(t: Ticket, status: TicketStatus) {
    this.svc.update({ ...t, status }).subscribe({ next: () => this.load(), error: () => this.error.set('Could not update ticket.') });
  }

  remove(t: Ticket) {
    this.svc.remove(t.id).subscribe({ next: () => this.load(), error: () => this.error.set('Could not delete ticket.') });
  }
}
