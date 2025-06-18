import { useState } from "react";
import type { RectInterface } from "../types/RectInterface";
import type { RectRawInterface } from "../types/RectRawInterface";

function useSelectingBox() {
  const [rectRaw, setRectRaw] = useState<RectRawInterface | null>(null);
  const [selectingRect, setSelectingRect] = useState<RectInterface | null>(
    null
  );

  return { rectRaw, setRectRaw, selectingRect, setSelectingRect };
}

export default useSelectingBox;
