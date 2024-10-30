using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("warehouse-status")]
    public async Task<IActionResult> GetWarehouseStatus()
    {
        var warehouseStatus = await _context.Warehouses
            .Include(w => w.Items)
            .Select(w => new
            {
                WarehouseName = w.Name,
                InventoryCount = w.Items.Sum(i => i.Quantity)
            })
            .ToListAsync();

        return Ok(warehouseStatus);
    }

    [HttpGet("top-items")]
    public async Task<IActionResult> GetTopItems(string order = "desc", int limit = 10)
    {
        var itemsQuery = _context.Items
            .Include(i => i.Warehouse)
            .Select(i => new
            {
                ItemName = i.Name,
                Quantity = i.Quantity,
                Warehouse = i.Warehouse.Name
            });

        itemsQuery = order.ToLower() == "asc"
            ? itemsQuery.OrderBy(i => i.Quantity)
            : itemsQuery.OrderByDescending(i => i.Quantity);

        var items = await itemsQuery.Take(limit).ToListAsync();

        return Ok(items);
    }

}
