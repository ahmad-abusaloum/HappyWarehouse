using System.ComponentModel.DataAnnotations;

public class Warehouse
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    public string Address { get; set; }

    [Required]
    public string City { get; set; }

    [Required]
    public int CountryId { get; set; }

    public Country Country { get; set; }

    public ICollection<Item> Items { get; set; } = new List<Item>();
}
