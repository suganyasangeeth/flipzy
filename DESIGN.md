# Flipzy Design System

## Brand Colors (from FLIPZY asset pack SVGs)

| Role | Hex | Usage |
|------|-----|-------|
| Navy | `#071B37` | Wordmark "FLIP", flip arrows, primary text |
| Blue | `#1688F7` / `#35A2FF` | Front card stroke, secondary accents |
| Yellow | `#FFC20A` / `#FFD83D` | Wordmark "ZY", rear card fill, spark |
| White | `#FFFFFF` | Front card fill, card backgrounds |

## Website Color Tokens (tailwind.config.ts)

### Primary (Navy)
```
primary: "#071B37"
on-primary: "#ffffff"
primary-container: "#1A6FEF"
on-primary-container: "#D4E8FF"
primary-fixed: "#D4E8FF"
primary-fixed-dim: "#A3C8FF"
on-primary-fixed: "#001B3E"
on-primary-fixed-variant: "#1454B5"
inverse-primary: "#A3C8FF"
```

### Secondary (Blue)
```
secondary: "#1688F7"
on-secondary: "#ffffff"
secondary-container: "#4DA3FF"
on-secondary-container: "#003A75"
secondary-fixed: "#D4E8FF"
secondary-fixed-dim: "#A3C8FF"
on-secondary-fixed: "#001B3E"
on-secondary-fixed-variant: "#004A8A"
```

### Tertiary (Yellow)
```
tertiary: "#FFC20A"
on-tertiary: "#000000"
tertiary-container: "#FFD54F"
on-tertiary-container: "#3D2E00"
tertiary-fixed: "#FFE082"
tertiary-fixed-dim: "#FFD54F"
on-tertiary-fixed: "#3D2E00"
on-tertiary-fixed-variant: "#6B5200"
```

### Surfaces & Background
```
background: "#F5F0E8"        (warm cream)
on-background: "#071B37"     (navy)
surface: "#F5F0E8"
on-surface: "#071B37"
surface-variant: "#E3DED5"
on-surface-variant: "#494454"
surface-dim: "#DDD8CF"
surface-bright: "#F5F0E8"
surface-container-lowest: "#ffffff"
surface-container-low: "#F5F0E8"
surface-container: "#EDE8DF"
surface-container-high: "#E8E3DA"
surface-container-highest: "#E3DED5"
surface-tint: "#071B37"
```

### Outline
```
outline: "#7b7486"
outline-variant: "#cbc3d7"
```

### Inverse
```
inverse-surface: "#071B37"
inverse-on-surface: "#FFFFFF"
```

### App-Specific Accents
```
accent-space: "#35A2FF"       (info, subtle highlights)
accent-food: "#FFC20A"        (CTA buttons, action highlights)
accent-objects: "#1688F7"     (info badges, reset buttons)
```

### Arcade Theme
```
arcade-surface: "#FFFFFF"     (card backgrounds)
arcade-border: "#E8E3DA"      (card borders)
btn-shadow-primary: "#041225" (button shadow)
```

### Background Gradients
```
background-gradient-start: "#F5F0E8"
background-gradient-end: "#E8E3DA"
```

### Error (unchanged)
```
error: "#ba1a1a"
on-error: "#ffffff"
error-container: "#ffdad6"
on-error-container: "#93000a"
```

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-chunky-primary` | `6px 6px 0px 0px #071B37` | Buttons, interactive press |
| `shadow-chunky-secondary` | `6px 6px 0px 0px #1688F7` | Secondary buttons |
| `shadow-chunky-error` | `6px 6px 0px 0px #ba1a1a` | Error buttons |
| `shadow-card-ambient` | `0 0 20px rgba(0,0,0,0.1)` | Cards (subtle) |
| `shadow-card-ambient-active` | `0 2px 4px -1px rgba(0,0,0,0.1)` | Cards (active) |
| `shadow-arcade-card` | `0 25px 50px -12px rgba(0,0,0,0.15)` | Feature cards |
| `shadow-arcade-ambient` | `0 0 50px rgba(0,0,0,0.1)` | Ambient glow |

**Rule:** Cards use soft `shadow-card-ambient`. Chunky hard-offset `shadow-chunky-primary` is only for buttons/interactive press elements.

## CSS Variables (globals.css)

```css
:root {
  --background: #F5F0E8;
  --foreground: #071B37;
}
```

## Typography

- **Font family:** Baloo 2 (loaded via Google Fonts CSS `@import`)
- **Weights used:** 400, 500, 600, 700, 800

| Token | Size | Line Height | Weight |
|-------|------|-------------|--------|
| `display-hero` | 48px | 56px | 800 |
| `headline-lg` | 32px | 40px | 800 |
| `headline-md` | 24px | 32px | 700 |
| `body-lg` | 20px | 28px | 600 |
| `body-md` | 18px | 26px | 500 |
| `label-caps` | 16px | 24px | 700, letter-spacing 0.05em |

## Spacing

| Token | Value |
|-------|-------|
| `unit` | 8px |
| `gutter` | 16px |
| `container-padding` | 24px |
| `stack-gap` | 20px |
| `card-padding` | 32px |
| `touch-target-min` | 56px |

## Border Radius

| Token | Value |
|-------|-------|
| `sm` | 0.25rem |
| `DEFAULT` | 0.5rem |
| `md` | 0.75rem |
| `lg` | 1rem |
| `xl` | 1.5rem |
| `2xl` | 2rem |
| `full` | 9999px |

## Route Structure

| Route | Page | Role |
|-------|------|------|
| `/` | Login | Parent/teacher login |
| `/home` | Subject Selector | Kid home — grid of subject cards |
| `/profile` | Kid Profile | Avatar, name, email, logout |
| `/subjects/[subjectId]` | Topic Selector | Topic list within a subject |
| `/flashcards/[topicId]` | Flashcard Viewer | 3D flip flashcards |
| `/admin` | Admin Dashboard | Subjects, topics, kids management |
| `/admin/kids` | Kid Accounts List | List of kid accounts |
| `/admin/kids/[id]` | Kid Detail | Edit kid name, email, subject visibility |

## Component Conventions

- **Chunky buttons:** `bg-primary text-on-primary chunky-btn border-4 border-on-primary/20 uppercase font-label-caps`
- **Cards:** `bg-arcade-surface border-2 border-primary rounded-2xl shadow-card-ambient`
- **Active cards:** `hover:-translate-y-1 active:translate-y-0.5 active:shadow-card-ambient-active`
- **Headers:** `h-16 md:h-20 border-b-2 md:border-b-4 border-primary bg-arcade-surface`
- **Input fields:** `border-2 border-outline-variant bg-surface-container-lowest focus:border-primary`
- **Navigation sidebar:** `bg-arcade-surface w-72 border-r-4 border-primary`

## PWA

- `themeColor`: `#071B37` (navy status bar)
- `background_color`: `#F5F0E8` (warm cream, matches app)
- Icons in `public/icons/`, brand assets in `public/brand/`
- Manifest in `public/manifest.json`
