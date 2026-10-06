# Theming

Semantic tokens live in `constants/Colors.ts` (`light` + `dark`, WCAG-AA text
in light mode). `context/ThemeProvider.tsx` resolves the effective scheme
from `stores/settings.ts` (`themeMode: light | dark | system`) + the OS setting.

## Usage

Every screen/component follows this pattern:

```tsx
import { createStyles, useCurrentTheme } from "@/context/CentralTheme";

const useStyles = createStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.background },
  title: { color: theme.text, fontSize: 18 },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border, // borders, never box shadows
  },
}));

function MyScreen() {
  const styles = useStyles();
  const theme = useCurrentTheme();
  ...
}
```

- `useCurrentTheme()` flattens every token plus `statusBarStyle` and
  backward-compat aliases (`subtleText`, `mutedText`, `cardBackground`).
- `createStyles` memoizes the `StyleSheet` per color scheme.
- Drop-in primitives: `components/Themed.tsx`
  (`ThemedText/View/Card/Divider/ScrollView`), `ThemedSwitch.tsx`.
- `ThemeStatusBar` in the root layout keeps the status bar in sync.
- Settings screen exposes light/dark/system and persists the choice.
