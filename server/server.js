const express = require('express')
const path = require('path')
const fs = require('fs/promises')
const app = express()

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

async function readMovieData(filename) {
  try{
    const raw = await fs.readFile(path.join(__dirname, 'data', filename), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading file ${filename}:`, err);
    return undefined;
  }
}

async function getAllStoredMovies() {
  try {
    const files = await fs.readdir(path.join(__dirname, 'data'));
    return files.filter(file => file.endsWith('.json'));
  } catch (err) {
    console.error('Error reading data directory:', err);
    return [];
  }
}

// Configure a 'get' endpoint for data
app.get('/movies', async function (req, res) {
  try {
    const files = await getAllStoredMovies();
    
    const movies = (await Promise.all(files.map(file => readMovieData(file))))
      .filter(movie => movie !== undefined); 
    
    res.json(movies);
  } catch (err) {
    console.error('Error processing movies:', err);
    res.status(500).send('Internal Server Error');
  }
})

app.listen(3000)
console.log("Server now listening on http://localhost:3000/")

