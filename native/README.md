# invtrack README

## Introduction

this project uwu 🥰

## Conventions

- Use emojis in commit messages 😎😇🥶 or else the commit will bounce,

- when you encounter confilcts in package-lock.json, accept the upstream branch version, resolve conflicts in package.json and run `npm i`,
<!-- this should be enforced via a linter -->
- NO DEFAULT EXPORTS, use named exports only e.g. `export const foo = () => undefined`,

- explicitly define return type of util/global/exported functions,

- `useStyles` hook at the bottom of the file,
<!-- this should be enforced via a linter, or even not -->
- import \* as React in every `.tsx` file,

- where possible, use our own components instead of direct react-native imports,

## Setup

- make sure to use the node version specified in .nvmrc,

- run `npm i`,

- if running on Windows, make sure to disable autocrlf wizardry, prettier takes care of that `git config --global core.autocrlf false`.

## Usage

- run `npm start`, then choose your desired option from the CLI. Make sure your machine is connected to the same network as the device you want to run the development app on.
