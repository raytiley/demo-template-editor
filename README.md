# Template Editor Demo

A React-based visual template editor prototype for digital signage content. This is a standalone demo extracted from the Carousel digital signage platform.

## Live Demo

Visit the live demo at: https://raytiley.github.io/demo-template-editor/

## Features

- **Visual Canvas Editor**: Drag, resize, and position content blocks on a template canvas
- **Property Panel**: Edit block properties including text styling, colors, shadows, and more
- **Mock Data Mode**: Test the editor with built-in sample templates
- **API Connection Mode**: Connect to a live CablecastCG server to load real templates and bulletins
- **Server-Side Rendering**: Blocks are rendered server-side for accurate preview
- **Responsive Design**: Works on desktop and tablet devices
- **Keyboard Navigation**: Full keyboard support for accessibility

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173/demo-template-editor/

### Build

```bash
npm run build
```

Output is in the `dist` folder.

## Architecture

- **React 18** with TypeScript
- **Vite** for development and building
- **Zustand** for state management
- **CSS Modules** for styling

### Key Components

- `Editor` - Main editor layout with toolbar, canvas, and property panel
- `Canvas` - Visual template canvas with block rendering and interactions
- `PropertyPanel` - Block property editing interface
- `DemoToolbar` - Mode switching between mock data and API connection

### Services

- `apiService` - Handles API communication with CablecastCG servers
- `renderService` - Builds render URLs for server-side block rendering
- `messageService` - PostMessage communication with parent Ember app

## Connecting to a Server

In API mode, you can connect to any CablecastCG server:

1. Click "API" in the demo toolbar
2. Enter the server URL (e.g., `https://your-server.cablecast.tv/CablecastCGAPI`)
3. Enter credentials
4. Click Connect
5. Browse and load templates or bulletins

Note: The dev server includes a proxy to handle CORS. In production on GitHub Pages, the API connection mode won't work due to CORS restrictions - use mock data mode instead.

## License

Proprietary - Tightrope Media Systems
