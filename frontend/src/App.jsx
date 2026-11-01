import { useCallback, useEffect, useMemo, useState } from "react";
import StudentForm from "./components/StudentForm.jsx";
import StudentList from "./components/StudentList.jsx";
import SearchStudent from "./components/SearchStudent.jsx";
import { getStudents, addStudent, updateStudent, deleteStudent } from "./api.js";

const PAGE_SIZE = 5;

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("");
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, text) => {
    setToast({ type, text, key: Date.now() });
  }, []);

  // auto-dismiss the notification
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  // (re)load from the API whenever the search text changes - debounced so we
  // don't fire a request on every single keystroke
  const load = useCallback(async () => {
    try {
      setStudents(await getStudents(query.trim()));
    } catch (err) {
      setStudents([]);
      notify("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [query, notify]);

  useEffect(() => {
    const t = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  // branch filter is applied on top of whatever the server returned
  const filtered = useMemo(
    () => (branch ? students.filter((s) => s.branch === branch) : students),
    [students, branch]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => setPage(1), [query, branch]);

  async function handleSubmit(form) {
    setSaving(true);
    const payload = {
      id: Number(form.id),
      name: form.name.trim(),
      email: form.email.trim(),
      branch: form.branch,
      semester: Number(form.semester),
      mobile: form.mobile.trim(),
    };
    try {
      const res = editing
        ? await updateStudent(editing.id, payload)
        : await addStudent(payload);
      notify("success", res.message);
      setEditing(null);
      await load();
    } catch (err) {
      notify("error", err.message);
      throw err; // let the form paint field-level errors
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const target = toDelete;
    setToDelete(null);
    try {
      const res = await deleteStudent(target.id);
      notify("success", res.message);
      if (editing?.id === target.id) setEditing(null);
      await load();
    } catch (err) {
      notify("error", err.message);
    }
  }

  function startEdit(student) {
    setEditing(student);
    document.getElementById("student-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const filtering = Boolean(query.trim() || branch);

  return (
    <>
      <header className="masthead">
        <div>
          <p className="eyebrow">Department of Computer Science &amp; Engineering</p>
          <h1>Student Registry</h1>
        </div>
        <div className="count">
          <b>{students.length}</b>
          <span>{filtering ? "matching" : "enrolled"}</span>
        </div>
      </header>

      <main className="layout">
        <StudentForm
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
          busy={saving}
        />

        <section className="card listing">
          <div className="card-head">
            <h2>Records</h2>
          </div>

          <SearchStudent
            query={query}
            onQueryChange={setQuery}
            branch={branch}
            onBranchChange={setBranch}
          />

          <StudentList
            students={visible}
            loading={loading}
            filtering={filtering}
            query={query.trim()}
            editingId={editing?.id}
            onEdit={startEdit}
            onDelete={setToDelete}
          />

          {filtered.length > PAGE_SIZE && (
            <nav className="pager" aria-label="Pagination">
              <button className="btn small" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                ← Prev
              </button>
              <span>
                Page {safePage} of {pageCount}
              </span>
              <button className="btn small" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>
                Next →
              </button>
            </nav>
          )}
        </section>
      </main>

      {toDelete && (
        <div className="overlay" onClick={() => setToDelete(null)}>
          <div className="dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>Remove this student?</h3>
            <p>
              <b>{toDelete.name}</b> (ID {toDelete.id}) will be deleted from the registry. This cannot be undone.
            </p>
            <div className="actions">
              <button className="btn danger solid" onClick={confirmDelete} autoFocus>Yes, delete</button>
              <button className="btn ghost" onClick={() => setToDelete(null)}>Keep</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div key={toast.key} className={`toast ${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </>
  );
}
