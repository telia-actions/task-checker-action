import * as core from "@actions/core";
import { run } from "./main.js";

try {
  await run();
} catch (err: unknown) {
  let message: string;
  if (err instanceof Error) {
    message = err.message;
  } else if (err !== null && typeof err === "object" && "message" in err) {
    message = String(err.message);
  } else {
    message = String(err);
  }
  core.setFailed(message);
}
