using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EVChargerAPI.Controllers
{
    [ApiController]
    [Route("api/payment")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] dynamic orderData)
        {
            // Mock payment order creation
            var orderId = Guid.NewGuid().ToString();
            
            return Ok(new
            {
                orderId = orderId,
                amount = orderData.amount,
                currency = "INR",
                status = "created"
            });
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyPayment([FromBody] dynamic paymentData)
        {
            // Mock payment verification
            return Ok(new
            {
                status = "success",
                paymentId = paymentData.paymentId,
                verified = true
            });
        }
    }
}