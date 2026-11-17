using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController(TicketingContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Ticket>> List() =>
        await db.Tickets.OrderByDescending(t => t.CreatedAt).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Ticket>> Get(int id) =>
        await db.Tickets.FindAsync(id) is { } t ? t : NotFound();

    [HttpPost]
    public async Task<ActionResult<Ticket>> Create(Ticket ticket)
    {
        ticket.Id = 0;
        ticket.CreatedAt = DateTime.UtcNow;
        db.Tickets.Add(ticket);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Ticket input)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket is null) return NotFound();
        ticket.Title = input.Title;
        ticket.Description = input.Description;
        ticket.Status = input.Status;
        ticket.Priority = input.Priority;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket is null) return NotFound();
        db.Tickets.Remove(ticket);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
