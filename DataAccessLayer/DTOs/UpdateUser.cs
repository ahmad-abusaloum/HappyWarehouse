using System.ComponentModel.DataAnnotations;

namespace DataAccessLayer.DTOs
{
    public class UpdateUser
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public int RoleId { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }
}
