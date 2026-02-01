using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EVChargerAPI.Data;
using EVChargerAPI.Models;
using EVChargerAPI.DTOs;
using System.Text.Json;

namespace EVChargerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookingsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking(CreateBookingDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"Creating booking for user {userId} with data: {System.Text.Json.JsonSerializer.Serialize(dto)}");
                
                var station = await _context.Stations.FindAsync(dto.StationId);
                if (station == null)
                    return BadRequest(new { message = "Station not found" });

                var booking = new Booking
                {
                    UserId = userId,
                    StationId = dto.StationId,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    Amount = dto.Amount,
                    Status = dto.Status ?? "Confirmed",
                    Date = dto.Date ?? "",
                    TimeSlot = dto.TimeSlot ?? "",
                    Duration = dto.Duration,
                    PaymentMethod = dto.PaymentMethod ?? "Card",
                    VehicleType = dto.VehicleType ?? "",
                    VehicleBrand = dto.VehicleBrand ?? "",
                    VehicleModel = dto.VehicleModel ?? "",
                    VehicleNumber = dto.VehicleNumber ?? "",
                    PaymentId = dto.PaymentId ?? "",
                    CancellationMessage = null
                };

                if (station.AvailableSlots > 0)
                {
                    station.AvailableSlots--;
                }
                
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"Booking created successfully with ID: {booking.Id}");

                return Ok(new { booking = new BookingDto { Id = booking.Id, Status = booking.Status } });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating booking: {ex.Message}");
                return StatusCode(500, new { message = "Error creating booking", error = ex.Message });
            }
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserBookings()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                Console.WriteLine($"Getting bookings for user ID: {userId}");
                
                var bookings = await _context.Bookings
                    .Include(b => b.Station)
                    .Where(b => b.UserId == userId)
                    .ToListAsync();
                
                Console.WriteLine($"Found {bookings.Count} bookings for user {userId}");
                
                var bookingDtos = bookings.Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    StationId = b.StationId,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    Status = b.Status ?? "Confirmed",
                    Amount = b.Amount,
                    StationName = b.Station?.Name ?? "Unknown Station",
                    Date = b.Date ?? "",
                    TimeSlot = b.TimeSlot ?? "",
                    Duration = b.Duration,
                    PaymentMethod = b.PaymentMethod ?? "Card",
                    VehicleType = b.VehicleType ?? "",
                    VehicleBrand = b.VehicleBrand ?? "",
                    VehicleModel = b.VehicleModel ?? "",
                    VehicleNumber = b.VehicleNumber ?? "",
                    PaymentId = b.PaymentId ?? "",
                    CreatedAt = b.CreatedAt,
                    CancellationMessage = b.CancellationMessage
                }).ToList();

                return Ok(new { bookings = bookingDtos });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user bookings: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving bookings", error = ex.Message });
            }
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Station)
                    .Include(b => b.User)
                    .Select(b => new BookingDto
                    {
                        Id = b.Id,
                        UserId = b.UserId,
                        StationId = b.StationId,
                        StartTime = b.StartTime,
                        EndTime = b.EndTime,
                        Status = b.Status ?? "Confirmed",
                        Amount = b.Amount,
                        StationName = b.Station != null ? b.Station.Name : "Unknown",
                        UserName = b.User != null ? b.User.Name : "Unknown",
                        Date = b.Date ?? "",
                        TimeSlot = b.TimeSlot ?? "",
                        Duration = b.Duration,
                        CancellationMessage = b.CancellationMessage
                    })
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting admin bookings: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving bookings", error = ex.Message });
            }
        }

        [HttpPost("admin-cancel")]
        public async Task<IActionResult> AdminCancelBooking([FromBody] AdminCancelBookingDto dto)
        {
            try
            {
                var booking = await _context.Bookings
                    .Include(b => b.Station)
                    .FirstOrDefaultAsync(b => b.Id == dto.BookingId);
                
                if (booking == null)
                    return NotFound(new { message = "Booking not found" });
                
                booking.Status = "Cancelled";
                booking.CancellationMessage = dto.Message;
                
                if (booking.Station != null)
                {
                    booking.Station.AvailableSlots++;
                }
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Booking cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error cancelling booking" });
            }
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelUserBooking(int id, [FromBody] CancelBookingDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var booking = await _context.Bookings
                    .Include(b => b.Station)
                    .FirstOrDefaultAsync(b => b.Id == id);
                
                if (booking == null)
                    return NotFound(new { message = "Booking not found" });
                
                if (booking.UserId != userId)
                    return Forbid("You can only cancel your own bookings");
                
                if (booking.Status == "Cancelled")
                    return BadRequest(new { message = "Booking is already cancelled" });
                
                booking.Status = "Cancelled";
                booking.CancellationMessage = dto.Message ?? "Cancelled by user";
                
                if (booking.Station != null)
                {
                    booking.Station.AvailableSlots++;
                }
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Booking cancelled successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error cancelling booking", error = ex.Message });
            }
        }
    }
}