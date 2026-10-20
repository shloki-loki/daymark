import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Sun,
  Layers,
  BookOpen,
  Check,
  Plus,
  ArrowUpRight,
  X,
  ChevronRight,
  CalendarDays,
  Search,
  LogOut,
  Flag,
  Database,
  Briefcase,
  Book,
  Code,
  ChartNoAxesCombined,
  MessagesSquare,
  PanelLeft,
  Leaf,
} from "lucide-react";
import {
  progress,
  status,
  starterTasks,
  today,
  toggleMilestone,
} from "./model";
import { cloud, loadRecords, saveRecord } from "./cloud";
import "./style.css";
const icons = [
  Database,
  Briefcase,
  Book,
  Code,
  ChartNoAxesCombined,
  MessagesSquare,
];
function App() {
  const [session, setSession] = useState(null),
    [demo, setDemo] = useState(false),
    [records, setRecords] = useState([]),
    [view, setView] = useState("Today"),
    [selected, setSelected] = useState(null),
    [modal, setModal] = useState(false),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(!!cloud),
    [email, setEmail] = useState(""),
    [sent, setSent] = useState(false),
    [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (!cloud) return;
    cloud.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data } = cloud.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  async function refresh() {
    try {
      setError("");
      setLoading(true);
      setRecords(await loadRecords());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!session || demo) return;
    refresh();
    const handler = () => refresh();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [session?.user.id, demo]);
  function enterDemo() {
    setDemo(true);
    setRecords(
      starterTasks().map((payload) => ({
        id: payload.id,
        kind: "task",
        payload,
      })),
    );
    setError("");
  }
  async function persist(kind, payload) {
    setBusy(true);
    setError("");
    try {
      const old = records.find((r) => r.id === payload.id);
      const record = { id: payload.id, kind, payload, version: old?.version };
      const saved = demo ? record : await saveRecord(record, session.user.id);
      setRecords((prev) => [...prev.filter((r) => r.id !== saved.id), saved]);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const tasks = records
      .filter((r) => r.kind === "task")
      .map((r) => r.payload)
      .sort((a, b) => a.created.localeCompare(b.created)),
    logs = records
      .filter((r) => r.kind === "log")
      .map((r) => r.payload)
      .sort((a, b) => b.created.localeCompare(a.created)),
    active = tasks.filter((t) => !t.archived),
    task = tasks.find((t) => t.id === selected),
    doneToday = logs.filter((l) => l.date === today()),
    completed = active.filter((t) => progress(t) === 100);
  async function seed() {
    setBusy(true);
    try {
      const created = [];
      for (const payload of starterTasks()) {
        created.push(
          await saveRecord(
            { id: payload.id, kind: "task", payload },
            session.user.id,
          ),
        );
      }
      setRecords((prev) => [...prev, ...created]);
    } catch (e) {
      setError(e.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  const visible = active
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .filter((t) =>
      view === "Today"
        ? t.focus && progress(t) < 100
        : view === "Completed"
          ? progress(t) === 100
          : progress(t) < 100,
    );
  if (!session && !demo)
    return (
      <div className="welcome">
        <div className="brand">
          <span className="brandmark">
            <Check size={22} />
          </span>
          daymark<span className="beta">PERSONAL WORKSPACE</span>
        </div>
        <div className="welcome-grid">
          <section>
            <span className="eyebrow">ONE DAY AT A TIME</span>
            <h1>
              A little progress.
              <br />A clearer mind.
            </h1>
            <p>
              A calm home for the things you’re doing,
              <br />
              and the person you’re becoming.
            </p>
            <div className="welcome-features">
              <span>
                <Check />
                Make space for today
              </span>
              <span>
                <Check />
                See your progress grow
              </span>
              <span>
                <Check />
                Keep what you learn
              </span>
            </div>
          </section>
          <section className="login-card">
            <Leaf className="green" />
            <h2>Your next chapter starts here.</h2>
            <p>
              Sign in to keep your work and learning together, across devices.
            </p>
            {cloud ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError("");
                  const { error } = await cloud.auth.signInWithOtp({
                    email,
                    options: {
                      emailRedirectTo: location.origin,
                      shouldCreateUser: false,
                    },
                  });
                  setBusy(false);
                  if (error) setError(error.message);
                  else setSent(true);
                }}
              >
                <label>
                  Email address
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <button className="primary full" disabled={busy || loading}>
                  {busy ? "Sending…" : "Email me a sign-in link"}{" "}
                  <ArrowUpRight size={16} />
                </button>
                {sent && (
                  <p role="status">Check your inbox for your sign-in link.</p>
                )}
              </form>
            ) : (
              <div className="setup-note">
                Private sign-in is being connected. You can explore the
                interactive preview below.
              </div>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="text-button full" onClick={enterDemo}>
              Explore a demo <ArrowUpRight size={15} />
            </button>
            <small>
              The demo resets when you leave. Your personal workspace stays
              private.
            </small>
          </section>
        </div>
        <footer>Less noise. More forward.</footer>
      </div>
    );
  return (
    <div className="app">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <div className="brand">
          <span className="brandmark">
            <Check size={20} />
          </span>
          daymark
          <button
            className="mobile-only icon"
            aria-label="Close menu"
            onClick={() => setMobile(false)}
          >
            <X />
          </button>
        </div>
        <button className="add-button" onClick={() => setModal(true)}>
          <Plus size={18} /> Add a task
        </button>
        <nav>
          {[
            [Sun, "Today"],
            [Layers, "All work"],
            [BookOpen, "Journal"],
            [Check, "Completed"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={view === label ? "active" : ""}
              onClick={() => {
                setView(label);
                setMobile(false);
              }}
            >
              <Icon size={18} />
              {label}
              {label === "Today" && (
                <span className="nav-count">
                  {active.filter((t) => t.focus && progress(t) < 100).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="side-label">YOUR WORKSTREAMS</div>
        <div className="workstreams">
          {active
            .filter((t) => t.type === "continuous")
            .map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelected(t.id);
                  setMobile(false);
                }}
              >
                <i className={"dot color" + t.color} />
                <span>{t.title}</span>
              </button>
            ))}
        </div>
        <div className="sidebar-bottom">
          <div className="quote">
            Small steps count.
            <br />
            <span>Keep showing up.</span>
          </div>
          <button
            className="account"
            onClick={async () => {
              if (demo) {
                setDemo(false);
                setRecords([]);
              } else {
                await cloud.auth.signOut();
                setRecords([]);
              }
              setSelected(null);
            }}
          >
            <span className="avatar">
              {demo ? "D" : session.user.email[0].toUpperCase()}
            </span>
            <span>
              {demo ? "Demo workspace" : "My workspace"}
              <small>
                {demo ? "Changes are temporary" : "Private account"}
              </small>
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <button
            className="mobile-only icon"
            aria-label="Open menu"
            onClick={() => setMobile(true)}
          >
            <PanelLeft />
          </button>
          <span>
            My workspace <ChevronRight size={14} /> {view}
          </span>
          <span className="sync">
            <i />
            {demo
              ? "Demo · not saved"
              : loading
                ? "Syncing…"
                : busy
                  ? "Saving…"
                  : "Cloud workspace"}
          </span>
        </header>
        {demo && (
          <div className="demo-banner">
            You’re exploring a demo. Changes aren’t saved to an account.
            <button
              onClick={() => {
                setDemo(false);
                setSelected(null);
                setRecords([]);
              }}
            >
              Exit demo
            </button>
          </div>
        )}
        <div className="page">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {new Date()
                  .toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                  .toUpperCase()}
              </div>
              <h1>
                {view === "Today"
                  ? "Make today count."
                  : view === "All work"
                    ? "The bigger picture."
                    : view === "Journal"
                      ? "Keep what you learn."
                      : "Look how far you’ve come."}
              </h1>
              <p>
                {view === "Today"
                  ? "A little focus. A little learning. A step forward."
                  : view === "Journal"
                    ? "Your work and reflections, one day at a time."
                    : "Every small step is part of something bigger."}
              </p>
            </div>
            <button className="primary" onClick={() => setModal(true)}>
              <Plus size={17} /> New task
            </button>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
              <button onClick={refresh}>Refresh</button>
            </div>
          )}
          <div className="stats">
            <div>
              <span>In focus</span>
              <strong>
                {active.filter((t) => t.focus && progress(t) < 100).length}
                <small>workstreams & tasks</small>
              </strong>
            </div>
            <div>
              <span>Updates today</span>
              <strong>
                {doneToday.length}
                <small>moments of progress</small>
              </strong>
            </div>
            <div>
              <span>Completed</span>
              <strong>
                {completed.length}
                <small>things you’ve finished</small>
              </strong>
            </div>
          </div>
          {view === "Journal" ? (
            <section className="journal">
              {!logs.length ? (
                <Empty
                  title="Your story starts with an update."
                  text="Open a workstream and record what you did or learned."
                />
              ) : (
                logs.map((l) => (
                  <article key={l.id}>
                    <div className="eyebrow">
                      {l.date} ·{" "}
                      {tasks.find((t) => t.id === l.taskId)?.title ||
                        "Workstream"}
                    </div>
                    {l.completed && (
                      <>
                        <h3>What I completed</h3>
                        <p>{l.completed}</p>
                      </>
                    )}
                    {l.learned && (
                      <>
                        <h3>What I learned</h3>
                        <p>{l.learned}</p>
                      </>
                    )}
                  </article>
                ))
              )}
            </section>
          ) : (
            <>
              <div className="list-heading">
                <h2>
                  {view === "Today"
                    ? "Your focus for today"
                    : view === "Completed"
                      ? "Finished work"
                      : "Your work"}{" "}
                  <span>{visible.length}</span>
                </h2>
                <label className="search">
                  <Search size={16} />
                  <input
                    aria-label="Search tasks"
                    placeholder="Find a task…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              {visible.length === 0 ? (
                <Empty
                  title={
                    loading
                      ? "Loading your workspace…"
                      : query
                        ? "No matching tasks."
                        : view === "Completed"
                          ? "Good things take a few steps."
                          : "Make room for your next step."
                  }
                  text={
                    view === "Completed"
                      ? "Finished tasks will appear here."
                      : "Add a task, or choose workstreams from All work to focus on today."
                  }
                />
              ) : (
                <div className="task-list">
                  {visible.map((t) => {
                    const Icon = icons[t.color % 6] || Flag;
                    return (
                      <article className="task-row" key={t.id}>
                        <div className={"task-symbol color" + t.color}>
                          {t.type === "once" ? (
                            <button
                              className={
                                "checkbox " + (t.done ? "checked" : "")
                              }
                              aria-label={"Complete " + t.title}
                              disabled={busy}
                              onClick={() =>
                                persist("task", { ...t, done: !t.done })
                              }
                            >
                              {t.done && <Check size={13} />}
                            </button>
                          ) : (
                            <Icon size={20} />
                          )}
                        </div>
                        <button
                          className="task-main"
                          onClick={() => setSelected(t.id)}
                        >
                          <div className="task-title">
                            {t.title}
                            <span
                              className={
                                "status " +
                                (status(t) === "In progress" ? "started" : "")
                              }
                            >
                              {status(t)}
                            </span>
                          </div>
                          <p>{t.description || "One small step forward."}</p>
                          {t.type === "continuous" && (
                            <div className="progress-line">
                              <div
                                className="progress-track"
                                role="progressbar"
                                aria-label={t.title + " progress"}
                                aria-valuenow={progress(t)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div style={{ width: progress(t) + "%" }} />
                              </div>
                              <span>{progress(t)}%</span>
                              <small>
                                {t.milestones.filter((m) => m.done).length}/
                                {t.milestones.length} milestones
                              </small>
                            </div>
                          )}
                          {t.due && (
                            <small
                              className={
                                t.due < today() && progress(t) < 100
                                  ? "overdue"
                                  : "due"
                              }
                            >
                              <CalendarDays size={12} />{" "}
                              {t.due < today() && progress(t) < 100
                                ? "Overdue · "
                                : ""}
                              {t.due}
                            </small>
                          )}
                        </button>
                        <button
                          className="row-arrow icon"
                          aria-label={"Open " + t.title}
                          onClick={() => setSelected(t.id)}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
              <button className="add-inline" onClick={() => setModal(true)}>
                <Plus size={17} /> Add something to work on
              </button>
              {!tasks.length && !loading && !demo && (
                <button className="secondary" disabled={busy} onClick={seed}>
                  Set up my six workstreams
                </button>
              )}
            </>
          )}
          <div className="gentle-note">
            <Leaf size={16} /> Progress doesn’t have to be big to be real.
          </div>
        </div>
      </main>
      {task && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <Detail
            key={task.id}
            task={task}
            logs={logs.filter((l) => l.taskId === task.id)}
            busy={busy}
            persist={persist}
            close={() => setSelected(null)}
          />
        </div>
      )}
      {modal && (
        <NewTask
          busy={busy}
          close={() => setModal(false)}
          save={async (t) => {
            if (await persist("task", t)) setModal(false);
          }}
        />
      )}
    </div>
  );
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <Sun size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Detail({ task: t, logs, busy, persist, close }) {
  const [learned, setLearned] = useState(""),
    [completed, setCompleted] = useState(""),
    [milestone, setMilestone] = useState(""),
    [title, setTitle] = useState(t.title),
    [description, setDescription] = useState(t.description),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <section
      className="detail"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <div className="detail-top">
        <span className="eyebrow">
          {t.type === "once" ? "ONE-TIME TASK" : "CONTINUOUS WORKSTREAM"}
        </span>
        <button
          className="icon"
          aria-label="Close details"
          onClick={close}
          autoFocus
        >
          <X />
        </button>
      </div>
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      <div className="detail-progress">
        <strong>
          {progress(t)}% <span>complete</span>
        </strong>
        <div className="progress-track">
          <div style={{ width: progress(t) + "%" }} />
        </div>
      </div>
      <div className="detail-options">
        <label>
          <input
            type="checkbox"
            checked={t.focus}
            disabled={busy}
            onChange={(e) => persist("task", { ...t, focus: e.target.checked })}
          />{" "}
          In today’s focus
        </label>
        <label>
          Due{" "}
          <input
            aria-label="Due date"
            type="date"
            value={t.due}
            disabled={busy}
            onChange={(e) => persist("task", { ...t, due: e.target.value })}
          />
        </label>
      </div>
      {t.type === "once" ? (
        <button
          className="secondary full"
          disabled={busy}
          onClick={() => persist("task", { ...t, done: !t.done })}
        >
          <Check size={16} />
          {t.done ? "Reopen task" : "Mark completed"}
        </button>
      ) : (
        <>
          <h3>
            Milestones{" "}
            <span>
              {t.milestones.filter((m) => m.done).length} of{" "}
              {t.milestones.length}
            </span>
          </h3>
          <p className="hint">
            Suggested starting points. Adjust these to fit your goal.
          </p>
          <div className="milestones">
            {t.milestones.map((m) => (
              <div key={m.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={m.done}
                    disabled={busy}
                    onChange={() => persist("task", toggleMilestone(t, m.id))}
                  />
                  <span className={m.done ? "strike" : ""}>{m.text}</span>
                </label>
                <button
                  className="icon"
                  aria-label={"Remove milestone " + m.text}
                  disabled={busy}
                  onClick={() =>
                    persist("task", {
                      ...t,
                      milestones: t.milestones.filter((x) => x.id !== m.id),
                    })
                  }
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <form
            className="milestone-add"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                milestone.trim() &&
                (await persist("task", {
                  ...t,
                  milestones: [
                    ...t.milestones,
                    {
                      id: crypto.randomUUID(),
                      text: milestone.trim(),
                      done: false,
                    },
                  ],
                }))
              )
                setMilestone("");
            }}
          >
            <input
              aria-label="New milestone"
              placeholder="Add a milestone…"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              maxLength={200}
            />
            <button
              className="icon"
              aria-label="Add milestone"
              disabled={busy || !milestone.trim()}
            >
              <Plus size={18} />
            </button>
          </form>
          {status(t) === "Not started" && (
            <button
              className="text-button"
              disabled={busy}
              onClick={() => persist("task", { ...t, started: true })}
            >
              Mark as started
            </button>
          )}
        </>
      )}
      <form
        className="update-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!learned.trim() && !completed.trim()) return;
          if (
            await persist("log", {
              id: crypto.randomUUID(),
              taskId: t.id,
              date: today(),
              created: new Date().toISOString(),
              learned: learned.trim(),
              completed: completed.trim(),
            })
          ) {
            setLearned("");
            setCompleted("");
            setSaved(true);
            if (!t.started) await persist("task", { ...t, started: true });
          }
        }}
      >
        <h3>A little reflection</h3>
        <label>
          What did you complete?
          <textarea
            placeholder="A query solved, a chapter read, an application sent…"
            value={completed}
            onChange={(e) => {
              setCompleted(e.target.value);
              setSaved(false);
            }}
            maxLength={4000}
          />
        </label>
        <label>
          What did you learn?
          <textarea
            placeholder="An insight worth keeping…"
            value={learned}
            onChange={(e) => {
              setLearned(e.target.value);
              setSaved(false);
            }}
            maxLength={4000}
          />
        </label>
        <button
          className="primary full"
          disabled={busy || (!learned.trim() && !completed.trim())}
        >
          Save today’s update <ArrowUpRight size={16} />
        </button>
        {saved && (
          <small role="status" className="green">
            Update recorded.
          </small>
        )}
      </form>
      {logs.length > 0 && (
        <div className="detail-history">
          <h3>Previous updates</h3>
          {logs.map((l) => (
            <article key={l.id}>
              <small>{l.date}</small>
              {l.completed && (
                <p>
                  <b>Completed:</b> {l.completed}
                </p>
              )}
              {l.learned && (
                <p>
                  <b>Learned:</b> {l.learned}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      <details>
        <summary>Edit task details</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim())
              persist("task", { ...t, title: title.trim(), description });
          }}
        >
          <label>
            Name
            <input
              required
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button className="secondary" disabled={busy}>
            Save changes
          </button>
        </form>
      </details>
    </section>
  );
}
function NewTask({ close, save, busy }) {
  const [type, setType] = useState("continuous");
  return (
    <div className="overlay">
      <section
        className="new-task"
        role="dialog"
        aria-modal="true"
        aria-label="New task"
      >
        <div className="detail-top">
          <h2>A new step forward.</h2>
          <button className="icon" aria-label="Cancel new task" onClick={close}>
            <X />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (!f.get("title").trim()) return;
            save({
              id: crypto.randomUUID(),
              title: f.get("title").trim(),
              description: f.get("description").trim(),
              type,
              done: false,
              started: false,
              focus: true,
              due: f.get("due"),
              color: 0,
              created: new Date().toISOString(),
              milestones:
                type === "continuous"
                  ? f
                      .get("milestones")
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((text) => ({
                        id: crypto.randomUUID(),
                        text,
                        done: false,
                      }))
                  : [],
            });
          }}
        >
          <div className="type-switch">
            <button
              type="button"
              className={type === "continuous" ? "chosen" : ""}
              onClick={() => setType("continuous")}
            >
              <Layers size={17} /> Continuous
            </button>
            <button
              type="button"
              className={type === "once" ? "chosen" : ""}
              onClick={() => setType("once")}
            >
              <Check size={17} /> One-time
            </button>
          </div>
          <label>
            Task name
            <input
              autoFocus
              name="title"
              required
              maxLength={100}
              placeholder="What would you like to work on?"
            />
          </label>
          <label>
            Description <span>optional</span>
            <input
              name="description"
              maxLength={500}
              placeholder="Give this task a little context"
            />
          </label>
          {type === "continuous" && (
            <label>
              Milestones <span>one per line</span>
              <textarea
                name="milestones"
                placeholder={
                  "Define the goal\nTake the first step\nReview what I learned"
                }
                maxLength={5000}
              />
            </label>
          )}
          <label>
            Due date <span>optional</span>
            <input name="due" type="date" />
          </label>
          <button className="primary full" disabled={busy}>
            {busy ? "Saving…" : "Add to my focus"}
            <Plus size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
