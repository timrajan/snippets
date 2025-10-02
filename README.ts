// Helper function to convert RGB/RGBA to Hex
function rgbToHex(rgb) {
  // Check if it's already a hex color or other format
  if (!rgb.startsWith('rgb')) {
    return rgb;
  }
  
  // Extract RGB values
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] ? parseFloat(match[4]) : null;
  
  // Convert to hex
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  // If there's alpha, include it
  if (a !== null && a < 1) {
    const alphaHex = toHex(Math.round(a * 255));
    return `${hexColor}${alphaHex} (${Math.round(a * 100)}% opacity)`;
  }
  
  return hexColor;
}

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
    const convertedValue = rgbToHex(value);
    output.push(`${prop}: ${convertedValue}`);
  }
  output.push('');
  
  // Inline styles
  output.push('=== INLINE STYLES ===');
  if (element.style.length > 0) {
    for (let i = 0; i < element.style.length; i++) {
      const prop = element.style[i];
      const value = element.style.getPropertyValue(prop);
      const convertedValue = rgbToHex(value);
      output.push(`${prop}: ${convertedValue}`);
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
