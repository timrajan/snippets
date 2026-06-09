const ok = await el.evaluate(node => {
  if (!(node instanceof Element)) return 'not-an-element';
  const r = node.getBoundingClientRect();
  return { w: r.width, h: r.height, connected: node.isConnected };
});
console.log(ok);
