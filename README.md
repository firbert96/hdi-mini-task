# hdi-mini-task

An Angular 21 application built with Angular Material. This code of project is mostly develop by AI assistant (github copilot with claude model) with careful attention to detail and some manual adjustments by own hand.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| [Node.js](https://nodejs.org/) | **v18** (LTS) | Developed and tested on v24 |
| npm | **v9** | Developed on v11.9; bundled with Node |
| Angular CLI | **v21** | Install globally (see below) |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

---

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hdi-mini-task
   ```

2. **Install the Angular CLI globally** *(skip if already installed)*

   ```bash
   npm install -g @angular/cli
   ```

3. **Install project dependencies**

   ```bash
   npm install
   ```

---

## Running the app locally

```bash
npm start
```

This runs `ng serve`. Once compiled, open your browser at:

```
http://localhost:4200
```

The app hot-reloads automatically when you save source files.

---

## Building for production

```bash
npm run build
```

Output is written to `dist/hdi-mini-task/`.

---

## Running tests

```bash
npm test
```

This executes the unit test suite via [Vitest](https://vitest.dev/) (configured with `@angular/build`).

---

## Assumptions & tradeoffs

- **Angular Material M3 theme** — The project uses the new Material Design 3 (`mat.theme()`) API introduced in Angular Material v17+. The built-in M3 color palettes (`violet` / `rose`) are used as the closest equivalents to the classic indigo/pink scheme; legacy M2 palettes (`$indigo-palette`, etc.) are not available in M3.
- **`provideAnimationsAsync()`** — Animations are lazy-loaded to keep the initial bundle smaller. If a component requires synchronous animations on first render, `provideAnimations()` from `@angular/platform-browser/animations` can be substituted.
- **No backend / API** — This is a pure front-end project; no server or database setup is required.
- **`packageManager` field** — `package.json` pins `npm@11.9.0` via the `packageManager` field (corepack). If your environment uses a different npm version, either enable corepack (`corepack enable`) or remove the field before installing.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
