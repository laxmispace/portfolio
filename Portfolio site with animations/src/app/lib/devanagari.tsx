// Wraps every occurrence of सुकून in a Martel span so the Devanagari word always
// renders in the correct typeface, whatever font the surrounding text uses.
export const MARTEL = { fontFamily: "'Martel', serif", fontWeight: 600 };

export function withMartel(text: string) {
  const parts = text.split("सुकून");
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i < parts.length - 1 ? [part, <span key={i} style={MARTEL}>सुकून</span>] : [part],
  );
}
