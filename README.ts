/**
 * Gets all XML tag names as a string array
 * @param xmlString The XML string to parse
 * @returns A string array containing all tag names in the XML
 */
function getAllXmlTagNames(xmlString: string): string[] {
  // Parse the XML string into a DOM Document
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // Array to store tag names
  const tagNames: string[] = [];
  
  // Recursive function to traverse the XML tree
  function traverseNodes(node: Node) {
    // If this is an element node, add its tag name to our array
    if (node.nodeType === Node.ELEMENT_NODE) {
      tagNames.push(node.nodeName);
    }
    
    // Process child nodes
    for (let i = 0; node.childNodes && i < node.childNodes.length; i++) {
      traverseNodes(node.childNodes[i]);
    }
  }
  
  // Start traversal from the document element
  traverseNodes(xmlDoc.documentElement);
  
  return tagNames;
}
