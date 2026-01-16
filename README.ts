async function recursiveTask(shouldContinue: boolean): Promise<void> {
  // Base case: exit if shouldContinue is false
  if (!shouldContinue) {
    console.log("Condition is false - exiting recursion");
    return;
  }
  
  console.log("Condition is true - processing...");
  
  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get the next condition (this could be from an API, database, etc.)
  const nextCondition = await checkCondition();
  
  // Recursive call with the new condition
  await recursiveTask(nextCondition);
  
  console.log("Unwinding from recursion");
}

// Helper function to simulate checking a condition
async function checkCondition(): Promise<boolean> {
  // This could be an API call, database query, etc.
  // For demo purposes, randomly return true or false
  const random = Math.random();
  const result = random > 0.3;
  console.log(`Next condition: ${result}`);
  return result;
}

// Main function
async function main(): Promise<void> {
  console.log("Starting main function");
  
  // Start the recursion with initial condition
  await recursiveTask(true);
  
  console.log("Back to main function - completed!");
}

// Execute
main();
```

**Sample Output:**
```
Starting main function
Condition is true - processing...
Next condition: true
Condition is true - processing...
Next condition: false
Condition is false - exiting recursion
Unwinding from recursion
Unwinding from recursion
Back to main function - completed!
