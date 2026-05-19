import * as core from "@actions/core"
import { run } from "./main.js"

run().catch((err: unknown) => {
  const message =
    err instanceof Error
      ? err.message
      : err !== null && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err)
  core.setFailed(message)
})
