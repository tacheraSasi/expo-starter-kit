type Origin = { x: number; y: number };

let origin: Origin = { x: 0, y: 0 };

/**
 * Call this from the theme-toggle control right before flipping the theme:
 *   onPress={(e) => {
 *     setThemeTransitionOrigin(e.nativeEvent.pageX, e.nativeEvent.pageY);
 *     toggleTheme();
 *   }}
 */
export function setThemeTransitionOrigin(x: number, y: number) {
  origin = { x, y };
}

export function getThemeTransitionOrigin(): Origin {
  return origin;
}
