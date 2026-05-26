export type TaskStatus = "checked" | "pending" | "ignored";

export interface Task {
  text: string;
  status: TaskStatus;
}

export interface ParseResult {
  tasks: Task[];
  pendingCount: number;
  allDone: boolean;
}

const IGNORE_START = "<!-- ignore-task-list-start -->";
const IGNORE_BLOCK_RE =
  /<!-- ignore-task-list-start -->[\s\S]*?<!-- ignore-task-list-end -->/g;
const NOT_APPLICABLE_RE = /^\s+[-*]\s+\[[ xX]\]\s+not applicable\s*$/i;

function stripIgnoreBlocks(
  body: string,
  onWarning?: (msg: string) => void,
): string {
  // Remove all closed ignore blocks in one pass
  let result = body.replace(IGNORE_BLOCK_RE, "");

  // Handle unclosed block
  const unclosedStart = result.indexOf(IGNORE_START);
  if (unclosedStart !== -1) {
    onWarning?.(
      "Unclosed ignore-task-list-start block found; ignoring rest of PR body",
    );
    result = result.slice(0, unclosedStart);
  }

  return result;
}

export function parseTasks(
  body: string,
  onWarning?: (msg: string) => void,
): ParseResult {
  const stripped = stripIgnoreBlocks(body, onWarning);
  const lines = stripped.split("\n").map((line) => line.replace(/\r$/, ""));

  const tasks: Task[] = [];
  let pendingCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = /^[-*] \[([xX ])\] (.+)$/.exec(lines[i]);
    if (!match) continue;

    const checked = match[1] !== " ";
    const text = match[2].trim();
    if (text.length === 0) continue;
    const nextLine = lines[i + 1];

    let status: TaskStatus;
    if (checked) {
      status = "checked";
    } else if (nextLine !== undefined && NOT_APPLICABLE_RE.test(nextLine)) {
      status = "ignored";
    } else {
      status = "pending";
    }

    if (status === "pending") pendingCount++;
    tasks.push({ text, status });
  }

  return { tasks, pendingCount, allDone: pendingCount === 0 };
}
