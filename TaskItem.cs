using System.ComponentModel.DataAnnotations;

namespace StudentAPI.Models
{
    public class Student
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(100)]
        public string Major { get; set; } = string.Empty;

        [Range(0.0, 4.0)]
        public decimal GPA { get; set; } = 0.0m;

        public StudentStatus Status { get; set; } = StudentStatus.Active;

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        public DateTime? GraduationDate { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Computed property
        public int Age => DateTime.UtcNow.Year - DateOfBirth.Year - 
                         (DateTime.UtcNow.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);

        public string FullName => $"{FirstName} {LastName}";
    }

    public enum StudentStatus
    {
        Active = 1,
        Inactive = 2,
        Graduated = 3,
        Suspended = 4,
        Transferred = 5
    }
}