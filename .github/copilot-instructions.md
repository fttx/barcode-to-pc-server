# Barcode to PC Server - AI Coding Assistant Guide

## Architecture Overview

This is a **dual-module Electron app** that bridges mobile barcode scanning to desktop keyboard input via WebSocket.

- **`electron/`**: Core server (Node.js/TypeScript) - handles WebSocket connections, native keyboard emulation, native dependencies
- **`ionic/`**: UI layer (Angular 5 + Ionic 3) - runs inside Electron's renderer process, manages settings and scan sessions

**Critical:** The two modules share code via **symlinks created by Gulp** (`gulpfile.ts`):

- `ionic/src/config.ts` → `electron/src/config.ts`
- `ionic/src/models/` → `electron/src/models/ionic/`

Never edit these symlinked files in `electron/src/` - always edit the originals in `ionic/src/`.

## Communication Architecture

Three independent channels operate simultaneously:

1. **WebSocket** (`ws`, port 57891): Mobile app → Electron main process

   - Handled by `electron/src/handlers/*.handler.ts` (connection, scans, settings)
   - Uses request/response models from `ionic/src/models/`

2. **IPC** (inter-process): Electron main ↔ renderer (Ionic UI)

   - Main → Renderer: forwards WebSocket messages via `ipcClient.send()`
   - Renderer → Main: uses `window.preload.ipcRenderer` exposed by `electron/src/preload.ts`

3. **Context Bridge**: Renderer accesses Node.js APIs
   - `preload.ts` exposes native modules (fs, dialog, electron-store) to renderer via `contextBridge`
   - Ionic pages access via `ElectronProvider` which wraps `window.preload.*`

## Development Workflow

### Setup & Running

```bash
# Setup (MUST use Node v14.17)
nvm use 14.17
cd electron
npm install  # Auto-runs postinstall: gulp prepare (symlinks, ionic deps)
npm start    # Runs: gulp start (parallel: tsc --watch, electron, ionic serve)
```

**Key behaviors:**

- Changes in `electron/src/` require restarting server (F6 in VS Code)
- Changes in `ionic/src/` hot-reload automatically (served on port 8200)
- First `npm install` automatically installs `ionic/node_modules` if missing

### Building & Release

```bash
npm run build    # Builds Angular prod + compiles TS + electron-builder
npm run publish  # Same + uploads to GitHub releases (requires GH_TOKEN)
```

Build outputs to `electron/dist/`. Windows builds include offline installer ZIP.

## Critical Patterns

### Handler Singleton Pattern

All handlers (`connection.handler.ts`, `scans.handler.ts`, etc.) follow this pattern:

```typescript
export class ScansHandler implements Handler {
  private static instance: ScansHandler;
  private ipcClient; // Set via setIpcClient() after pageLoad

  private constructor(settingsHandler, uiHandler) {}

  static getInstance(deps) {
    if (!ScansHandler.instance) {
      ScansHandler.instance = new ScansHandler(deps);
    }
    return ScansHandler.instance;
  }

  async onWsMessage(ws, message, req): Promise<any> {
    // MUST return message parameter
  }
}
```

**Critical:** `onWsMessage()` must return the incoming `message` parameter for handler chaining in `main.ts`.

### Request/Response Models

- All WebSocket/IPC messages extend `requestModel` or `responseModel` (from `ionic/src/models/`)
- Use static `ACTION_*` constants for message types
- Models have `fromObject()` for deserialization
- Example: `requestModelHelo`, `responseModelPutScanAck`

### Platform-Specific Code

Check `process.platform` for OS-specific behavior:

- `'darwin'` = macOS (special handling for menu bar, dock, accessibility)
- `'win32'` = Windows (firewall, second-instance handling)
- Linux = neither of above

macOS requires accessibility permissions for keyboard emulation (check `systemPreferences.isTrustedAccessibilityClient()`).

## Native Dependencies

### @nut-tree/nut-js (Keyboard Emulation)

**Critical:** Loaded dynamically with fallback because not all platforms are supported:

```typescript
let keyboard, Key;
try {
  const nutjs = require("@nut-tree/nut-js");
  keyboard = nutjs.keyboard;
  Key = nutjs.Key;
} catch (error) {
  // Show downgrade message after 60s
}
```

Never use `import` for nut-tree - use dynamic require pattern. If `keyboard` is undefined, show user v3.18.1 downgrade option.

### Other Native Deps

- `@homebridge/ciao` - mDNS/Bonjour server announcement
- `electron-store` - persistent settings (accessed via IPC in renderer)
- `node-machine-id` - hardware ID for licensing

## File Associations & Deep Links

- `.btpt` files: Barcode to PC Output Templates (custom file format)

  - Icons: `electron/build/btpt.icns` (macOS), `btpt.ico` (Windows)
  - Handled via `open-file` event (macOS) or second-instance (Windows)

- `btplink://` protocol: Deep linking for auth flows
  - Defined in `electron/package.json` build config

## Important Constraints

1. **Node Version**: Must use v14.17 (not newer) - native dependencies break on newer versions
2. **TypeScript Compilation**:
   - Electron: compiles to `bin/` (not `dist/`)
   - Ionic: uses `@ionic/app-scripts` (Angular 5 tooling)
3. **Testing**: Tests configured but minimal (`ionic/test-config/`, uses Karma/Protractor)
4. **Sass Errors**: If build fails, run `cd ../ionic && npm rebuild node-sass --force`

## Common Tasks

### Adding New WebSocket Message Type

1. Define model in `ionic/src/models/request.model.ts` or `response.model.ts`
2. Add `ACTION_*` constant to base class
3. Handle in appropriate handler's `onWsMessage()`
4. Update Ionic page to listen via `electronProvider.ipcRenderer.on(ACTION_*, ...)`

### Accessing Settings

Settings are managed by `SettingsHandler` (singleton) which wraps `electron-store`:

- Main process: `settingsHandler.outputProfiles`, `settingsHandler.openAutomatically`, etc.
- Renderer: `window.preload.store.get(key)` / `.set(key, value)`

### Platform-Specific Builds

- macOS: Builds for both arm64 + x64, requires notarization (`notarize.js`)
- Windows: Creates installer + portable + offline ZIP
- Set `GH_TOKEN` environment variable for publishing
- CI uses AppVeyor (see `appveyor.yml`)

## URLs & Configuration

All URLs centralized in `Config` class (shared between modules):

- Port: 57891 (WebSocket), 57892 (OAuth HTTP)
- License server: `license.barcodetopc.com`
- Documentation: `docs.barcodetopc.com`

Never hardcode URLs - always use `Config.URL_*` constants.

## Internationalization & Translations

The UI supports multiple languages via JSON translation files in `ionic/src/assets/i18n/`.

**Critical Translation Rules:**

1. **Always translate to ALL languages** when adding or modifying UI text. Never translate just one language.

2. **Supported languages:**

   - `ar.json` - Arabic
   - `de.json` - German
   - `en.json` - English
   - `es.json` - Spanish
   - `it.json` - Italian
   - `pt.json` - Portuguese
   - `tr.json` - Turkish
   - `tw.json` - Traditional Chinese

3. **Maintain consistent key placement:** When adding new translation keys, insert them in the **exact same position** within each language file to keep files synchronized and easier to maintain.

4. **Workflow for UI translations:**
   - Identify the translation key needed (e.g., `"NEW_FEATURE_TITLE"`)
   - Add the key-value pair in English first (`en.json`)
   - Translate and add the same key in the exact same file position in all other 7 language files
   - Verify the JSON syntax is valid in all files

**Example:** If adding a new button label after line 42 in `en.json`, add the corresponding translations after line 42 in all other language files.

## Writing the CHANGELOG.md

As main rule keep it simple and keep in mind it is for the final end-user, not for developers.

- use the same style as odler changes
- use the same verb tense as older changes
- keep the messages short
- group related changes together and don't repeat (eg. if is a change don't put in to the fix section)
- don't ever mention iOS or Android
- don't mention licensing stuff
- don't leak any sensitive information or internal code changes that are related to commercial features
- update talso the URL references in the md file
