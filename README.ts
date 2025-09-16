using Microsoft.AspNetCore.Mvc;
using StudentAPI.DTOs;
using StudentAPI.Models;
using StudentAPI.Services;

namespace StudentAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        // ... (keep all existing endpoints)

        /// <summary>
        /// Create a new student using custom PostgreSQL functions/triggers
        /// </summary>
        /// <param name="createStudentDto">Student creation details</param>
        /// <returns>Created student</returns>
        [HttpPost("custom-sql")]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> CreateStudentWithCustomSql([FromBody] CreateStudentDto createStudentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();

                    return BadRequest(new ApiResponse<StudentResponseDto>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                }

                // Validate age (must be at least 16)
                var age = DateTime.UtcNow.Year - createStudentDto.DateOfBirth.Year;
                if (DateTime.UtcNow.DayOfYear < createStudentDto.DateOfBirth.DayOfYear) age--;
                
                if (age < 16)
                {
                    return BadRequest(new ApiResponse<StudentResponseDto>
                    {
                        Success = false,
                        Message = "Student must be at least 16 years old",
                        Errors = new List<string> { "Invalid date of birth" }
                    });
                }

                var student = await _studentService.CreateStudentWithCustomSqlAsync(createStudentDto);

                return CreatedAtAction(
                    nameof(GetStudent),
                    new { id = student.Id },
                    new ApiResponse<StudentResponseDto>
                    {
                        Success = true,
                        Message = "Student created successfully using custom SQL",
                        Data = student
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<StudentResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while creating the student with custom SQL",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // All your existing endpoints remain the same...
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<StudentResponseDto>>>> GetStudents(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] StudentStatus? status = null,
            [FromQuery] string? major = null)
        {
            // Implementation remains the same
            try
            {
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 10;
                if (pageSize > 50) pageSize = 50;

                var result = await _studentService.GetAllStudentsAsync(pageNumber, pageSize, status, major);

                return Ok(new ApiResponse<PaginatedResponse<StudentResponseDto>>
                {
                    Success = true,
                    Message = "Students retrieved successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<PaginatedResponse<StudentResponseDto>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving students",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> GetStudent(int id)
        {
            // Implementation remains the same...
            try
            {
                var student = await _studentService.GetStudentByIdAsync(id);

                if (student == null)
                {
                    return NotFound(new ApiResponse<StudentResponseDto>
                    {
                        Success = false,
                        Message = $"Student with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<StudentResponseDto>
                {
                    Success = true,
                    Message = "Student retrieved successfully",
                    Data = student
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<StudentResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while retrieving the student",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // ... include all other existing methods
    }
}
