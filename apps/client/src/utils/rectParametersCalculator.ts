function rectParametersCalculator(
  rectRaw: { x: number; y: number },
  newCoord: { x: number; y: number }
) {
  return {
    width: newCoord.x - rectRaw.x,
    height: newCoord.y - rectRaw.y,
  };
}

export default rectParametersCalculator;
