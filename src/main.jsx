import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { START, END, today, countdown, months, upsertNote, daysBetween, prettyDate } from "./model";
import "./style.css";

// Everything lives in this browser's localStorage; Export/Import is the backup.
const KEY = "daymark:v1";
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return { goals: data?.goals ?? [], notes: data?.notes ?? [] };
  } catch {
    return { goals: [], notes: [] };
  }
}

const dayNumber = (date) => daysBetween(START, date) + 1;
const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

function App() {
  const [data, setData] = useState(load);
  const [now, setNow] = useState(today);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [data]);

  // Roll over to the next day if the tab stays open past midnight IST.
  useEffect(() => {
    const t = setInterval(() => setNow(today()), 60000);
    return () => clearInterval(t);
  }, []);

  const { total, day, left } = countdown(now);
  const setGoals = (goals) => setData((d) => ({ ...d, goals }));
  const saveNote = (date, text) => setData((d) => ({ ...d, notes: upsertNote(d.notes, date, text) }));

  return (
    <main className="page">
      <header className="top">
        <span className="wordmark">daymark</span>
        <Backup data={data} onImport={setData} />
      </header>

      <section className="hero" aria-labelledby="count">
        <p className="eyebrow">1 Nov 2026 → 31 Dec 2027</p>
        <h1 id="count">
          <span className="big">{left}</span> days left
        </h1>
        <p className="sub">
          Day <b>{day}</b> of {total} · {((100 * day) / total).toFixed(1)}% of the journey behind you
        </p>
        <Dots now={now} notes={data.notes} />
      </section>

      <Goals goals={data.goals} setGoals={setGoals} />
      <Journal now={now} notes={data.notes} saveNote={saveNote} />

      {saveError && <p className="warn">Couldn’t save in this browser (private window or storage blocked). Export a backup before closing.</p>}
      <footer className="foot">Saved in this browser only. Use Export to keep a backup or move to another device.</footer>
    </main>
  );
}

function Dots({ now, notes }) {
  const written = new Set(notes.map((n) => n.date));
  return (
    <div className="dots" role="img" aria-label={`${countdown(now).day} days filled, ${countdown(now).left} days left`}>
      {months().map((m) => (
        <div className="month" key={m.key}>
          <span className="mlabel">{prettyDate(m.key + "-01", { month: "short", year: "2-digit" })}</span>
          <div className="row">
            {m.days.map((d) => (
              <span
                key={d}
                className={`dot ${d < now ? "past" : d === now ? "today" : ""} ${written.has(d) ? "noted" : ""}`}
                title={`${prettyDate(d)} · Day ${dayNumber(d)}${written.has(d) ? " · note written" : ""}`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="legend">
        <span><i className="dot past" /> lived</span>
        <span><i className="dot today" /> today</span>
        <span><i className="dot" /> ahead</span>
        <span><i className="dot past noted" /> has a note</span>
      </div>
    </div>
  );
}

function Goals({ goals, setGoals }) {
  const [text, setText] = useState("");
  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setGoals([...goals, { id: uid(), text: text.trim(), done: false }]);
    setText("");
  };
  const update = (id, patch) => setGoals(goals.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  return (
    <section className="card" aria-labelledby="goals-h">
      <h2 id="goals-h">Goals for this run</h2>
      {goals.length === 0 && <p className="empty">What should be true by 31 Dec 2027? Add your first goal.</p>}
      <ul className="goals">
        {goals.map((g) => (
          <li key={g.id} className={g.done ? "done" : ""}>
            <input type="checkbox" checked={g.done} onChange={() => update(g.id, { done: !g.done })} aria-label={`Mark “${g.text}” done`} />
            <input
              className="gtext"
              defaultValue={g.text}
              aria-label="Goal"
              onBlur={(e) => (e.target.value.trim() ? update(g.id, { text: e.target.value.trim() }) : (e.target.value = g.text))}
              onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
            />
            <button className="ghost" onClick={() => confirm(`Remove “${g.text}”?`) && setGoals(goals.filter((x) => x.id !== g.id))} aria-label="Remove goal">
              ×
            </button>
          </li>
        ))}
      </ul>
      <form className="addgoal" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a goal…" aria-label="New goal" />
        <button disabled={!text.trim()}>Add</button>
      </form>
    </section>
  );
}

function Journal({ now, notes, saveNote }) {
  const [date, setDate] = useState(now);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(null);
  useEffect(() => setDate(now), [now]);
  const exists = notes.some((n) => n.date === date);
  const inRange = date >= START && date <= END;

  const submit = () => {
    if (!text.trim()) return;
    if (exists && !confirm(`${prettyDate(date)} already has a note. Replace it?`)) return;
    saveNote(date, text);
    setText("");
    setDate(now);
  };

  return (
    <section className="card" aria-labelledby="journal-h">
      <h2 id="journal-h">Journal</h2>
      <div className="notebar">
        <div className="nbhead">
          <label className="when">
            <span>{prettyDate(date)}</span>
            {inRange && <em>Day {dayNumber(date)}</em>}
            <input type="date" value={date} min={START} max={now} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Note date" />
          </label>
          {date !== now && <button className="ghost small" onClick={() => setDate(now)}>Back to today</button>}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={exists ? "This day already has a note below. Writing here will replace it." : "What moved today?"}
          rows={3}
          aria-label="Note"
        />
        <div className="nbfoot">
          <span className="hint">Enter to save · Shift+Enter for a new line</span>
          <button onClick={submit} disabled={!text.trim()}>{exists ? "Replace note" : "Save note"}</button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="empty">Your notes will stack here, newest first, one per day.</p>
      ) : (
        <ol className="entries">
          {notes.map((n) => (
            <li key={n.date}>
              <div className="ehead">
                <time dateTime={n.date}>{prettyDate(n.date)}</time>
                <span className="dayno">Day {dayNumber(n.date)}</span>
                {editing !== n.date && (
                  <span className="eactions">
                    <button className="ghost small" onClick={() => setEditing(n.date)}>Edit</button>
                    <button className="ghost small" onClick={() => confirm(`Delete the note for ${prettyDate(n.date)}?`) && saveNote(n.date, "")}>Delete</button>
                  </span>
                )}
              </div>
              {editing === n.date ? (
                <EditNote note={n} onSave={(t) => (saveNote(n.date, t), setEditing(null))} onCancel={() => setEditing(null)} />
              ) : (
                <p className="etext">{n.text}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function EditNote({ note, onSave, onCancel }) {
  const [text, setText] = useState(note.text);
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.setSelectionRange(text.length, text.length);
  }, []);
  return (
    <div className="editnote">
      <textarea ref={ref} value={text} onChange={(e) => setText(e.target.value)} rows={4} aria-label={`Edit note for ${prettyDate(note.date)}`}
        onKeyDown={(e) => e.key === "Escape" && onCancel()} />
      <div className="nbfoot">
        <button className="ghost small" onClick={onCancel}>Cancel</button>
        <button onClick={() => onSave(text)} disabled={!text.trim()}>Save</button>
      </div>
    </div>
  );
}

function Backup({ data, onImport }) {
  const fileRef = useRef(null);
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `daymark-${today()}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.goals) || !Array.isArray(parsed.notes)) throw new Error();
      if (confirm(`Replace what’s here with ${parsed.goals.length} goals and ${parsed.notes.length} notes from the file?`)) onImport(parsed);
    } catch {
      alert("That file isn’t a Daymark backup.");
    }
  };
  return (
    <div className="backup">
      <button className="ghost small" onClick={exportJson}>Export</button>
      <button className="ghost small" onClick={() => fileRef.current.click()}>Import</button>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
