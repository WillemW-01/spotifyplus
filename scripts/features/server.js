// Import the required modules
const express = require("express");
const fs = require("fs");
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Route to handle POST requests for writing to a file
app.post("/write", (req, res) => {
  try {
    console.log("Received request!");
    const { fileName, content } = req.body; // Get data from the request body
    const file = String(fileName).replaceAll(" ", "_").toLowerCase();
    console.log(`Writing to ${file}`);
    // Write the data to a file
    fs.appendFile(`./scripts/features/features_${file}.json`, content, (err) => {
      if (err) {
        console.log("Error: ", err);
        return res.status(500).send("Error writing to file");
      }
      return res.send("Data written to file");
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).send(`Error somewhere: ${JSON.stringify(error)}`);
  }
  console.log("Finished request");
  return res.status(200);
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
