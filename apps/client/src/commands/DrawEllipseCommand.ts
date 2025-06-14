import type { Dispatch, SetStateAction } from "react";
import type { DrawCommand } from "./types";
import { v4 as uuidv4 } from "uuid";
import type { EllipseInterface } from "../types/EllipseInterface";

export class DrawEllipseCommand implements DrawCommand {
  id: string;
  shape: "ellipse";
  targetShapeId: string;
  private ellipse: EllipseInterface;
  private setEllipses: Dispatch<SetStateAction<EllipseInterface[]>>;

  constructor(
    ellipse: EllipseInterface,
    setEllipses: Dispatch<SetStateAction<EllipseInterface[]>>
  ) {
    this.ellipse = ellipse;
    this.setEllipses = setEllipses;

    this.id = uuidv4();
    this.shape = "ellipse";
    this.targetShapeId = ellipse.id;
  }

  do() {
    this.setEllipses((prev) => [...prev, this.ellipse]);
  }

  undo() {
    this.setEllipses((prev) =>
      prev.filter((ellipse) => ellipse.id !== ellipse.id)
    );
  }
}
