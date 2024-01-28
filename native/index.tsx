// @ts-ignore
import { Buffer } from "buffer";
import "react-native-gesture-handler";
// @ts-ignore
global.Buffer = Buffer;

import { registerRootComponent } from "expo";
import App from "./app/App";

registerRootComponent(App);
