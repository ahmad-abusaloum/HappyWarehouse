using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoleController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return Ok(roles);
    }
}
