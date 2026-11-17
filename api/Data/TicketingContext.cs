using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class TicketingContext(DbContextOptions<TicketingContext> options) : DbContext(options)
{
    public DbSet<Ticket> Tickets => Set<Ticket>();
}
