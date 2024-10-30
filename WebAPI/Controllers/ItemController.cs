using DataAccessLayer.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ItemController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetItems(int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.Items.Include(i => i.Warehouse);

        var totalCount = await query.CountAsync();

        var records = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.Id,
                i.Name,
                i.SKU,
                i.Quantity,
                i.CostPrice,
                i.MSRPPrice,
                Warehouse = new
                {
                    i.Warehouse.Id,
                    i.Warehouse.Name,
                    i.Warehouse.Address,
                    i.Warehouse.City,
                    i.Warehouse.CountryId,
                    Country = new
                    {
                        i.Warehouse.Country.Id,
                        i.Warehouse.Country.Name
                    }
                }
            })
            .ToListAsync();

        var response = new
        {
            TotalRecords = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Records = records
        };

        return Ok(response);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetItemDetails(int id)
    {
        var item = await _context.Items
            .Where(i => i.Id == id)
            .Select(i => new
            {
                i.Id,
                i.Name,
                i.SKU,
                i.Quantity,
                i.CostPrice,
                i.MSRPPrice,
                Warehouse = new
                {
                    i.Warehouse.Id,
                    i.Warehouse.Name,
                    i.Warehouse.Address,
                    i.Warehouse.City,
                    Country = new
                    {
                        i.Warehouse.Country.Id,
                        i.Warehouse.Country.Name
                    }
                }
            })
            .SingleOrDefaultAsync();

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }


    [HttpPost]
    public async Task<IActionResult> CreateItem([FromBody] CreateItem dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var item = new Item
        {
            Name = dto.Name,
            SKU = dto.SKU,
            Quantity = dto.Quantity,
            CostPrice = dto.CostPrice,
            MSRPPrice = dto.MSRPPrice,
            WarehouseId = dto.WarehouseId
        };

        await _context.Items.AddAsync(item);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateItem dto)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound();

        item.Name = dto.Name;
        item.SKU = dto.SKU;
        item.Quantity = dto.Quantity;
        item.CostPrice = dto.CostPrice;
        item.MSRPPrice = dto.MSRPPrice;
        item.WarehouseId = dto.WarehouseId;

        _context.Entry(item).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null) return NotFound();

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
