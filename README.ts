# Check NODE_OPTIONS
echo %NODE_OPTIONS%

# Check memory limit
node -e "console.log('Heap limit:', Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024), 'MB')"


set NODE_OPTIONS=--max-old-space-size=4096
npm test
