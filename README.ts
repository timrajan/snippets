 const formattedString = Object.entries(row)
    .map(([key, value]) => `${key}:${value}`)
    .join(';');
