using System.Text.Json.Serialization;
using Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddDbContext<TicketingContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Ticketing")));
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Dev convenience: create/upgrade the DB on startup. Use explicit migrations outside dev.
    using var scope = app.Services.CreateScope();
    scope.ServiceProvider.GetRequiredService<TicketingContext>().Database.Migrate();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
