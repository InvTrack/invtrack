### Prerequisites for running e2e tests

Install the `maestro` e2e tool on your system.
Clean the db with `npm run reset-db` in project root.

For Android, have the Android Studio set up and start the app in an emulator in `./native` with `ANDROID_HOME=PATH_TO_ANDROID_SDK npm run expo -- start -a`.

Of course, if testing edge functions, start them too. Remember to run then in test mode to avoid api calls.

### Running the tests

Run with `maestro test flow_name.yaml`

The interactive `maestro studio` can be very helpful.
