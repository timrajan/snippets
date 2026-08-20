[Required(ErrorMessage = "This field is required")]
[RegularExpression(@"^\d+$", ErrorMessage = "Only numbers are allowed in this field")]
  [RegularExpression(@"^\d{10}$", ErrorMessage = "Must be exactly 10 digits")]
[Display(Name = "Account Number")]
public string AccountNumber { get; set; }
