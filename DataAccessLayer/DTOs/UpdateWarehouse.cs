using System.ComponentModel.DataAnnotations;

namespace DataAccessLayer.DTOs
{
    public class UpdateWarehouse
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public int CountryId { get; set; }
    }
}
