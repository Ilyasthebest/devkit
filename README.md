# DevKit

Fast, private, browser-based developer utilities in one place.

[Live Demo](YOUR_VERCEL_URL) • [GitHub](https://github.com/Ilyasthebest/devkit)

## Overview

DevKit is an all-in-one developer workspace designed to streamline daily programming tasks. Instead of switching between different single-purpose websites, DevKit provides essential utilities directly in the browser with an intuitive, unified interface.

All processing occurs entirely on the client side, ensuring sensitive payloads such as tokens, code snippets, and configuration objects stay inside your browser session.

## Features

DevKit includes 14 focused utilities:

1. **JSON Formatter** — Formats, validates, beautifies, and minifies JSON with syntax error detection and hierarchy stats.
2. **Base64 Encoder/Decoder** — Encodes and decodes UTF-8 strings to and from Base64 representation.
3. **UUID Generator** — Generates cryptographically random UUID v4 identifiers in bulk with custom formatting options.
4. **Timestamp Converter** — Converts between Unix epoch timestamps (seconds and milliseconds) and ISO/UTC/local dates.
5. **Color Converter** — Converts between HEX, RGB, and HSL formats with live color preview and contrast analysis.
6. **Regex Tester** — Evaluates regular expressions in real time with syntax match highlights, capture group breakdown, and common presets.
7. **Markdown Previewer** — Edits and renders GitHub-flavored Markdown in real time with sanitized HTML preview and export options.
8. **Lorem Ipsum Generator** — Generates customizable placeholder copy by paragraphs, sentences, or word counts.
9. **JWT Decoder** — Decodes JSON Web Tokens into structured Header and Payload claims with expiration checks.
10. **Hash Generator** — Computes cryptographic hashes (SHA-256, SHA-512, SHA-384, SHA-1) locally using the native Web Crypto API.
11. **URL Encoder/Decoder** — Encodes and decodes URL strings, query parameters, and special characters.
12. **Number Base Converter** — Converts numbers across Binary, Octal, Decimal, and Hexadecimal representations simultaneously with BigInt support.
13. **Cron Expression Generator** — Builds, inspects, and describes standard 5-part POSIX cron schedules with human-readable explanations.
14. **HTTP Status Code Reference** — Searchable reference guide for 1xx, 2xx, 3xx, 4xx, and 5xx HTTP response codes with definitions and common causes.

## Developer Workspace

The workspace includes developer-centric productivity features:

- **Favorites** — Pin frequently used utilities to the top of the homepage and sidebar for fast access.
- **Recently Used Tools** — Automatically tracks and lists recent utilities for quick context switching.
- **Command Palette (`⌘K` / `Ctrl+K`)** — Global keyboard shortcut modal to search and open any utility instantly.
- **Global Search** — Instant fuzzy filtering by tool name, description, and related keywords.
- **Local History** — Saves recent transformations and outputs in the browser with one-click restore.
- **Light, Dark & System Themes** — Seamless theme toggling with preference persistence.
- **Responsive Mobile Layout** — Built and tested for small mobile screens (down to 320px) up to wide desktop monitors.
- **Keyboard Accessibility** — Focus states, keyboard shortcuts, and ARIA dialog roles for accessible interaction.
- **Copy Feedback** — Visual confirmation indicators on all clipboard copy actions.
- **Client-Side Processing** — Immediate feedback without server roundtrips.

## Privacy

- **Client-Side Execution**: All transformations, hashing, and parsing run locally in the browser.
- **No Backend Dependencies**: DevKit does not require an external API server, user accounts, or a database.
- **Local Preferences**: Settings such as theme choice, pinned favorites, and recent history are saved solely in the browser's `localStorage`.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Markdown & Sanitization**: [Marked](https://marked.js.org/) and [DOMPurify](https://github.com/cure53/DOMPurify)
- **Browser APIs**: Web Crypto API (`crypto.subtle`) and Web Storage API (`localStorage`)

## Project Structure

```text
├── public/                 # Static assets and icons
├── src/
│   ├── components/
│   │   ├── common/         # Shared components (CommandPalette, CopyButton, HistoryModal, ToolIcon)
│   │   ├── layout/         # Shell components (Navbar, Sidebar, MobileNav, ToolCard)
│   │   └── tools/          # Implementation of the 14 developer utility components
│   ├── data/
│   │   └── tools.ts        # Tool definitions, categorization, and search keywords
│   ├── utils/              # Helper functions (clipboard, search ranking, localStorage)
│   ├── types.ts            # TypeScript definitions and interfaces
│   ├── App.tsx             # Main layout, router, workspace state, and theme management
│   ├── main.tsx            # Application entry point
│   └── index.css           # Tailwind CSS imports and theme configuration
├── index.html              # HTML shell and early theme script
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ilyasthebest/devkit.git
   cd devkit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal (typically http://localhost:5173).

## Production Build

To build the project for production:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Quality

The project adheres to verified validation and quality standards:

- **TypeScript**: `tsc --noEmit` passes with zero errors.
- **Linting**: `npm run lint` passes with zero errors and warnings.
- **Production Build**: `npm run build` completes successfully.
- **Responsive Testing**: Verified across mobile screen sizes (320px, 375px, 390px, 414px) and desktop resolutions.
- **Accessibility Practices**: Semantic HTML elements, keyboard navigation, focus management, and ARIA dialog properties.

## Screenshots

Screenshots will be added here.

Planned screenshots:
- Homepage
- JSON Formatter
- JWT Decoder
- Hash Generator
- Mobile experience

## Roadmap

Potential improvements for upcoming iterations:

- Additional developer utilities based on common workflow needs.
- Export and import capabilities for saved workspace state and history.
- Customizable keyboard shortcuts.

## License

License: Not currently specified.

## Author

Ilyas Korziti
