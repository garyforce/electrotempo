const palette = ["#05C2CC", "#FDBE02", "#EE6C4D", "#6CC551", "#454372"];

export function getPaletteColor(index: number) {
  return palette[index % palette.length];
}
