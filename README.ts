// Extract all style information from the currently inspected element
function extractElementStyles() {
  // Get the currently selected element in DevTools
  const element = $0; // $0 refers to the currently selected element in Chrome DevTools
  
  if (!element) {
    console.log('No element selected. Please select an element in the Elements tab first.');
    return;
  }
  
  let output = [];
  
  // Basic element information
  output.push('=== ELEMENT INFORMATION ===');
  output.push(`Tag: ${element.tagName}`);
  output.push(`ID: ${element.id || 'none'}`);
  output.push(`Classes: ${element.className || 'none'}`);
  output.push('');
  
  // HTML
  output.push('=== HTML ===');
  output.push(element.outerHTML);
  output.push('');
  
  // Computed styles
  output.push('=== COMPUTED STYLES ===');
  const computedStyles = window.getComputedStyle(element);
  for (let i = 0; i < computedStyles.length; i++) {
    const prop = computedStyles[i];
    const value = computedStyles.getPropertyValue(prop);
    output.push(`${prop}: ${value}`);
  }
  output.push('');
  
  // Inline styles
  output.push('=== INLINE STYLES ===');
  if (element.style.length > 0) {
    for (let i = 0; i < element.style.length; i++) {
      const prop = element.style[i];
      const value = element.style.getPropertyValue(prop);
      output.push(`${prop}: ${value}`);
    }
  } else {
    output.push('No inline styles');
  }
  output.push('');
  
  // Combine all output
  const result = output.join('\n');
  
  // Copy to clipboard
  navigator.clipboard.writeText(result).then(() => {
    console.log('✅ Element styles copied to clipboard! Paste into Notepad.');
    console.log('\nPreview:');
    console.log(result);
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
    console.log('\nHere\'s the output (copy manually):');
    console.log(result);
  });
}

// Run the function
extractElementStyles();
