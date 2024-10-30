using System.ComponentModel.DataAnnotations;

namespace DataAccessLayer.DTOs
{
    public class ChangePassword
    {
        [Required]
        public string NewPassword { get; set; }
    }
}
