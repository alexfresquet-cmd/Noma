# Noma v0.14 — HTTPS test build

Static build prepared for GitHub Pages.

## Goal
Validate **Pronounce** on Android Chrome using direct Web Speech recognition over HTTPS. There is no Gboard/dictation fallback.

## Data
Noma remains local-first. Progress is stored in the browser localStorage for this prototype. Export a backup from the previous local-file build and import it after opening the GitHub Pages URL because browser storage is isolated by origin.

## GitHub Pages
Publish the repository root from the `main` branch.