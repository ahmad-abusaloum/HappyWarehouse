using System.ComponentModel.DataAnnotations;

public class Role
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; }
}
