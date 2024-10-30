using System.ComponentModel.DataAnnotations;

namespace DataAccessLayer.DTOs
{
    public class UserLogin
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

}
