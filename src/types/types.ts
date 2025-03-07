// Global types definitions
interface Movie {
  id: string;
  title: string;
  vector: Float32Array; // Memory Optimisation
  norm?: number; // Pre-computation for cosine similarity
}

type MovieDictionary = Record<string, Movie>;

interface KdTreeNode {
  movie: Movie;
  axis: number;
  left?: KdTreeNode;
  right?: KdTreeNode;
}

interface TagInfo {
  tag: string;
  id: number;
}

export { Movie, MovieDictionary, KdTreeNode, TagInfo };
