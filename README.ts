using Microsoft.EntityFrameworkCore;
using StudentManagement.Models;

namespace StudentManagement.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for each table
        public DbSet<Team> Teams { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<TeamAdmin> Users { get; set; }
        public DbSet<StudyRecord> StudyRecords { get; set; }
        public DbSet<SportsRecord> SportsRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Team entity
            modelBuilder.Entity<Team>(entity =>
            {
                entity.ToTable("teams");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.TeamAdminName).HasColumnName("team_admin_name").HasMaxLength(100);
                entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            });

            // Configure Student entity
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("students");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
                entity.Property(e => e.TeamId).HasColumnName("team_id");
                entity.Property(e => e.EnrollmentDate).HasColumnName("enrollment_date");
                entity.Property(e => e.PhoneNumber).HasColumnName("phone_number").HasMaxLength(20);
                entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50);

                // Foreign key relationship with Team
                entity.HasOne<Team>()
                    .WithMany()
                    .HasForeignKey(e => e.TeamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure TeamAdmin entity (maps to 'users' table)
            modelBuilder.Entity<TeamAdmin>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TeamId).HasColumnName("team_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
                entity.Property(e => e.Username).HasColumnName("username").HasMaxLength(100).IsRequired();
                entity.Property(e => e.AddedDate).HasColumnName("added_date");

                // Foreign key relationship with Team
                entity.HasOne<Team>()
                    .WithMany()
                    .HasForeignKey(e => e.TeamId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure StudyRecord entity
            modelBuilder.Entity<StudyRecord>(entity =>
            {
                entity.ToTable("study_records");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Team).HasColumnName("team").HasMaxLength(50);
                entity.Property(e => e.FirstName).HasColumnName("first_name").HasMaxLength(100);
                entity.Property(e => e.MiddleName).HasColumnName("middle_name").HasMaxLength(100);
                entity.Property(e => e.LastName).HasColumnName("last_name").HasMaxLength(100);
                entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth").HasMaxLength(50);
                entity.Property(e => e.EmailAddress).HasColumnName("email_address").HasMaxLength(150);
                entity.Property(e => e.StudentIdentityID).HasColumnName("student_identity_id").HasMaxLength(50);
                entity.Property(e => e.StudentInitialID).HasColumnName("student_initial_id").HasMaxLength(50);
                entity.Property(e => e.Environment).HasColumnName("environment").HasMaxLength(50);
                entity.Property(e => e.StudentIQLevel).HasColumnName("student_iq_level").HasMaxLength(50);
                entity.Property(e => e.StudentRollNumber).HasColumnName("student_roll_number").HasMaxLength(50);
                entity.Property(e => e.StudentRollName).HasColumnName("student_roll_name").HasMaxLength(100);
                entity.Property(e => e.StudentParentEmailAddress).HasColumnName("student_parent_email_address").HasMaxLength(150);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Tags).HasColumnName("tags").HasMaxLength(200);
                entity.Property(e => e.CreatedDate).HasColumnName("created_date");
            });

            // Configure SportsRecord entity
            modelBuilder.Entity<SportsRecord>(entity =>
            {
                entity.ToTable("sports_records");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.StudentName).HasColumnName("student_name").HasMaxLength(150);
                entity.Property(e => e.Sport).HasColumnName("sport").HasMaxLength(100);
                entity.Property(e => e.Score).HasColumnName("score");
                entity.Property(e => e.Date).HasColumnName("date");
            });
        }
    }
}
