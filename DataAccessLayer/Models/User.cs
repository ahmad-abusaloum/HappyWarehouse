using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string FullName { get; set; }

    [Required]
    public int RoleId { get; set; }
    [ForeignKey("RoleId")]
    public Role Role { get; set; }

    [Required]
    public bool IsActive { get; set; }

    public string PasswordHash { get; set; }
}
