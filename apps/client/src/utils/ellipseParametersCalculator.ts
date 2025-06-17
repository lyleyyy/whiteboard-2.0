function ellipseParametersCalculator(
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number }
) {
  const x = startPoint.x + (endPoint.x - startPoint.x) / 2;
  const y = startPoint.y + (endPoint.y - startPoint.y) / 2;
  const radiusX = Math.abs(startPoint.x - x);
  const radiusY = Math.abs(startPoint.y - y);

  return { x, y, radiusX, radiusY };
}

export default ellipseParametersCalculator;
