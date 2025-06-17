import type { Dispatch, SetStateAction } from "react";
import type { LineInterface } from "../types/LineInterface";
import type { DrawCommand } from "./types";
import { v4 as uuidv4 } from "uuid";

export class DrawLineCommand implements DrawCommand {
  id: string;
  shape: "line";
  targetShapeId: string;
  private line: LineInterface;
  private setLines: Dispatch<SetStateAction<LineInterface[]>>;

  constructor(
    line: LineInterface,
    setLines: Dispatch<SetStateAction<LineInterface[]>>
  ) {
    this.line = line;
    this.setLines = setLines;

    this.id = uuidv4(); // 或 uuidv4() 如果你有用
    this.shape = "line";
    this.targetShapeId = line.id;
  }

  do() {
    this.setLines((prev) => [...prev, this.line]);
  }

  undo() {
    this.setLines((prev) => prev.filter((line) => line.id !== this.line.id));
  }
}
