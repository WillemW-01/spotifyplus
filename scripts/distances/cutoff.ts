import data from "./all_distances.json";
const Y = data as number[];
const X = data.map((d, i) => i);

// Helper function to calculate the perpendicular distance from a point to a line
function distancePointToLine(
  x: number,
  y: number,
  point1: [number, number],
  point2: [number, number]
): number {
  const numerator = Math.abs(
    (point2[1] - point1[1]) * x -
      (point2[0] - point1[0]) * y +
      point2[0] * point1[1] -
      point2[1] * point1[0]
  );
  const denominator = Math.sqrt(
    Math.pow(point2[1] - point1[1], 2) + Math.pow(point2[0] - point1[0], 2)
  );
  return numerator / denominator;
}

// Function to find the elbow point
function findElbowPoint(x: number[], y: number[]): number {
  // Define start and end points of the curve
  const startPoint: [number, number] = [x[0], y[0]];
  const endPoint: [number, number] = [x[x.length - 1], y[y.length - 1]];

  // Calculate the perpendicular distances for each point
  const distances = x.map((xi, i) => distancePointToLine(xi, y[i], startPoint, endPoint));

  // Find the index of the maximum distance
  const elbowPoint = distances.indexOf(Math.max(...distances));

  return elbowPoint;
}

const elbowIndex = findElbowPoint(X, Y);
console.log(`Elbow Point Index: ${elbowIndex}, X: ${X[elbowIndex]}, Y: ${Y[elbowIndex]}`);
