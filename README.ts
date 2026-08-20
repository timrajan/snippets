[Required(ErrorMessage = "This field is required")]
[RegularExpression(@"^\d+$", ErrorMessage = "Only numbers are allowed in this field")]
[Display(Name = "Account Number")]
public string AccountNumber { get; set; }
