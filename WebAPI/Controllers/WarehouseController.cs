using DataAccessLayer.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WarehouseController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public WarehouseController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetWarehouses(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Warehouses.Include(w => w.Country);

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

    [HttpGet("all")]
    public async Task<IActionResult> GetAllWarehouses()
    {
        var warehouses = await _context.Warehouses.ToListAsync();
        return Ok(warehouses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetWarehouseDetails(int id)
    {
        var warehouse = await _context.Warehouses
                                      .Include(w => w.Country)
                                      .SingleOrDefaultAsync(w => w.Id == id);

        if (warehouse == null)
        {
            return NotFound();
        }

        return Ok(warehouse);
    }

    [HttpGet("{id}/items")]
    public async Task<IActionResult> GetWarehouseItems(int id, int pageNumber = 1, int pageSize = 10)
    {
        // Retrieve warehouse with items
        var warehouse = await _context.Warehouses
            .Where(w => w.Id == id)
            .Select(w => new
            {
                WarehouseName = w.Name,
                Items = w.Items
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(i => new
                    {
                        i.Id,
                        i.Name,
                        i.SKU,
                        i.Quantity,
                        i.CostPrice,
                        i.MSRPPrice
                    })
                    .ToList(),
                TotalRecords = w.Items.Count()
            })
            .SingleOrDefaultAsync();

        if (warehouse == null)
        {
            return NotFound();
        }

        var response = new
        {
            WarehouseName = warehouse.WarehouseName,
            TotalRecords = warehouse.TotalRecords,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Records = warehouse.Items
        };

        return Ok(response);
    }


    [HttpPost]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouse dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            CountryId = dto.CountryId
        };

        try
        {
            await _context.Warehouses.AddAsync(warehouse);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWarehouses), new { id = warehouse.Id }, warehouse);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is SqliteException sqliteEx && sqliteEx.SqliteErrorCode == 19)
            {
                return Conflict(new { message = $"Warehouse name {dto.Name} already exists." });
            }

            return StatusCode(500, new { message = "An error occurred while saving the warehouse." });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] UpdateWarehouse dto)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        warehouse.Name = dto.Name;
        warehouse.Address = dto.Address;
        warehouse.City = dto.City;
        warehouse.CountryId = dto.CountryId;

        _context.Entry(warehouse).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWarehouse(int id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();

        _context.Warehouses.Remove(warehouse);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
