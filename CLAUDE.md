# LC Solitaire

A classic Klondike Solitaire game built with plain HTML, CSS, and JavaScript, hosted on GitHub Pages. Features the Lewis & Clark College River Otters mascot as the card back image.

## Project Structure

```
/
├── index.html        # Main HTML file (single page app)
├── style.css         # All styles
├── game.js           # All game logic and UI interaction
└── CLAUDE.md         # This file
```

No build tools, no frameworks, no dependencies. Everything runs directly in the browser.

## Game Rules (Klondike Solitaire)

Source: https://bicyclecards.com/how-to-play/solitaire

### Zones

- **Tableau**: 7 piles forming the main playing area. Built in descending rank, alternating red/black suits.
- **Foundations**: 4 piles (one per suit) built up from Ace to King in suit. Winning condition: all 52 cards in foundations.
- **Stock (Hand) Pile**: Remaining cards after deal. Click to draw 1 card at a time.
- **Waste (Talon) Pile**: Face-up discard area; top card is always playable.

### Deal

- Pile 1: 1 card face-up
- Pile 2: 1 face-down, 1 face-up
- Pile 3: 2 face-down, 1 face-up
- ...continuing to...
- Pile 7: 6 face-down, 1 face-up
- Remaining 24 cards form the stock pile.

### Valid Moves

- **Tableau to Tableau**: Move a face-up card (or a stack of face-up cards) onto a card of the opposite color and next higher rank (e.g., red 7 on black 8).
- **Empty Tableau Column**: Only a King (or a stack led by a King) may fill an empty column.
- **Stock to Waste**: Click stock to flip top card to waste pile. When stock is exhausted, click the empty stock area to recycle the waste pile back into stock (incurs -100 point penalty).
- **Waste/Tableau to Foundation**: Move a card to its foundation pile if it is the next card in sequence for that suit (Ace first, then 2–K in order).
- **Foundation to Tableau**: Allowed but penalized (-15 points).
- **Auto-flip**: When the top card of a tableau pile is face-down and no face-up cards remain above it, flip it automatically (or on click).

### Win Condition

All 52 cards moved to the four foundation piles (Ace through King, by suit).

## Scoring System

Source: https://www.247solitaire.com/news/how-to-get-a-high-score-in-solitaire-advanced-tips-and-tricks/

| Event | Points |
|---|---|
| Tableau card revealed (face-down flipped) | +5 |
| Stock card moved to tableau | +5 |
| Tableau or stock card moved to foundation | +10 |
| Foundation card moved back to tableau | -15 |
| Full recycle of stock pile (waste → stock) | -100 |

- Score never goes below 0.
- **Session score** carries forward across games when "Play Again" is chosen.
- **High score** (session high) is tracked and displayed.

## UI / UX Specification

### Screens

**Start Screen**
- Centered on page, shown on initial load and after "Quit"
- Lewis & Clark branding / color scheme
- Single button: **"Click to Start"**
- Displays session high score if > 0

**Game Screen**
- Full-page game board
- Header bar showing: current score, session high score, elapsed time (MM:SS counting up)
- Tableau (7 columns), foundations (4 piles, top-right area), stock + waste (top-left area)
- "Undo" button (optional stretch goal — reverts last move, no point penalty)

**Game Over / Win Screen** (modal overlay)
- Win: celebratory message
- Show final score and time
- Two buttons:
  - **"Play Again"** — immediately starts a new shuffled game; session score carries forward (new game score starts at 0, session high updated if beaten)
  - **"Quit"** — returns to Start Screen; session score resets

### Card Back

Use the Lewis & Clark River Otters mascot image for all face-down cards:

```
https://www.lclark.edu/live/image/scale/2x/gid/185/width/500/height/418/112053_LC_RiverOtters_Mascot_Outlined_RGB.png
```

Display this as the `background-image` (or `<img>`) on any face-down card element. Scale/fit it to card dimensions (maintain aspect ratio, center it).

### Card Faces

Draw cards entirely with HTML/CSS — no external card image library required. Each card shows:
- Rank (A, 2–10, J, Q, K) in top-left and bottom-right corners
- Suit symbol (♠ ♥ ♦ ♣) centered and in corners
- Hearts/Diamonds (♥ ♦) in LC Orange; Spades/Clubs (♠ ♣) in LC Black

### Interaction

- **Click** stock pile to draw (or recycle when empty)
- **Click** face-down tableau card to flip (when it's the top card)
- **Drag and drop** cards between tableau columns, from waste to tableau/foundation, from tableau to foundation
- **Double-click** a face-up card to auto-move it to a foundation if the move is valid
- Snap animation on drop; shake/reject animation on invalid drop

### Responsiveness

- Playable on desktop at minimum; mobile-friendly layout preferred (cards scale to viewport)
- Minimum supported width: 360px

## Color Palette (Lewis & Clark)

**Primary Colors (Official LC Brand):**
- Primary Orange: `#f47721` (LC official orange - dominant color)
- Primary Black: `#231F20` (LC official black - contrasting color)  
- Primary White: `#FFFFFF` (LC official white - supporting color)

**Secondary Colors (Oregon-inspired):**
- Conifer Green: `#07472E` (background alternative)
- Lost Lake Blue: `#003D5C` (accent color)
- Ocean Blue: `#7ACFCD` (light accent)
- Crema Cream: `#FFEBD9` (warm neutral)
- Mt. Hood Gray: `#9AA39B` (borders/subtle elements)

**Game-Specific Application:**
- Background: `#07472E` (Conifer Green for card table feel)
- Card face: `#FFFFFF` (Primary White)
- Card border: `#9AA39B` (Mt. Hood Gray)
- Text on dark: `#FFFFFF`
- Hearts/Diamonds: `#f47721` (LC Orange instead of traditional red)
- Spades/Clubs: `#231F20` (LC Black)

## Implementation Notes

- All state lives in a plain JS object (`gameState`). No localStorage required unless implementing persistent high scores across sessions (optional enhancement).
- Shuffle using Fisher-Yates algorithm.
- Use CSS `transform: rotate()` for slight card fan effects if desired.
- The stock pile cycles infinitely (with -100 penalty each recycle) until the user wins or quits.
- Auto-detect win: after every move, check if all 4 foundation piles have 13 cards.

## GitHub Pages Deployment

- Repo must be public (or GitHub Pages enabled on private with appropriate plan).
- Enable Pages from repo Settings → Pages → Deploy from branch `main` (or `gh-pages`), root `/`.
- No build step needed — all files are static.
- Canonical URL pattern: `https://<username>.github.io/<repo-name>/`

## Development Workflow

```bash
# Clone and open locally — no install needed
git clone <repo-url>
cd <repo>
open index.html   # or use any local static server

# Recommended: use a simple local server to avoid CORS issues with images
npx serve .
# or
python3 -m http.server 8080
```

## Out of Scope

- Multi-player
- 3-card draw variant (implement 1-card draw only)
- Server-side anything
- User accounts / login
- Animations beyond basic CSS transitions
