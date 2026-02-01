using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EVChargerAPI.Data;
using EVChargerAPI.Models;
using EVChargerAPI.DTOs;
using System.Security.Claims;
using System.Text.Json;

namespace EVChargerAPI.Controllers
{
    [ApiController]
    [Route("api/station-master")]
    [Authorize(Roles = "StationMaster")]
    public class StationMasterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StationMasterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("stations")]
        public async Task<IActionResult> GetMyStations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var stations = await _context.Stations
                .Where(s => s.OwnerId == userId)
                .Include(s => s.Owner)
                .ToListAsync();

            var stationDtos = stations.Select(s => new StationDto
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Address,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                ConnectorTypes = string.IsNullOrEmpty(s.ConnectorTypes) ? Array.Empty<string>() : JsonSerializer.Deserialize<string[]>(s.ConnectorTypes) ?? Array.Empty<string>(),
                PowerOutput = s.PowerOutput,
                PricePerKwh = s.PricePerKwh,
                Amenities = string.IsNullOrEmpty(s.Amenities) ? Array.Empty<string>() : JsonSerializer.Deserialize<string[]>(s.Amenities) ?? Array.Empty<string>(),
                OperatingHours = s.OperatingHours,
                Status = s.Status,
                TotalSlots = s.TotalSlots,
                AvailableSlots = s.AvailableSlots,
                OwnerName = s.Owner?.Name
            });

            return Ok(stationDtos);
        }

        [HttpPost("stations")]
        public async Task<IActionResult> CreateStation(StationDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

            var station = new Station
            {
                Name = dto.Name,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                ConnectorTypes = JsonSerializer.Serialize(dto.ConnectorTypes),
                PowerOutput = dto.PowerOutput,
                PricePerKwh = dto.PricePerKwh,
                Amenities = JsonSerializer.Serialize(dto.Amenities),
                OperatingHours = dto.OperatingHours,
                Status = dto.Status,
                TotalSlots = dto.TotalSlots,
                AvailableSlots = dto.AvailableSlots,
                OwnerId = userId
            };

            _context.Stations.Add(station);
            await _context.SaveChangesAsync();

            return Ok(new { station = new { id = station.Id, name = station.Name } });
        }

        [HttpPut("stations/{id}")]
        public async Task<IActionResult> UpdateStation(int id, StationDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var station = await _context.Stations.FindAsync(id);
            if (station == null) return NotFound();
            
            if (station.OwnerId != userId)
                return Forbid("You can only update your own stations");

            station.Name = dto.Name;
            station.Address = dto.Address;
            station.Latitude = dto.Latitude;
            station.Longitude = dto.Longitude;
            station.ConnectorTypes = JsonSerializer.Serialize(dto.ConnectorTypes);
            station.PowerOutput = dto.PowerOutput;
            station.PricePerKwh = dto.PricePerKwh;
            station.Amenities = JsonSerializer.Serialize(dto.Amenities);
            station.OperatingHours = dto.OperatingHours;
            station.Status = dto.Status;
            station.TotalSlots = dto.TotalSlots;
            station.AvailableSlots = dto.AvailableSlots;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Station updated successfully" });
        }

        [HttpPut("stations/{id}/status")]
        public async Task<IActionResult> UpdateStationStatus(int id, [FromBody] Dictionary<string, string> statusUpdate)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var station = await _context.Stations.FindAsync(id);
            if (station == null) return NotFound();
            
            if (station.OwnerId != userId)
                return Forbid("You can only update your own stations");

            if (statusUpdate.TryGetValue("status", out var status))
            {
                station.Status = status;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Station status updated successfully" });
            }

            return BadRequest("Status is required");
        }

        [HttpGet("stations/{id}/bookings")]
        public async Task<IActionResult> GetStationBookings(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var station = await _context.Stations.FindAsync(id);
            if (station == null) return NotFound();
            
            if (station.OwnerId != userId)
                return Forbid("You can only view bookings for your own stations");

            var bookings = await _context.Bookings
                .Where(b => b.StationId == id)
                .Include(b => b.User)
                .Include(b => b.Station)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var bookingDtos = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                UserId = b.UserId,
                StationId = b.StationId,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Status = b.Status,
                Amount = b.Amount,
                StationName = b.Station?.Name,
                UserName = b.User?.Name,
                Date = b.Date,
                TimeSlot = b.TimeSlot,
                Duration = b.Duration,
                PaymentMethod = b.PaymentMethod,
                VehicleType = b.VehicleType,
                VehicleBrand = b.VehicleBrand,
                VehicleModel = b.VehicleModel,
                VehicleNumber = b.VehicleNumber,
                PaymentId = b.PaymentId,
                CreatedAt = b.CreatedAt,
                CancellationMessage = b.CancellationMessage
            });

            return Ok(bookingDtos);
        }
    }
}