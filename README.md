# Movie Recommendation API

This project is a **movie recommendation system** built using Node.js, Express, and TypeScript. It leverages a **vector database** to find movies similar to a given query based on their **tag genomes**. The system is optimized for fast queries (<100ms) and efficient memory usage.

---

## 🚀 Features

- **Search for similar movies**: Find movies similar to a given title using cosine similarity.
- **Custom k-d tree**: A custom implementation of a k-d tree for efficient nearest-neighbor search.
- **Optimized for high dimensionality**: Uses cosine similarity for better performance in 1094-dimensional space.

---

## 📦 Installation

1. **Clone the repository**

```bash
   git clone https://github.com/mehdi-moujahed/movie-recommendation-api.git
   cd movie-recommendation-api

```

2. **Install dependecies**

```bash
 npm install
  # or
  yarn install

```

3. **Download the dataset**

- Download the [Tag Genome dataset](https://files.grouplens.org/datasets/tag-genome-2021/genome_2021.zip)
- Extract the files into the dataset folder:

```bash
movie-recommendation-api/
├── dataset/
│   ├── raw/
│   │   ├── movies.json
│   │   ├── tags.json
│   ├── scores/
│   │   ├── tagdl.csv

```

Documentation can be found here: : [ Dataset Documentation](https://files.grouplens.org/datasets/tag-genome-2021/genome_2021_readme.txt)

4. **Build and run the project**

```bash
npm run build
npm start
```

The API will start at http://localhost:3000.

## 🛠️ Usage

Search for Similar Movies
To find movies similar to a given title, use the /api/search endpoint:

```bash
GET /api/search?query=Inception&limit=5
```

## Example Request

```bash
curl "http://localhost:3000/api/search?query=Inception&limit=5"
```

## Parameters

| Parameters       |                                                       |
| ---------------- | :---------------------------------------------------: |
| query            |   The movie title to search for (case-insensitive).   |
| limit (optional) | The maximum number of results to return (default: 10) |
