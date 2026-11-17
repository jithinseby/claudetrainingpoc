using System.ComponentModel.DataAnnotations;

namespace Api.Models;

public enum TicketStatus { Open, InProgress, Closed }
public enum TicketPriority { Low, Medium, High }

public class Ticket
{
    public int Id { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    [MaxLength(4000)] public string? Description { get; set; }
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketPriority Priority { get; set; } = TicketPriority.Medium;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
