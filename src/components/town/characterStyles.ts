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
};

export type CharacterName = keyof typeof characterStyles;
