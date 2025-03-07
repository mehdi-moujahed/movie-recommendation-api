import express from "express";
import { z } from "zod";
import { VectorDatabase } from "./db/vectorDB";
import { loadDataset } from "./db/dataLoader";

const app = express();
app.use(express.json());

// Asynchronous data loading
let vectorDB: VectorDatabase;

/**
 * Initializes the server by loading the dataset and building the vector database.
 */
async function initializeServer() {
  try {
    const movies = await loadDataset();
    console.log(`Dataset loaded with ${Object.keys(movies).length} movies`);
    vectorDB = new VectorDatabase(movies); // Initialize the vector database
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

// Request validation schema using Zod
const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});

// Search endpoint
app.get("/api/search", async (req: express.Request, res: any) => {
  // Validate the request query parameters
  const validation = searchSchema.safeParse(req.query);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.issues });
  }

  const { query, limit } = validation.data;

  // Find the movie that matches the query
  const movie = Object.values(vectorDB["movies"]).find((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  // If no movie is found, return a 404 error
  if (!movie) {
    console.log(`No movie found for query: ${query}`);
    return res.status(404).json({ error: "Movie not found" });
  }

  // Search for the k-nearest neighbors of the query movie
  const results = vectorDB.searchKNN(movie, limit);

  // Return the results with titles and similarity scores
  res.json(
    results.map((m) => ({
      title: m.title,
      similarity: vectorDB.cosineSimilarity(movie, m),
    }))
  );
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start the server
initializeServer().then(() => {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});
