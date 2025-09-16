using System.ComponentModel.DataAnnotations;
using StudentAPI.Models;

namespace StudentAPI.DTOs
{
    public class CreateStudentDto
    {
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

        public DateTime? EnrollmentDate { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }
    }

    public class UpdateStudentDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [EmailAddress]
        [MaxLength(200)]
        public string? Email { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(100)]
        public string? Major { get; set; }

        [Range(0.0, 4.0)]
        public decimal? GPA { get; set; }

        public StudentStatus? Status { get; set; }

        public DateTime? GraduationDate { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }
    }

    public class StudentResponseDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int Age { get; set; }
        public string Major { get; set; } = string.Empty;
        public decimal GPA { get; set; }
        public StudentStatus Status { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public DateTime? GraduationDate { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class PaginatedResponse<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage => PageNumber < TotalPages;
        public bool HasPreviousPage => PageNumber > 1;
    }
}