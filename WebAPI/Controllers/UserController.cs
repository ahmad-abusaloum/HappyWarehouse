using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using DataAccessLayer.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using DataAccessLayer.Enums;
using static DataAccessLayer.Enums.Roles;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Users.Include(u => u.Role);

        var totalCount = query.CountAsync();

        var records = query.Skip((pageNumber - 1) * pageSize)
                           .Take(pageSize)
                           .ToListAsync();

        var response = new
        {
            TotalRecords = await totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Records = await records
        };

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserDetails(int id)
    {
        var user = await _context.Users
                                 .Include(u => u.Role)
                                 .SingleOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("check-email")]
    public async Task<IActionResult> CheckEmailExists([FromQuery] string email, [FromQuery] int? userId = null)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email == email && (!userId.HasValue || u.Id != userId));

        return Ok(new { exists = emailExists });
    }


    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] UserLogin user)
    {
        var existingUser = await _context.Users
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Email == user.Email);

        if (existingUser == null || !BCrypt.Net.BCrypt.Verify(user.Password, existingUser.PasswordHash))
            return Unauthorized(new { message = "Invalid login credentials" });

        if (!existingUser.IsActive)
            return Unauthorized(new { message = "Your account is disabled, please contact support." });

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, existingUser.Email),
            new Claim(ClaimTypes.Role, existingUser.Role.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("d798c1b3-1b3c-4ff6-946a-5e1ffbdc1e69"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: null,
            audience: null,
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { FullName = existingUser.FullName, RoleName = existingUser.Role.Name, token = tokenString });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return Ok();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUser createUserDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var role = await _context.Roles.FindAsync(createUserDto.RoleId);
        if (role == null) return BadRequest("Invalid role.");

        var user = new User
        {
            Email = createUserDto.Email,
            FullName = createUserDto.FullName,
            RoleId = createUserDto.RoleId,
            IsActive = createUserDto.IsActive,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password)
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUser updateUserDto)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null) return NotFound();

        var role = await _context.Roles.FindAsync(updateUserDto.RoleId);
        if (role == null) return BadRequest("Invalid role.");

        existingUser.Email = updateUserDto.Email;
        existingUser.FullName = updateUserDto.FullName;
        existingUser.RoleId = updateUserDto.RoleId;
        existingUser.IsActive = updateUserDto.IsActive;

        _context.Entry(existingUser).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("change-password/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePassword changePasswordDto)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null) return NotFound();

        if (string.IsNullOrEmpty(changePasswordDto.NewPassword))
            return BadRequest("Password cannot be empty.");

        existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);

        _context.Entry(existingUser).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return Ok();
    }


    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.Include(u => u.Role)
                                       .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound();

        if (user.Role.Id == (int)UserRole.Admin)
            return BadRequest("Admin users cannot be deleted.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
