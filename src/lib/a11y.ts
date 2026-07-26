let idCounter = 0;

export function genId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}
