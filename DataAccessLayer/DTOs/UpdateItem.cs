using System.ComponentModel.DataAnnotations;

namespace DataAccessLayer.DTOs
{
    public class UpdateItem
    {
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
    }
}
