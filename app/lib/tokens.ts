// lib/tokens.ts — Wash Cycle design tokens

// ── Warm sand palette ──
export const C = {
  bg:        "#FAF4EC",   // page background
  dark:      "#3A2D22",   // primary text / accent
  mid:       "#6A5545",   // secondary text
  muted:     "#8A7060",   // tertiary text / labels
  light:     "#B09A87",   // placeholder / subtle text
  lighter:   "#C8B8A8",   // disabled text
  border:    "#E0CEBC",   // card/input border
  borderSub: "#EDE0D0",   // divider lines
  card:      "rgba(255,252,210,0.52)",   // frosted card surface
  cardDeep:  "rgba(255,250,195,0.70)",   // stronger frosted surface
  sand:      "#F0E8DC",   // button resting bg, status bar bg
  sandDeep:  "#E8D8C4",   // toggle track off, home indicator bar
  accent:    "#3A2D22",   // same as dark — used for emphasis
} as const;

// ── Blue action palette ──
export const BLUE = {
  primary:   "#9DC4E8",   // CTA button bg, selected state
  light:     "#C8E2F5",   // secondary button bg, unselected tab
  text:      "#1C3A52",   // text on blue buttons
  navActive: "#4A8FBF",   // bottom nav active icon + label
  navInactive:"#7AAED4",  // bottom nav inactive
} as const;

// ── Green palette ──
export const GREEN = {
  primary:   "#1B5E20",   // headings, price labels, "Available" badge
} as const;

// ── Mesh background blob palette ──
export const BLOB_PALETTE = [
  "#F2C89A", "#FAE97A", "#F5C4A0",
  "#FDF3B0", "#ECC88A", "#FBF0A0",
];

// ── Button presets ──
export const btnPrimary   = { background: "#9DC4E8", color: "#1C3A52" };
export const btnSecondary = { background: "#C8E2F5", color: "#1C3A52" };
export const btnMuted     = { background: "#C8E2F5", color: "#1C3A52" };
export const btnDisabled  = { background: "#F0E8DC", color: "#C8B8A8" };

// ── Error state ──
export const inputError = {
  border: "1px solid #F5A0A0",
  background: "rgba(255,240,240,0.6)",
};
