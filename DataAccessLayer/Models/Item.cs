using System.ComponentModel.DataAnnotations;

public class Item
{
    [Key]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; }
    public string SKU { get; set; }
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    [Required]
    public decimal CostPrice { get; set; }
    public decimal? MSRPPrice { get; set; }
    [Required]
    public int WarehouseId { get; set; }
    public Warehouse Warehouse { get; set; }
}
