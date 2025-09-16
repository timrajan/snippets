using Microsoft.EntityFrameworkCore;
using StudentAPI.Models;

namespace StudentAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Student> Students { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Student entity
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(e => e.Major)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Address)
                    .HasMaxLength(500);

                entity.Property(e => e.GPA)
                    .HasColumnType("decimal(3,2)");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.EnrollmentDate)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.Status)
                    .HasConversion<int>()
                    .HasDefaultValue(StudentStatus.Active);

                // Create unique index on email
                entity.HasIndex(e => e.Email).IsUnique();
                
                // Create index on enrollment date for better query performance
                entity.HasIndex(e => e.EnrollmentDate);
                
                // Create index on status for filtering
                entity.HasIndex(e => e.Status);

                // Create index on major for filtering
                entity.HasIndex(e => e.Major);
            });

            // Seed some sample data
            modelBuilder.Entity<Student>().HasData(
                new Student
                {
                    Id = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john.doe@university.edu",
                    PhoneNumber = "+1-555-0123",
                    DateOfBirth = new DateTime(2000, 5, 15),
                    Major = "Computer Science",
                    GPA = 3.85m,
                    Status = StudentStatus.Active,
                    EnrollmentDate = new DateTime(2022, 9, 1),
                    Address = "123 College St, University City, UC 12345",
                    CreatedAt = DateTime.UtcNow.AddDays(-365)
                },
                new Student
                {
                    Id = 2,
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane.smith@university.edu",
                    PhoneNumber = "+1-555-0124",
                    DateOfBirth = new DateTime(1999, 8, 22),
                    Major = "Business Administration",
                    GPA = 3.92m,
                    Status = StudentStatus.Active,
                    EnrollmentDate = new DateTime(2021, 9, 1),
                    Address = "456 Campus Ave, University City, UC 12345",
                    CreatedAt = DateTime.UtcNow.AddDays(-450)
                },
                new Student
                {
                    Id = 3,
                    FirstName = "Michael",
                    LastName = "Johnson",
                    Email = "michael.johnson@university.edu",
                    PhoneNumber = "+1-555-0125",
                    DateOfBirth = new DateTime(1998, 12, 10),
                    Major = "Engineering",
                    GPA = 3.67m,
                    Status = StudentStatus.Graduated,
                    EnrollmentDate = new DateTime(2020, 9, 1),
                    GraduationDate = new DateTime(2024, 5, 15),
                    Address = "789 Scholar Rd, University City, UC 12345",
                    CreatedAt = DateTime.UtcNow.AddDays(-600),
                    UpdatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Student
                {
                    Id = 4,
                    FirstName = "Emily",
                    LastName = "Davis",
                    Email = "emily.davis@university.edu",
                    PhoneNumber = "+1-555-0126",
                    DateOfBirth = new DateTime(2001, 3, 8),
                    Major = "Psychology",
                    GPA = 3.74m,
                    Status = StudentStatus.Active,
                    EnrollmentDate = new DateTime(2023, 1, 15),
                    Address = "321 Student Blvd, University City, UC 12345",
                    CreatedAt = DateTime.UtcNow.AddDays(-200)
                }
            );
        }
    }
}