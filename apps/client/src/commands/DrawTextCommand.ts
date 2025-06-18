import type { Dispatch, SetStateAction } from "react";
import type { DrawCommand } from "./types";
import { v4 as uuidv4 } from "uuid";
import type { TextInterface } from "../types/TextInterface";

export class DrawTextCommand implements DrawCommand {
  id: string;
  shape: "text";
  targetShapeId: string;
  private text: TextInterface;
  private setTexts: Dispatch<SetStateAction<TextInterface[]>>;

  constructor(
    text: TextInterface,
    setTexts: Dispatch<SetStateAction<TextInterface[]>>
  ) {
    this.text = text;
    this.setTexts = setTexts;

    this.id = uuidv4();
    this.shape = "text";
    this.targetShapeId = text.id;
  }

  do() {
    this.setTexts((prev) => [...prev, this.text]);
  }

  undo() {
    this.setTexts((prev) => prev.filter((text) => text.id !== this.text.id));
  }
}
