// Define the response interface
interface Person {
  firstname: string;
  middlename: string;
  lastname: string;
  dob: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Person[];
  errors: string[];
}

// Function to fetch email from the API
async function getEmailFromApi(tag: string): Promise<string | null> {
  try {
    const response = await fetch(`http://localhost/cm/api/cm/allcmtag?tag=${tag}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiResponse: ApiResponse = await response.json();
    
    // Check if the API call was successful
    if (!apiResponse.success) {
      console.error('API returned error:', apiResponse.message);
      return null;
    }
    
    // Check if data exists and has at least one person
    if (apiResponse.data && apiResponse.data.length > 0) {
      return apiResponse.data[0].email; // Return the first person's email
    }
    
    console.log('No data found');
    return null;
    
  } catch (error) {
    console.error('Error fetching email:', error);
    return null;
  }
}

// Function to get all emails if there are multiple people
async function getAllEmailsFromApi(tag: string): Promise<string[]> {
  try {
    const response = await fetch(`http://localhost/cm/api/cm/allcmtag?tag=${tag}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const apiResponse: ApiResponse = await response.json();
    
    if (!apiResponse.success) {
      console.error('API returned error:', apiResponse.message);
      return [];
    }
    
    if (apiResponse.data && apiResponse.data.length > 0) {
      return apiResponse.data.map(person => person.email);
    }
    
    return [];
    
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
}

// Usage examples
async function main() {
  // Get single email (first person's email)
  const email = await getEmailFromApi('mytag');
  console.log('Email:', email);
  
  // Get all emails if multiple people exist
  const allEmails = await getAllEmailsFromApi('mytag');
  console.log('All emails:', allEmails);
}

// Call the function
main();
