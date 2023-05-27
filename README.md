# invtrack README

## Backend

You need `supabase-cli` to run this project.

To start, make sure docker is running, and run `supabase start` to run backend locally.

These are the credentials for a basic worker account:
email: adam@example.com
password: aaaaaa

## Introduction

this project uwu 🥰

## Conventions

- Use emojis in commit messages 😎😇🥶 or else the commit will bounce,

- when you encounter confilcts in package-lock.json, accept the upstream branch version, resolve conflicts in package.json and run `npm i`,

- NO DEFAULT EXPORTS, use named exports only e.g. `export const foo = () => undefined`, the only exception is when exporting a route component,

- explicitly define return type of util/global/exported functions,

- `useStyles` hook at the bottom of the file,

- import \* as React in every `.tsx` file,

- where possible, use our own components instead of direct react-native imports,

- for routing, always use absolute paths.

## Setup

- make sure to use the node version specified in .nvmrc,

- run `npm i`,

- if running on Windows, make sure to set `git config --global core.autocrlf true`.

## Usage

- run `npm start`, then choose your desired option from the CLI. Make sure your machine is connected to the same network as the device you want to run the development app on.
