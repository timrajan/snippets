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

        /// <summary>
        /// Get all students with optional pagination and filtering
        /// </summary>
        /// <param name="pageNumber">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 10, max: 50)</param>
        /// <param name="status">Filter by student status</param>
        /// <param name="major">Filter by major (partial match)</param>
        /// <returns>Paginated list of students</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<PaginatedResponse<StudentResponseDto>>>> GetStudents(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] StudentStatus? status = null,
            [FromQuery] string? major = null)
        {
            try
            {
                // Validate pagination parameters
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

        /// <summary>
        /// Get a specific student by ID
        /// </summary>
        /// <param name="id">Student ID</param>
        /// <returns>Student details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> GetStudent(int id)
        {
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

        /// <summary>
        /// Get a student by email address
        /// </summary>
        /// <param name="email">Student email</param>
        /// <returns>Student details</returns>
        [HttpGet("email/{email}")]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> GetStudentByEmail(string email)
        {
            try
            {
                var student = await _studentService.GetStudentByEmailAsync(email);

                if (student == null)
                {
                    return NotFound(new ApiResponse<StudentResponseDto>
                    {
                        Success = false,
                        Message = $"Student with email {email} not found"
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

        /// <summary>
        /// Create a new student
        /// </summary>
        /// <param name="createStudentDto">Student creation details</param>
        /// <returns>Created student</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> CreateStudent([FromBody] CreateStudentDto createStudentDto)
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

                // Check if email already exists
                if (await _studentService.EmailExistsAsync(createStudentDto.Email))
                {
                    return BadRequest(new ApiResponse<StudentResponseDto>
                    {
                        Success = false,
                        Message = "A student with this email already exists",
                        Errors = new List<string> { "Email must be unique" }
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

                var student = await _studentService.CreateStudentAsync(createStudentDto);

                return CreatedAtAction(
                    nameof(GetStudent),
                    new { id = student.Id },
                    new ApiResponse<StudentResponseDto>
                    {
                        Success = true,
                        Message = "Student created successfully",
                        Data = student
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<StudentResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while creating the student",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Update an existing student
        /// </summary>
        /// <param name="id">Student ID</param>
        /// <param name="updateStudentDto">Student update details</param>
        /// <returns>Updated student</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<StudentResponseDto>>> UpdateStudent(int id, [FromBody] UpdateStudentDto updateStudentDto)
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

                // Check if email is being updated and already exists
                if (!string.IsNullOrEmpty(updateStudentDto.Email))
                {
                    if (await _studentService.EmailExistsAsync(updateStudentDto.Email, id))
                    {
                        return BadRequest(new ApiResponse<StudentResponseDto>
                        {
                            Success = false,
                            Message = "A student with this email already exists",
                            Errors = new List<string> { "Email must be unique" }
                        });
                    }
                }

                // Validate age if date of birth is being updated
                if (updateStudentDto.DateOfBirth.HasValue)
                {
                    var age = DateTime.UtcNow.Year - updateStudentDto.DateOfBirth.Value.Year;
                    if (DateTime.UtcNow.DayOfYear < updateStudentDto.DateOfBirth.Value.DayOfYear) age--;
                    
                    if (age < 16)
                    {
                        return BadRequest(new ApiResponse<StudentResponseDto>
                        {
                            Success = false,
                            Message = "Student must be at least 16 years old",
                            Errors = new List<string> { "Invalid date of birth" }
                        });
                    }
                }

                var student = await _studentService.UpdateStudentAsync(id, updateStudentDto);

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
                    Message = "Student updated successfully",
                    Data = student
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<StudentResponseDto>
                {
                    Success = false,
                    Message = "An error occurred while updating the student",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Delete a student
        /// </summary>
        /// <param name="id">Student ID</param>
        /// <returns>Deletion confirmation</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteStudent(int id)
        {
            try
            {
                var deleted = await _studentService.DeleteStudentAsync(id);

                if (!deleted)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Student with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Student deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting the student",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        /// <summary>
        /// Get student statistics
        /// </summary>
        /// <returns>Student count and other statistics</returns>
        [HttpGet("stats")]
        public async Task<ActionResult<ApiResponse<object>>> GetStudentStats()
        {
            try
            {
                var totalStudents = await _studentService.GetStudentCountAsync();
                var activeStudents = await _studentService.GetAllStudentsAsync(1, int.MaxValue, StudentStatus.Active);
                var graduatedStudents = await _studentService.GetAllStudentsAsync(1, int.MaxValue, StudentStatus.Graduated);
                var inactiveStudents = await _studentService.GetAllStudentsAsync(1, int.MaxValue, StudentStatus.Inactive);

                var stats = new
                {
                    TotalStudents = totalStudents,
                    ActiveStudents = activeStudents.TotalCount,
                    GraduatedStudents = graduatedStudents.TotalCount,
                    InactiveStudents = inactiveStudents.TotalCount,
                    GraduationRate = totalStudents > 0 ? Math.Round((double)graduatedStudents.TotalCount / totalStudents * 100, 2) : 0,
                    ActiveRate = totalStudents > 0 ? Math.Round((double)activeStudents.TotalCount / totalStudents * 100, 2) : 0
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Student statistics retrieved successfully",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving student statistics",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}