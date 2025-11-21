export const characterStyles: Record<
  string,
  {
    backgroundColor: string;
    textColor: "black" | "white";
    position: "left" | "right";
  }
> = {
  maddy: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "left",
  },
  milo: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "right",
  },
  luna: {
    backgroundColor: "rgb(10, 91, 131)",
    textColor: "white",
    position: "left",
  },
  skye: {
    backgroundColor: "rgb(241, 244, 220)",
    textColor: "black",
    position: "right",
  },
  sunny: {
    backgroundColor: "rgb(105, 210, 231)",
    textColor: "black",
    position: "left",
  },
  tali: {
    backgroundColor: "rgb(189, 175, 218)",
    textColor: "black",
    position: "left",
  },
};

export type CharacterName = keyof typeof characterStyles;

export function getCharacterStyle(name: string) {
  const key = name.toLowerCase();
  return characterStyles[key] ?? defaultStyle;
}

export const defaultStyle = {
  backgroundColor: "rgb(248, 248, 247)",
  textColor: "black" as const,
  position: "left" as const,
};
