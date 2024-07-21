export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

export function dedup(array: any[]) {
  return [...new Set(array)];
}

export function dedupObjArray(array: any[]) {
  return array.filter((item, index) => array.indexOf(item) === index);
}
