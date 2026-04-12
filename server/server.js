const express = require('express')
const path = require('path')
const fs = require('fs/promises')
const app = express()

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

async function readMovieData(filename) {
  try{
    //console.log(filename);
    const raw = await fs.readFile(`data/${filename}`, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading file ${filename}:`, err);
    return undefined; // Return undefined to indicate a failed read.
  }
}

async function getAllStoredMovies() {
  try {
    const files = await fs.readdir('data');
    return files.filter(file => file.endsWith('.json'));
  } catch (err) {
    console.error('Error reading data directory:', err);
    return [];
  }
}

// Configure a 'get' endpoint for data..
app.get('/movies', async function (req, res) {
  try {
    // Get all movie filenames from the data directory
    const files = await getAllStoredMovies();
    
    // Read and parse each movie file asynchronously
    const movies = (await Promise.all(files.map(file => readMovieData(file))))
      .filter(movie => movie !== undefined); // Filter out any undefined results from failed reads.
    
    // Send the movie data as JSON response
    res.json(movies);
  } catch (err) {
    console.error('Error processing movies:', err);
    res.status(500).send('Internal Server Error');
  }
})

app.listen(3000)
console.log("Server now listening on http://localhost:3000/")

