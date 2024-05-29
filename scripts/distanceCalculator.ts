import fs from "fs";
import path from "path";

const genresFilePath = path.resolve(__dirname, "reduced-genres.json");
const genresFileContent = fs.readFileSync(genresFilePath, "utf8");
const genres: Genre[] = JSON.parse(genresFileContent);

interface Genre {
  genre: string;
  size: number;
  top: number;
  left: number;
}

interface Coords {
  top: number;
  left: number;
}

const getDist = (first: Coords, second: Coords) => {
  return Math.sqrt(
    Math.pow(first.top - second.top, 2) + Math.pow(first.left - second.left, 2)
  );
};

const getCoords = (genre: Genre) => {
  return {
    top: genre.top,
    left: genre.left,
  };
};

const getNearest = (index: number, k: number) => {
  const distances = genres.map((g) => {
    return {
      genre: g.genre,
      distance: getDist(getCoords(g), getCoords(genres[index])),
    };
  });

  distances.sort((a, b) => a.distance - b.distance);
  // distances.forEach((d, idx) => idx < 100 && console.log(d));
  const nearest = distances.slice(1, k + 1);

  return nearest.map((d) => d.genre);
};

const calculateNearest = (index: number) => {
  const currGenre = genres[index].genre;
  console.log(`Getting nearest 5 for genre: `, currGenre);
  const nearest = getNearest(index, 5);
  const formatted = `{"${currGenre}": ${JSON.stringify(nearest)}},`;
  fs.appendFileSync("results.json", formatted);
  console.log(nearest);
};

const calculateAll = () => {
  fs.appendFileSync("results.json", "[");
  genres.forEach((g, index) => calculateNearest(index));
  fs.appendFileSync("results.json", "]");
};

calculateAll();

export default genres;
