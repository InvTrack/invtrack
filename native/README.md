# invtrack mobile app README

## Release

#### Format: major.minor.fix

We require all app users to update to the latest version, be it an `expo-update`, or a store update. We achieve this by checking using the `expo-updates` api, as well as calling a little utility edge function that returns the current major.minor version (may change to a config table in the future?).

- we bump the minor number for every new build submitted to stores,
- we bump the fix number for every `expo-updates` update

### TODO list for releases

Use `npm version minor --git-tag-version=false` to bump the package/package-lock.json versions

    1. bump the minor/fix version in: `package.json`, `package-lock.json`, `app.config.js`
    2. bump the ios `buildNumber` in `app.config.js` - equal to the `package.json` version
    3. bump the android `versionCode` in `app.config.js` - M.m.f becomes M0.m0.f
    4. commit to dev, merge dev into staging, test, merge staging into prod. -- TODO cherry-pick flow?

- #### If releasing a minor version

Due to how we have the update check set up right now, we need to schedule updates in App Store Connect/Play Console, and deploy the updated `utilities` edge function accordingly. This is very clunky and will be done properly using `react-native-check-version` in the future.

## Environment

- everything regarding envs for local/build/update is defined in `config/env.js` and `app.config.js`
- be sure to remove any `.env` files you may have before performing an `expo-update`

## Conventions

- when you encounter confilcts in package-lock.json, accept the upstream branch version, resolve conflicts in package.json and run `npm i`,

- explicitly define return type of util/global/exported functions,

- where possible, use our own components instead of direct react-native imports,

## Setup

- make sure to use the node version specified in .nvmrc,

- run `npm i`,

- if running on Windows, make sure to disable autocrlf wizardry, prettier takes care of that `git config --global core.autocrlf false`.

## Usage

- run `npm start`, then choose your desired option from the CLI. Make sure your machine is connected to the same network as the device you want to run the development app on.
