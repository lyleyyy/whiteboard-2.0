function rectParametersCalculator(
  rectRaw: { x: number; y: number },
  newCoord: { x: number; y: number }
) {
  return {
    width: Math.abs(newCoord.x - rectRaw.x),
    height: Math.abs(newCoord.y - rectRaw.y),
  };
}

export default rectParametersCalculator;
