import { MovieDictionary, TagInfo } from "../types";
import fs from "fs";
import readline from "readline";
import path from "path";

// Constants for vector size and file paths
const VECTOR_SIZE = 1094;
const TAGS = "../../dataset/raw/tags.json";
const MOVIES = "../../dataset/raw/metadata.json";
const SCORES = "../../dataset/scores/tagdl.csv";

/**
 * Loads the tag map from the tags.json file.
 * Maps each tag to its index in the vector.
 */
async function loadTagMap(): Promise<Map<string, number>> {
  const filePath = path.resolve(__dirname, TAGS);
  const fileStream = fs.createReadStream(filePath, "utf-8");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // Create a map to store tag names and their corresponding vector indices
  const tagMap = new Map<string, number>();
  let index = 0; // Use the position in the file as the index

  // Process each line as a separate JSON object
  for await (const line of rl) {
    try {
      const tagInfo: TagInfo = JSON.parse(line);
      tagMap.set(tagInfo.tag.toLowerCase(), index);
      index++;
    } catch (error) {
      console.error("Error parsing tag data:", error);
    }
  }
  return tagMap;
}

/**
 * Loads the movie dataset, including metadata and tag vectors.
 * And return a dictionary of movies, where the key is the movie ID and the value is the Movie object.
 */
export async function loadDataset(): Promise<MovieDictionary> {
  const movies: MovieDictionary = {};
  let tagMap: Map<string, number>;

  try {
    // Load the tag map
    tagMap = await loadTagMap();

    // Read the metadata.json file line by line
    const filePath = path.resolve(__dirname, MOVIES);
    const fileStream = fs.createReadStream(filePath, "utf-8");
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Process each line as a separate JSON object
    for await (const line of rl) {
      try {
        const movieData = JSON.parse(line);
        const movieId = movieData.item_id.toString();

        // Add the movie to the dictionary
        movies[movieId] = {
          id: movieId,
          title: movieData.title,
          vector: new Float32Array(VECTOR_SIZE),
        };
      } catch (error) {
        console.error("Error parsing movie data:", error);
      }
    }
    console.log(`Loaded metadata for ${Object.keys(movies).length} movies`);
  } catch (error) {
    console.error("Error loading movie metadata:", error);
    return {};
  }

  // Load tag vectors from the CSV file
  try {
    const fileStream = fs.createReadStream(path.resolve(__dirname, SCORES));
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Flag to skip the header row
    let isHeader = true;
    for await (const line of rl) {
      if (isHeader) {
        isHeader = false;
        continue;
      }

      // Split the line into tag name, movie ID, and relevance score
      const [tagName, itemId, score] = line.split(",");

      // Check if the movie exists in the dictionary
      if (movies[itemId]) {
        const normalizedTag = tagName.toLowerCase();
        const vectorIndex = tagMap.get(normalizedTag);

        // If the tag index is valid, update the movie's vector
        if (vectorIndex !== undefined && vectorIndex < VECTOR_SIZE) {
          movies[itemId].vector[vectorIndex] = parseFloat(score);
        }
      }
    }
    console.log("Loaded tag vectors successfully");
  } catch (error) {
    console.error("Error loading tag vectors:", error);
  }

  return movies;
}
