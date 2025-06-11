export interface Command {
  id: string;
  do(): void;
  undo(): void;
}

export interface DrawCommand extends Command {
  shape: "line" | "rect" | "text";
  targetShapeId: string;
}

// export type CommandPayload = {
//   type: "draw" | "undo" | "redo";
//   commandId?: string; // 哪個動作
//   targetId?: string; // 操作的圖形 id（如 line.id）
//   command?: Command; // 若是 draw，附帶原始命令資料
//   userId: string;
// };
