/**
 * Normaliza un texto eliminando acentos (diacríticos) y convirtiéndolo a minúsculas.
 * Útil para realizar búsquedas o comparaciones insensibles a mayúsculas y acentos.
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
