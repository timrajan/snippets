/**
 * Function to remove Table1 nodes with Language="EN" from XML data
 * @param xmlString - The XML string to process
 * @returns The modified XML string with EN language nodes removed
 */
function removeEnglishLanguageNodes(xmlString: string): string {
  // Parse the XML string into a DOM document
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // Find all Table1 nodes
  const table1Nodes = xmlDoc.getElementsByTagName("Table1");
  
  // We need to use an array to store nodes to remove because removing them during iteration
  // would affect the live NodeList and cause issues
  const nodesToRemove: Element[] = [];
  
  // Identify Table1 nodes with Language="EN"
  for (let i = 0; i < table1Nodes.length; i++) {
    const table1Node = table1Nodes[i];
    const languageNode = table1Node.getElementsByTagName("Language")[0];
    
    // Check if the Language node exists and its value is "EN"
    if (languageNode && languageNode.textContent === "EN") {
      nodesToRemove.push(table1Node);
    }
  }
  
  // Remove identified nodes
  nodesToRemove.forEach(node => {
    node.parentNode?.removeChild(node);
  });
  
  // Serialize the modified document back to a string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

Microsoft.VSTS.TCM.LocalDataSource


/**
 * Checks if an XML document contains a node with a specific value
 * @param xmlDoc The XML document to search in
 * @param nodeName The name of the node to search for (optional)
 * @param nodeValue The value to look for
 * @returns boolean indicating if a node with the value exists
 */
function xmlHasNodeWithValue(
  xmlDoc: XMLDocument, 
  nodeValue: string, 
  nodeName?: string
): boolean {
  // If a specific node name is provided
  if (nodeName) {
    const nodes = xmlDoc.getElementsByTagName(nodeName);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].textContent === nodeValue) {
        return true;
      }
    }
    return false;
  } 
  // If we need to search all nodes
  else {
    // Helper function to recursively search all nodes
    function searchNodes(node: Node): boolean {
      // Check this node's value
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim() === nodeValue) {
        return true;
      }
      if (node.nodeType === Node.ELEMENT_NODE && node.textContent === nodeValue) {
        return true;
      }
      
      // Check child nodes
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        if (searchNodes(childNodes[i])) {
          return true;
        }
      }
      
      return false;
    }
    
    return searchNodes(xmlDoc);
  }
}

// Usage example
const xmlString = `
  <root>
    <person>
      <name>John Doe</name>
      <age>30</age>
    </person>
    <person>
      <name>Jane Smith</name>
      <age>25</age>
    </person>
  </root>
`;

const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlString, "text/xml");

// Check if there's a node with name "name" and value "John Doe"
const hasJohn = xmlHasNodeWithValue(xmlDoc, "John Doe", "name");
console.log("Has 'John Doe' as name:", hasJohn); // true

// Check if there's a node with name "age" and value "40"
const hasAge40 = xmlHasNodeWithValue(xmlDoc, "40", "age");
console.log("Has age 40:", hasAge40); // false

// Check if the value "Jane Smith" exists anywhere in the document
const hasJane = xmlHasNodeWithValue(xmlDoc, "Jane Smith");
console.log("Has 'Jane Smith' anywhere:", hasJane); // true





function stringToXmlDocument(xmlString: string): XMLDocument {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`);
  }
  
  return xmlDoc;
}







/**
   * Updates a single node with the provided value
   * @param node The node to update
   * @param newValue The new value to set
   * @param attribute Optional attribute name to update
   * @returns 1 if update was successful, 0 otherwise
   */
  private updateNode(node: Node, newValue: string, attribute?: string): number {
    if (attribute) {
      // Update attribute value
      if (node.nodeType === 1) { // Element node
        (node as Element).setAttribute(attribute, newValue);
        return 1;
      }
    } else {
      // Update text content
      if (node.nodeType === 1) { // Element node
        node.textContent = newValue;
        return 1;
      } else if (node.nodeType === 2) { // Attribute node
        (node as Attr).value = newValue;
        return 1;
      }
    }
    return 0;
  }

  /**
   * Save the modified XML back to file
   * @param outputPath Optional path to save to (defaults to original path)
   * @returns Promise that resolves when the file is saved
   */
  public async saveXML(outputPath?: string): Promise<void> {
    if (!this.xmlDoc) {
      throw new Error('No XML document loaded. Call readXMLFile first.');
    }

    try {
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(this.xmlDoc);
      const savePath = outputPath || this.xmlPath;
      
      await fs.promises.writeFile(savePath, xmlString, 'utf-8');
      console.log(`Successfully saved XML to: ${savePath}`);
    } catch (error) {
      console.error(`Error saving XML file: ${error}`);
      throw error;
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';
import * as xpath from 'xpath';

// Define proper types for xmldom's Document
type XmlDomDocument = Document & {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
}

/**
 * Class to read, update, and save XML files
 */
class XMLNodeUpdater {
  private xmlDoc: XmlDomDocument | null = null;
  private xmlPath: string = '';
  private xmlContent: string = '';

  /**
   * Read an XML file from the specified path
   * @param filePath Path to the XML file
   * @returns Promise that resolves when the file is loaded
   */
  public async readXMLFile(filePath: string): Promise<void> {
    try {
      this.xmlPath = filePath;
      this.xmlContent = await fs.promises.readFile(filePath, 'utf-8');
      const parser = new DOMParser();
      this.xmlDoc = parser.parseFromString(this.xmlContent, 'text/xml') as unknown as XmlDomDocument;
      console.log(`Successfully loaded XML from: ${filePath}`);
    } catch (error) {
      console.error(`Error reading XML file: ${error}`);
      throw error;
    }
  }
  
  /**
   * Get the XML content as a string
   * @returns The XML content as a string
   */
  public getXMLString(): string {
    if (!this.xmlContent) {
      throw new Error('No XML content available. Call readXMLFile first.');
    }
    return this.xmlContent;
  }

  /**
   * Update nodes that match the provided XPath expression
   * @param xpathExpression XPath expression to locate nodes
   * @param newValue New value to set for the nodes
   * @param attribute Optional attribute to update (if not provided, updates node text content)
   * @returns Number of nodes updated
   */
  public updateNodes(xpathExpression: string, newValue: string, attribute?: string): number {
    if (!this.xmlDoc) {
      throw new Error('No XML document loaded. Call readXMLFile first.');
    }

    try {
      const nodes = xpath.select(xpathExpression, this.xmlDoc);
      let updateCount = 0;

      if (nodes && nodes.length > 0) {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i] as Node;
          
          if (attribute) {
            // Update attribute value
            if (node.nodeType === 1) { // Element node
              (node as Element).setAttribute(attribute, newValue);
              updateCount++;
            }
          } else {
            // Update text content
            if (node.nodeType === 1) { // Element node
              node.textContent = newValue;
              updateCount++;
            } else if (node.nodeType === 2) { // Attribute node
              (node as Attr).value = newValue;
              updateCount++;
            }
          }
        }
      }

      console.log(`Updated ${updateCount} nodes matching: ${xpathExpression}`);
      return updateCount;
    } catch (error) {
      console.error(`Error updating nodes: ${error}`);
      throw error;
    }
  }

  /**
   * Save the modified XML back to file
   * @param outputPath Optional path to save to (defaults to original path)
   * @returns Promise that resolves when the file is saved
   */
  public async saveXML(outputPath?: string): Promise<void> {
    if (!this.xmlDoc) {
      throw new Error('No XML document loaded. Call readXMLFile first.');
    }

    try {
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(this.xmlDoc);
      const savePath = outputPath || this.xmlPath;
      
      await fs.promises.writeFile(savePath, xmlString, 'utf-8');
      console.log(`Successfully saved XML to: ${savePath}`);
    } catch (error) {
      console.error(`Error saving XML file: ${error}`);
      throw error;
    }
  }
}

/**
 * Example usage of the XMLNodeUpdater class
 */
async function example() {
  try {
    const updater = new XMLNodeUpdater();
    
    // Path to the XML file
    const xmlFilePath = path.join(__dirname, 'path', 'to', 'your-file.xml');
    
    // Read the XML file
    await updater.readXMLFile(xmlFilePath);
    
    // Get XML as string
    const xmlString = updater.getXMLString();
    console.log("Original XML as string (first 100 chars):", xmlString.substring(0, 100));
    
    // Update nodes examples
    
    // Example 1: Update text content of elements matching an XPath
    updater.updateNodes('//book[@category="fiction"]/title', 'Updated Title');
    
    // Example 2: Update an attribute value
    updater.updateNodes('//book[@id="bk102"]', 'fantasy', 'category');
    
    // Example 3: Update all price elements with a new value
    updater.updateNodes('//price', '29.99');
    
    // Save the modified XML (can specify a different output path)
    await updater.saveXML(path.join(__dirname, 'path', 'to', 'updated-file.xml'));
    
    console.log('XML update process completed successfully!');
  } catch (error) {
    console.error(`Error in example: ${error}`);
  }
}

// Run the example
example();

/**
 * Batch update multiple XML files in a directory
 * @param directoryPath Path to directory containing XML files
 * @param xpathExpression XPath expression to locate nodes
 * @param newValue New value to set
 * @param attribute Optional attribute to update
 */
async function batchUpdateXMLFiles(
  directoryPath: string,
  xpathExpression: string,
  newValue: string,
  attribute?: string
): Promise<void> {
  try {
    // Read all files in directory
    const files = await fs.promises.readdir(directoryPath);
    const xmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.xml');
    
    console.log(`Found ${xmlFiles.length} XML files to process`);
    
    for (const xmlFile of xmlFiles) {
      const filePath = path.join(directoryPath, xmlFile);
      console.log(`Processing file: ${xmlFile}`);
      
      const updater = new XMLNodeUpdater();
      await updater.readXMLFile(filePath);
      const updateCount = updater.updateNodes(xpathExpression, newValue, attribute);
      
      if (updateCount > 0) {
        await updater.saveXML();
        console.log(`Updated ${updateCount} nodes in ${xmlFile}`);
      } else {
        console.log(`No matching nodes found in ${xmlFile}`);
      }
    }
    
    console.log('Batch update completed successfully!');
  } catch (error) {
    console.error(`Error in batch update: ${error}`);
  }
}

// Example of batch updating
// batchUpdateXMLFiles(
//   path.join(__dirname, 'xml-files'),
//   '//product/price',
//   '19.99'
// );

/**
 * Utility function to read an XML file and return it as a string
 * @param filePath Path to the XML file
 * @returns Promise that resolves with the XML content as a string
 */
async function readXMLAsString(filePath: string): Promise<string> {
  try {
    const xmlContent = await fs.promises.readFile(filePath, 'utf-8');
    console.log(`Successfully read XML from: ${filePath}`);
    return xmlContent;
  } catch (error) {
    console.error(`Error reading XML file: ${error}`);
    throw error;
  }
}

// Example of reading XML as string
async function exampleReadXMLAsString() {
  try {
    const xmlFilePath = path.join(__dirname, 'path', 'to', 'your-file.xml');
    const xmlString = await readXMLAsString(xmlFilePath);
    console.log('XML content as string:');
    console.log(xmlString.substring(0, 200) + '...'); // Print first 200 chars
    return xmlString;
  } catch (error) {
    console.error(`Error in example: ${error}`);
    return '';
  }
}
