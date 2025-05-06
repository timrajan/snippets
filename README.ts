// Test Case result interface
interface TestCaseInfo {
  id: number;
  name: string;
  state?: string;
  priority?: number | string;
}



 } catch (error) {
    console.error('Error fetching test cases:', (error as Error).message);
    throw error;
  }
}
