export const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const progress = (task) =>
  task.type === "once"
    ? task.done
      ? 100
      : 0
    : task.milestones.length
      ? Math.round(
          (100 * task.milestones.filter((m) => m.done).length) /
            task.milestones.length,
        )
      : 0;
export const status = (task) =>
  progress(task) === 100
    ? "Completed"
    : task.started || task.milestones.some((m) => m.done)
      ? "In progress"
      : "Not started";
export function starterTasks() {
  return [
    [
      "SQL learning",
      "Build confidence, one query at a time.",
      [
        "SELECT, WHERE and sorting",
        "Aggregations and GROUP BY",
        "JOINs across tables",
        "Subqueries and CTEs",
        "Window functions",
        "Solve a practical SQL case",
      ],
    ],
    [
      "Applying for jobs",
      "Make your next opportunity happen.",
      [
        "Choose target roles",
        "Update resume and portfolio",
        "Shortlist 10 relevant openings",
        "Send tailored applications",
        "Follow up and review responses",
      ],
    ],
    [
      "Reading books",
      "Make room for a few good pages.",
      [
        "Choose a book and reading goal",
        "Read the first quarter",
        "Reach the halfway point",
        "Finish the book",
        "Write down key takeaways",
      ],
    ],
    [
      "Grok bot",
      "Build a tool for collecting Twitter content.",
      [
        "Define scope and permitted data access",
        "Build a small proof of concept",
        "Implement collection",
        "Test and handle failures",
        "Document and ship",
      ],
    ],
    [
      "Business case studies",
      "Turn a messy problem into a clear decision.",
      [
        "Choose a case",
        "Frame the problem",
        "Analyze evidence and options",
        "Develop a recommendation",
        "Review feedback and lessons",
      ],
    ],
    [
      "Interview preparations",
      "Practice telling your story with clarity.",
      [
        "Map role requirements",
        "Prepare experience stories",
        "Practice product questions",
        "Practice analytical questions",
        "Complete a mock interview",
      ],
    ],
  ].map(([title, description, items], i) => ({
    id: crypto.randomUUID(),
    title,
    description,
    type: "continuous",
    done: false,
    started: false,
    focus: true,
    due: "",
    created: new Date().toISOString(),
    milestones: items.map((text) => ({
      id: crypto.randomUUID(),
      text,
      done: false,
    })),
    color: i % 6,
  }));
}
export function toggleMilestone(task, id) {
  const milestones = task.milestones.map((m) =>
    m.id === id ? { ...m, done: !m.done } : m,
  );
  return { ...task, milestones, started: true };
}
