import fs from "fs";

  // Read data from the JSON file
  const readData = (db_name) => {
    const rawData = fs.readFileSync(`${db_name}.json`);
    return JSON.parse(rawData);
  };

  // Write data to the JSON file
  const writeData = (db_name,data) => {
    return fs.writeFileSync(`${db_name}.json`, JSON.stringify(data, null, 2));
  };

  

  export {readData,writeData};
