const allowedKeys = ["col1", "col2", "name", "status"]; // your string array

const allKeys = Array.from(
  new Set(
    rows.flatMap((record) => Object.keys(record)).filter((key) => allowedKeys.includes(key))
  )
);
