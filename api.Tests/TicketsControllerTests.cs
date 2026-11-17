using Api.Controllers;
using Api.Data;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Tests;

public class TicketsControllerTests
{
    private static TicketingContext NewDb() =>
        new(new DbContextOptionsBuilder<TicketingContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    [Fact]
    public async Task Create_then_list_returns_the_ticket_as_open()
    {
        var c = new TicketsController(NewDb());
        await c.Create(new Ticket { Title = "Printer is down" });

        var list = await c.List();

        var t = Assert.Single(list);
        Assert.Equal("Printer is down", t.Title);
        Assert.Equal(TicketStatus.Open, t.Status);
    }

    [Fact]
    public async Task Update_and_delete_of_missing_ticket_return_not_found()
    {
        var c = new TicketsController(NewDb());
        Assert.IsType<Microsoft.AspNetCore.Mvc.NotFoundResult>(await c.Update(42, new Ticket { Title = "x" }));
        Assert.IsType<Microsoft.AspNetCore.Mvc.NotFoundResult>(await c.Delete(42));
    }
}
