using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EVChargerAPI.Data;
using EVChargerAPI.Models;
using System.Security.Claims;

namespace EVChargerAPI.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Station)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("station/{stationId}")]
        public async Task<IActionResult> GetStationReviews(int stationId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.StationId == stationId)
                .Include(r => r.User)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Station)
                .ToListAsync();

            return Ok(reviews);
        }
    }
}