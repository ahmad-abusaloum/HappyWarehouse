using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CountryController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CountryController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllCountries()
    {
        var countries = await _context.Countries.ToListAsync();
        return Ok(countries);
    }

    [HttpGet]
    public async Task<IActionResult> GetCountries(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Countries;

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
    public async Task<IActionResult> GetCountryDetails(int id)
    {
        var country = await _context.Countries.FindAsync(id);

        if (country == null)
        {
            return NotFound();
        }

        return Ok(country);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCountry(Country country)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        await _context.Countries.AddAsync(country);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCountries), new { id = country.Id }, country);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCountry(int id, Country country)
    {
        if (id != country.Id) return BadRequest();

        _context.Entry(country).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Countries.Any(c => c.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCountry(int id)
    {
        var country = await _context.Countries.FindAsync(id);
        if (country == null) return NotFound();

        _context.Countries.Remove(country);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
