import { build, watch, serve } from "./src/ssgo.ts";

build().then(watch);
