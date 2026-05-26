import { describe, expect, it, vi } from "vitest";
import { parseTasks } from "../parser.js";

describe("parseTasks", () => {
  it("empty body returns empty tasks, pendingCount 0, and allDone true", () => {
    const result = parseTasks("");
    expect(result.tasks).toEqual([]);
    expect(result.pendingCount).toBe(0);
    expect(result.allDone).toBe(true);
  });

  it("parses checked ([x]/[X]) and unchecked tasks including * bullets", () => {
    const result = parseTasks(
      "- [x] Done\n- [X] Also done\n- [ ] Pending\n* [x] Star",
    );
    expect(result.tasks).toEqual([
      { text: "Done", status: "checked" },
      { text: "Also done", status: "checked" },
      { text: "Pending", status: "pending" },
      { text: "Star", status: "checked" },
    ]);
    expect(result.pendingCount).toBe(1);
    expect(result.allDone).toBe(false);
  });

  it("not-applicable sub-item: ignores pending task (case-insensitive), leaves checked unchanged, requires adjacency", () => {
    expect(
      parseTasks("- [ ] Task\n  - [ ] Not applicable").tasks[0].status,
    ).toBe("ignored");
    expect(
      parseTasks("- [ ] Task\n  - [ ] NOT APPLICABLE").tasks[0].status,
    ).toBe("ignored");
    expect(
      parseTasks("- [x] Task\n  - [ ] Not applicable").tasks[0].status,
    ).toBe("checked");
    expect(
      parseTasks("- [ ] Task\n\n  - [ ] Not applicable").tasks[0].status,
    ).toBe("pending");
  });

  it("ignore blocks exclude contained tasks; multiple blocks and tasks outside are handled correctly", () => {
    const body =
      "- [x] Before\n<!-- ignore-task-list-start -->\n- [ ] Hidden\n<!-- ignore-task-list-end -->\n- [ ] After\n<!-- ignore-task-list-start -->\n- [ ] Also hidden\n<!-- ignore-task-list-end -->";
    const result = parseTasks(body);
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0]).toEqual({ text: "Before", status: "checked" });
    expect(result.tasks[1]).toEqual({ text: "After", status: "pending" });
  });

  it("unclosed ignore block strips rest of body and calls onWarning", () => {
    const onWarning = vi.fn();
    const result = parseTasks(
      "- [x] Before\n<!-- ignore-task-list-start -->\n- [ ] Stripped",
      onWarning,
    );
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].text).toBe("Before");
    expect(onWarning).toHaveBeenCalledOnce();
    expect(onWarning).toHaveBeenCalledWith(
      "Unclosed ignore-task-list-start block found; ignoring rest of PR body",
    );
  });

  it("allDone is true only when all tasks are checked or ignored, false otherwise", () => {
    const pending = parseTasks("- [x] Done\n- [ ] Not done");
    expect(pending.allDone).toBe(false);
    expect(pending.pendingCount).toBe(1);

    const allResolved = parseTasks(
      "- [x] Done\n- [ ] Skipped\n  - [ ] Not applicable",
    );
    expect(allResolved.allDone).toBe(true);
    expect(allResolved.pendingCount).toBe(0);
  });
});
