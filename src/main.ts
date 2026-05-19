import * as core from "@actions/core"
import * as github from "@actions/github"
import { parseTasks } from "./parser.js"

export async function run(): Promise<void> {
  // 1. Only run on pull_request and pull_request_review events
  const eventName = github.context.eventName
  if (eventName !== "pull_request" && eventName !== "pull_request_review") {
    core.warning(`This action is designed for pull_request events. Skipping (event: ${eventName}).`)
    return
  }

  // 2. Read PR body
  const body = github.context.payload?.pull_request?.body ?? ""

  // 3. Parse tasks and log warnings for any malformed tasks
  const result = parseTasks(body, (msg) => core.warning(msg))

  // 4. Fail or succeed
  if (!result.allDone) {
    const pendingList = result.tasks
      .filter((t) => t.status === "pending")
      .map((t) => `  - ${t.text}`)
      .join("\n")
    core.setFailed(`PR has ${result.pendingCount} unchecked task(s):\n${pendingList}`)
  }
}
