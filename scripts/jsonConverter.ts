import { Parser } from "json2csv";
import fs from "fs";

const filePath = process.argv[2] as string;

fs.readFile(`${filePath}.json`, "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);
    console.log("JSON Data:", jsonData);
    // Convert the JSON data
    const csvData = convertJsonToCsv(jsonData);
  } catch (err) {
    console.error("Error parsing JSON:", err);
  }
});

// Function to convert JSON to CSV using json2csv
function convertJsonToCsv(jsonData: JSON) {
  try {
    const json2csvParser = new Parser(); // Initialize the Parser
    const csv = json2csvParser.parse(jsonData); // Convert JSON to CSV
    fs.writeFile(`${filePath}.csv`, csv, "utf-8", (err) => {
      if (err) {
        console.log("Error when outputting: ", err);
      }
    });
    return csv;
  } catch (err) {
    console.error("Error converting JSON to CSV:", err);
  }
}
