import { Movie, MovieDictionary, KdTreeNode } from "../types";

/**
 * A vector database for efficient nearest-neighbor search using a custom k-d tree.
 */
export class VectorDatabase {
  private kdTree: KdTreeNode | undefined;

  /**
   * Initializes the vector database with a dictionary of movies.
   * Precomputes vector norms and builds the k-d tree index.
   */
  constructor(private movies: MovieDictionary) {
    this.precomputeNorms();
    this.buildIndex();
  }

  /**
   * Precomputes the norm (magnitude) of each movie's vector.
   * The norm is used in cosine similarity calculations.
   */
  private precomputeNorms() {
    Object.values(this.movies).forEach((movie) => {
      let sum = 0;
      for (const val of movie.vector) sum += val ** 2;
      movie.norm = Math.sqrt(sum) || 1e-10;
    });
  }

  /**
   * Builds the k-d tree index for efficient nearest-neighbor search.
   */
  private buildIndex() {
    this.kdTree = this.buildKdTree(Object.values(this.movies));
  }

  /**
   * Recursively builds a k-d tree from a list of movies.
   * And returns The root node of the k-d tree.
   */
  private buildKdTree(
    movies: Movie[],
    depth: number = 0
  ): KdTreeNode | undefined {
    if (movies.length === 0) return undefined; // Base case: empty list

    const axis = depth % movies[0].vector.length; // Cycle through dimensions
    const sorted = [...movies].sort((a, b) => a.vector[axis] - b.vector[axis]); // Sort by current axis
    const medianIndex = Math.floor(sorted.length / 2); // Find the median

    // Create a k-d tree node
    return {
      movie: sorted[medianIndex],
      axis,
      left: this.buildKdTree(sorted.slice(0, medianIndex), depth + 1),
      right: this.buildKdTree(sorted.slice(medianIndex + 1), depth + 1),
    };
  }

  /**
   * Searches for the k nearest neighbors of a query movie.
   * And returns a list of the k nearest movies, sorted by similarity.
   */
  public searchKNN(query: Movie, k: number = 10): Movie[] {
    const results: Movie[] = [];
    this.searchNode(query, k, this.kdTree, results);
    return results
      .sort(
        (a, b) =>
          this.cosineSimilarity(query, b) - this.cosineSimilarity(query, a)
      )
      .slice(0, k);
  }

  /**
   * Recursively searches the k-d tree for the k nearest neighbors.
   */
  private searchNode(
    query: Movie,
    k: number,
    node?: KdTreeNode,
    results: Movie[] = []
  ) {
    if (!node) return;

    results.push(node.movie);

    // If we have too many results, keep only the top k
    if (results.length > k * 2) {
      results
        .sort(
          (a, b) =>
            this.cosineSimilarity(query, b) - this.cosineSimilarity(query, a)
        )
        .splice(k);
    }

    const axis = node.axis; // Current splitting axis
    const diff = query.vector[axis] - node.movie.vector[axis]; // Difference along the axis

    // Search the closer subtree first
    let nextBranch = diff < 0 ? node.left : node.right;
    let otherBranch = diff < 0 ? node.right : node.left;

    this.searchNode(query, k, nextBranch, results); // Search the closer branch

    // Only search the other branch if it's within a reasonable distance
    if (
      Math.abs(diff) < (results[results.length - 1]?.vector[axis] ?? Infinity)
    ) {
      this.searchNode(query, k, otherBranch, results);
    }
  }

  /**
   * Computes the cosine similarity between two movies.
   * And returns the cosine similarity.
   */
  public cosineSimilarity(a: Movie, b: Movie): number {
    if (!a.norm || !b.norm) {
      return 0;
    }

    let dot = 0;
    for (let i = 0; i < a.vector.length; i++) {
      dot += a.vector[i] * b.vector[i];
    }

    return dot / (a.norm * b.norm);
  }
}
