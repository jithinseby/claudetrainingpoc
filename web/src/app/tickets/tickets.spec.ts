import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TicketService } from './ticket.service';
import { Tickets } from './tickets';

describe('Tickets', () => {
  it('loads and renders tickets from the service', async () => {
    const list = [{ id: 1, title: 'Printer is down', status: 'Open', priority: 'High', createdAt: '2026-11-17T10:00:00' }];
    TestBed.configureTestingModule({
      imports: [Tickets],
      providers: [{ provide: TicketService, useValue: { list: () => of(list) } }],
    });
    const fixture = TestBed.createComponent(Tickets);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Printer is down');
  });
});
