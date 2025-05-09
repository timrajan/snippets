function extractSequenceNames(xmlContent: string): string[] {
  // Parse the XML string into a DOM document
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  
  // Find all sequence elements
  const sequences = xmlDoc.getElementsByTagName("xs:sequence");
  
  // Array to store the extracted names
  const names: string[] = [];
  
  // Iterate through each sequence element
  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    
    // Get all child elements of the sequence
    const children = sequence.children;
    
    // Extract the name attribute from each element in the sequence
    for (let j = 0; j < children.length; j++) {
      const element = children[j];
      const nameAttr = element.getAttribute("name");
      if (nameAttr) {
        // Remove any single quotes that might be part of the name
        names.push(nameAttr.replace(/'/g, ""));
      }
    }
  }
  
  return names;
}
