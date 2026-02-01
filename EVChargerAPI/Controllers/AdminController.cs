using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EVChargerAPI.Data;
using EVChargerAPI.DTOs;

namespace EVChargerAPI.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalStations = await _context.Stations.CountAsync();
            var totalBookings = await _context.Bookings.CountAsync();
            var activeStations = await _context.Stations.CountAsync(s => s.Status == "Available");

            return Ok(new
            {
                totalUsers,
                totalStations,
                totalBookings,
                activeStations
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    Role = u.Role,
                    Phone = u.Phone,
                    VehicleNumber = u.VehicleNumber,
                    VehicleType = u.VehicleType,
                    VehicleBrand = u.VehicleBrand,
                    VehicleModel = u.VehicleModel
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings()
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
                    Status = b.Status,
                    Amount = b.Amount,
                    StationName = b.Station != null ? b.Station.Name : "Unknown",
                    UserName = b.User != null ? b.User.Name : "Unknown",
                    Date = b.Date,
                    TimeSlot = b.TimeSlot,
                    Duration = b.Duration,
                    CancellationMessage = b.CancellationMessage
                })
                .ToListAsync();

            return Ok(bookings);
        }

        [HttpGet("station-analytics")]
        public async Task<IActionResult> GetStationAnalytics()
        {
            var analytics = await _context.Stations
                .Include(s => s.Bookings)
                .Select(s => new
                {
                    stationId = s.Id,
                    stationName = s.Name,
                    totalBookings = s.Bookings.Count,
                    revenue = s.Bookings.Sum(b => b.Amount),
                    status = s.Status
                })
                .ToListAsync();

            return Ok(analytics);
        }
    }
}