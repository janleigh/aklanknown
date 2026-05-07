# aklanknown

This is an Expo project configured to use Bun for local development workflows.

## Prerequisites

- Install Bun: follow the installer at https://bun.sh
- Have Git installed to clone the repo

## Clone

```bash
git clone https://github.com/janleigh/aklanknown.git
cd aklanknown
```

## Install dependencies

Use Bun to install dependencies (faster installs than npm/yarn):

```bash
bun install
```

## Run the app

- Start the Expo dev server using Bun:

```bash
bunx expo start
```

- To open the web build:

```bash
bunx expo start --web
```

- For Android or iOS simulators, run the dev server above and follow the Expo CLI prompts.

## Scripts

Use Bun to run package scripts, for example:

```bash
bun run ios
bun run android
```

Replace `npm`/`npx` with `bun`/`bunx` in the examples throughout this repository to prefer Bun where appropriate.

## Learn more

- Expo docs: https://docs.expo.dev/
- Bun docs: https://bun.sh/docs

