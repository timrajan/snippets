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

        // Computed properties (calculated in C#)
        public int Age => DateTime.UtcNow.Year - DateOfBirth.Year - 
                         (DateTime.UtcNow.DayOfYear < DateOfBirth.DayOfYear ? 1 : 0);

        public string FullName => $"{FirstName} {LastName}";

        // Computed columns (populated by PostgreSQL database)
        // Add these properties to match your PostgreSQL computed columns
        public string? StudentLevel { get; set; }        // e.g., "Freshman", "Sophomore" 
        public string? AcademicStanding { get; set; }    // e.g., "Good Standing", "Probation"
        public int? YearsEnrolled { get; set; }          // Number of years enrolled
        public decimal? CompletionPercentage { get; set; } // Progress percentage
        public string? AgeGroup { get; set; }            // e.g., "Young Adult", "Adult"
        public string? GPALevel { get; set; }            // e.g., "Excellent", "Good"
        public bool? IsNearGraduation { get; set; }      // True if close to graduation
        public string? CurrentSemester { get; set; }     // e.g., "Fall 2024"
        
        // Add any other computed columns that your PostgreSQL creates
        // Just tell me the column names and I'll add them here
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
