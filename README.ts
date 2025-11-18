public class StudentRegistrationViewModel
{
    // Basic info from Page 1
    public string Name { get; set; }
    public string Email { get; set; }
    public string DateOfBirth { get; set; }
    // ... other common fields
    
    // Collection of address-school pairs from Page 2
    public List<AddressSchoolPair> AddressSchoolPairs { get; set; }
}

public class AddressSchoolPair
{
    public string PreviousAddress { get; set; }
    public string PreviousSchoolName { get; set; }
}
