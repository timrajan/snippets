using Microsoft.EntityFrameworkCore;
using StudentAPI.Data;
using StudentAPI.DTOs;
using StudentAPI.Models;

namespace StudentAPI.Services
{
    public interface IStudentService
    {
        Task<PaginatedResponse<StudentResponseDto>> GetAllStudentsAsync(int pageNumber = 1, int pageSize = 10, StudentStatus? status = null, string? major = null);
        Task<StudentResponseDto?> GetStudentByIdAsync(int id);
        Task<StudentResponseDto?> GetStudentByEmailAsync(string email);
        Task<StudentResponseDto> CreateStudentAsync(CreateStudentDto createStudentDto);
        Task<StudentResponseDto?> UpdateStudentAsync(int id, UpdateStudentDto updateStudentDto);
        Task<bool> DeleteStudentAsync(int id);
        Task<int> GetStudentCountAsync();
        Task<bool> EmailExistsAsync(string email, int? excludeStudentId = null);
    }

    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResponse<StudentResponseDto>> GetAllStudentsAsync(
            int pageNumber = 1, 
            int pageSize = 10, 
            StudentStatus? status = null, 
            string? major = null)
        {
            var query = _context.Students.AsQueryable();

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            if (!string.IsNullOrEmpty(major))
            {
                query = query.Where(s => s.Major.ToLower().Contains(major.ToLower()));
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var students = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new StudentResponseDto
                {
                    Id = s.Id,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    FullName = s.FullName,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    DateOfBirth = s.DateOfBirth,
                    Age = s.Age,
                    Major = s.Major,
                    GPA = s.GPA,
                    Status = s.Status,
                    EnrollmentDate = s.EnrollmentDate,
                    GraduationDate = s.GraduationDate,
                    Address = s.Address,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();

            return new PaginatedResponse<StudentResponseDto>
            {
                Data = students,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<StudentResponseDto?> GetStudentByIdAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            
            if (student == null)
                return null;

            return new StudentResponseDto
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                FullName = student.FullName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Age = student.Age,
                Major = student.Major,
                GPA = student.GPA,
                Status = student.Status,
                EnrollmentDate = student.EnrollmentDate,
                GraduationDate = student.GraduationDate,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }

        public async Task<StudentResponseDto?> GetStudentByEmailAsync(string email)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.Email.ToLower() == email.ToLower());
            
            if (student == null)
                return null;

            return new StudentResponseDto
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                FullName = student.FullName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Age = student.Age,
                Major = student.Major,
                GPA = student.GPA,
                Status = student.Status,
                EnrollmentDate = student.EnrollmentDate,
                GraduationDate = student.GraduationDate,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }

        public async Task<StudentResponseDto> CreateStudentAsync(CreateStudentDto createStudentDto)
        {
            var student = new Student
            {
                FirstName = createStudentDto.FirstName,
                LastName = createStudentDto.LastName,
                Email = createStudentDto.Email,
                PhoneNumber = createStudentDto.PhoneNumber,
                DateOfBirth = createStudentDto.DateOfBirth,
                Major = createStudentDto.Major,
                GPA = createStudentDto.GPA,
                Status = createStudentDto.Status,
                EnrollmentDate = createStudentDto.EnrollmentDate ?? DateTime.UtcNow,
                Address = createStudentDto.Address,
                CreatedAt = DateTime.UtcNow
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return new StudentResponseDto
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                FullName = student.FullName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Age = student.Age,
                Major = student.Major,
                GPA = student.GPA,
                Status = student.Status,
                EnrollmentDate = student.EnrollmentDate,
                GraduationDate = student.GraduationDate,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }

        public async Task<StudentResponseDto?> UpdateStudentAsync(int id, UpdateStudentDto updateStudentDto)
        {
            var student = await _context.Students.FindAsync(id);
            
            if (student == null)
                return null;

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateStudentDto.FirstName))
                student.FirstName = updateStudentDto.FirstName;

            if (!string.IsNullOrEmpty(updateStudentDto.LastName))
                student.LastName = updateStudentDto.LastName;

            if (!string.IsNullOrEmpty(updateStudentDto.Email))
                student.Email = updateStudentDto.Email;

            if (updateStudentDto.PhoneNumber != null)
                student.PhoneNumber = updateStudentDto.PhoneNumber;

            if (updateStudentDto.DateOfBirth.HasValue)
                student.DateOfBirth = updateStudentDto.DateOfBirth.Value;

            if (!string.IsNullOrEmpty(updateStudentDto.Major))
                student.Major = updateStudentDto.Major;

            if (updateStudentDto.GPA.HasValue)
                student.GPA = updateStudentDto.GPA.Value;

            if (updateStudentDto.Status.HasValue)
                student.Status = updateStudentDto.Status.Value;

            if (updateStudentDto.GraduationDate.HasValue)
                student.GraduationDate = updateStudentDto.GraduationDate.Value;

            if (updateStudentDto.Address != null)
                student.Address = updateStudentDto.Address;

            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new StudentResponseDto
            {
                Id = student.Id,
                FirstName = student.FirstName,
                LastName = student.LastName,
                FullName = student.FullName,
                Email = student.Email,
                PhoneNumber = student.PhoneNumber,
                DateOfBirth = student.DateOfBirth,
                Age = student.Age,
                Major = student.Major,
                GPA = student.GPA,
                Status = student.Status,
                EnrollmentDate = student.EnrollmentDate,
                GraduationDate = student.GraduationDate,
                Address = student.Address,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt
            };
        }

        public async Task<bool> DeleteStudentAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            
            if (student == null)
                return false;

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetStudentCountAsync()
        {
            return await _context.Students.CountAsync();
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeStudentId = null)
        {
            var query = _context.Students.Where(s => s.Email.ToLower() == email.ToLower());
            
            if (excludeStudentId.HasValue)
            {
                query = query.Where(s => s.Id != excludeStudentId.Value);
            }

            return await query.AnyAsync();
        }
    }
}