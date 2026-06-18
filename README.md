# MyPortfolio

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.5.

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

## Chat implementation & environment configuration

This project includes a WebSocket-based chat client used by the UI to communicate with a backend chat server (see `src/app/services/gemini-ai.ts`). The client expects a WebSocket endpoint to be provided via the Angular environment configuration.

- **Client service:** `src/app/services/gemini-ai.ts` exposes a `GeminiAi` injectable with methods:
	- `connect()` — opens a WebSocket connection to the configured endpoint (`environment.WS_ENDPOINT + 'chat'`).
	- `sendMessage(payload)` — sends a JSON payload over the socket.
	- `message$` — Observable stream of messages and events from the server.

- **Environment variable:** set `WS_ENDPOINT` in your environment files. Example values are in `src/environments/`:

	- `src/environments/environment.development.ts` (development):

	```ts
	export const environment = {
		WS_ENDPOINT: 'ws://localhost:3000/api/'
	};
	```

	- `src/environments/environment.ts` (production):

	```ts
	export const environment = {
		WS_ENDPOINT: '<your-domain-endpoint-url>'
	};
	```

- The client constructs the full chat URL by appending `chat` to `WS_ENDPOINT`. For example, with the default development value the client connects to `ws://localhost:3000/api/chat`.

- If you run the backend locally, ensure your chat server listens for WebSocket connections at the configured path and supports the message JSON schema used by the client.

Quick start:

1. Set the correct `WS_ENDPOINT` in `src/environments/environment.development.ts` for local development.
2. Start the backend chat server (example: Node/Express + ws or similar) so it serves WS at `${WS_ENDPOINT}chat`.
3. Run the Angular dev server:

```bash
ng serve
```

The UI will connect automatically when components call the `GeminiAi.connect()` method.
