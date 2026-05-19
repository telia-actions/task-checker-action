import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@actions/core", () => ({
  warning: vi.fn(),
  setFailed: vi.fn(),
  getInput: vi.fn().mockReturnValue(""),
  info: vi.fn(),
  debug: vi.fn(),
}))

const mockContext = vi.hoisted(() => ({
  eventName: "pull_request",
  payload: {
    pull_request: {
      body: "",
    },
  },
}))

vi.mock("@actions/github", () => ({
  context: mockContext,
}))

import * as core from "@actions/core"
import { run } from "../main.js"

describe("run", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockContext.eventName = "pull_request"
    mockContext.payload = { pull_request: { body: "" } }
  })

  it("non-PR event calls core.warning and returns without failing", async () => {
    mockContext.eventName = "push"

    await run()

    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining("push"))
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it("PR with no unchecked tasks does not call setFailed", async () => {
    // empty body
    await run()
    expect(core.setFailed).not.toHaveBeenCalled()

    vi.clearAllMocks()

    // all checked
    mockContext.payload = { pull_request: { body: "- [x] Task A\n- [x] Task B" } }
    await run()
    expect(core.setFailed).not.toHaveBeenCalled()

    vi.clearAllMocks()

    // pull_request_review event
    mockContext.eventName = "pull_request_review"
    await run()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it("PR with unchecked tasks calls setFailed with task text", async () => {
    mockContext.payload = {
      pull_request: { body: "- [x] Task A\n- [ ] Task B\n- [ ] Task C" },
    }

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining("Task B"))
  })

  it("not-applicable sub-item skips parent task", async () => {
    mockContext.payload = {
      pull_request: { body: "- [ ] Task A\n  - [ ] Not applicable" },
    }

    await run()

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it("ignore blocks: closed block excludes tasks; unclosed block triggers warning", async () => {
    // closed ignore block
    mockContext.payload = {
      pull_request: {
        body: "<!-- ignore-task-list-start -->\n- [ ] Ignored\n<!-- ignore-task-list-end -->\n- [x] Real",
      },
    }
    await run()
    expect(core.setFailed).not.toHaveBeenCalled()

    vi.clearAllMocks()

    // unclosed ignore block
    mockContext.payload = {
      pull_request: { body: "<!-- ignore-task-list-start -->\n- [ ] Never ends" },
    }
    await run()
    expect(core.warning).toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })
})
