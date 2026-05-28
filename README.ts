console.log(`  Element tagName: ${currentNode.tagName}`);
console.log(`  Element still in DOM: ${document.body.contains(currentNode)}`);
console.log(`  Total buttons on page: ${document.querySelectorAll('button').length}`);
console.log(`  Buttons matching text on whole page: ${
  Array.from(document.querySelectorAll('button'))
    .filter(b => b.textContent?.includes(buttonText)).length
}`);
