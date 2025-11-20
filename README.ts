using Microsoft.EntityFrameworkCore;
using StudentManagement.Data;
using StudentManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace StudentManagement.Services
{
    public class StudentService : IStudentService
    {
        private readonly ApplicationDbContext _context;

        public StudentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<ClassDetail> GetAllClasses()
        {
            return _context.ClassDetails
                .OrderBy(c => c.ClassName)
                .ToList();
        }

        public (long studentId, long registrationNumber)? GetNextAvailableId(string className)
        {
            if (string.IsNullOrWhiteSpace(className))
                return null;

            // Get the class details to know the range
            var classDetail = _context.ClassDetails
                .FirstOrDefault(c => c.ClassName == className);

            if (classDetail == null)
                return null;

            // Get the last student ID for this class
            var lastStudent = _context.Students
                .Where(s => s.StudentClass == className)
                .OrderByDescending(s => s.StudentId)
                .FirstOrDefault();

            long nextId;

            if (lastStudent == null)
            {
                // No students in this class yet, use the start ID
                nextId = classDetail.StartStudentId;
            }
            else
            {
                // Increment the last student ID
                nextId = lastStudent.StudentId + 1;
            }

            // Validate that the next ID is within the allowed range
            if (nextId > classDetail.EndStudentId)
            {
                throw new InvalidOperationException(
                    $"Cannot create more students for {className}. ID range exhausted.");
            }

            // Both student ID and registration number are the same
            return (nextId, nextId);
        }

        public bool ValidateIdInRange(string className, long studentId)
        {
            var classDetail = _context.ClassDetails
                .FirstOrDefault(c => c.ClassName == className);

            if (classDetail == null)
                return false;

            return studentId >= classDetail.StartStudentId && 
                   studentId <= classDetail.EndStudentId;
        }

        public Student CreateStudent(Student student)
        {
            // Use a transaction to ensure consistency
            using (var transaction = _context.Database.BeginTransaction(
                System.Data.IsolationLevel.Serializable))
            {
                try
                {
                    // Get the next available ID within the transaction
                    var nextId = GetNextAvailableId(student.StudentClass);

                    if (nextId == null)
                    {
                        throw new InvalidOperationException(
                            $"Cannot generate ID for class {student.StudentClass}");
                    }

                    // Set both ID and registration number to the same value
                    student.StudentId = nextId.Value.studentId;
                    student.StudentRegistrationNumber = nextId.Value.registrationNumber;

                    // Validate the ID is in range
                    if (!ValidateIdInRange(student.StudentClass, student.StudentId))
                    {
                        throw new InvalidOperationException(
                            $"Student ID {student.StudentId} is out of range for {student.StudentClass}");
                    }

                    // Add the student
                    _context.Students.Add(student);
                    _context.SaveChanges();

                    // Commit the transaction
                    transaction.Commit();

                    return student;
                }
                catch (Exception)
                {
                    // Rollback on any error
                    transaction.Rollback();
                    throw;
                }
            }
        }
    }
}
