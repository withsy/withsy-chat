export function capitalizeFirstLetter(string: string | null) {
  if (!string) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}
