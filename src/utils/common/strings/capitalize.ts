export default function capitalize(str: string): string {
  return str
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    })
    .join(" ");
}
