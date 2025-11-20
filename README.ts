using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentManagement.Models
{
    [Table("class_details")]
    public class ClassDetail
    {
        [Key]
        [Column("class")]
        public string ClassName { get; set; }

        [Column("student_id")]
        public long StartStudentId { get; set; }

        [Column("student_registration_number")]
        public long EndStudentId { get; set; }
    }
}
