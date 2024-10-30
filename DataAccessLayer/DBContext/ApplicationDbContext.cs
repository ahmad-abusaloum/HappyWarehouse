using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Warehouse> Warehouses { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<Role> Roles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Warehouse>()
            .HasIndex(w => w.Name)
            .IsUnique();

        modelBuilder.Entity<Item>()
            .HasIndex(i => i.Name)
            .IsUnique();

        //Add default Countries
        modelBuilder.Entity<Country>().HasData(
            new Country { Id = 1, Name = "United States" },
            new Country { Id = 2, Name = "Canada" },
            new Country { Id = 3, Name = "Germany" },
            new Country { Id = 4, Name = "UAE" },
            new Country { Id = 5, Name = "Jordan" }
        );

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        //Add default Roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin" },
            new Role { Id = 2, Name = "Management" },
            new Role { Id = 3, Name = "Auditor" }
        );

        //Add default User
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Email = "admin@happywarehouse.com",
                FullName = "Admin User",
                RoleId = 1,
                IsActive = true,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssw0rd")
            }
        );
    }
}
