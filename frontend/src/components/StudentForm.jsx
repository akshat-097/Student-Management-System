import { useEffect, useState } from "react";

const BRANCHES = ["CSE", "CS", "IT", "ECE"];
const EMPTY = { id: "", name: "", email: "", branch: "", semester: "", mobile: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Same rules as the server. The server is the real gatekeeper; this just
// saves a round trip and gives instant feedback.
function check(f) {
  const e = {};
  if (!String(f.id).trim()) e.id = "Student ID is required";
  else if (!/^\d+$/.test(String(f.id).trim()) || Number(f.id) <= 0) e.id = "ID must be a positive whole number";

  if (!f.name.trim()) e.name = "Name is required";
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(f.name.trim())) e.name = "Use letters, spaces, . ' - only";

  if (!f.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address";

  if (!f.branch) e.branch = "Pick a branch";

  if (f.semester === "") e.semester = "Semester is required";
  else if (!Number.isInteger(Number(f.semester)) || f.semester < 1 || f.semester > 8) e.semester = "Semester must be 1 to 8";

  if (!f.mobile.trim()) e.mobile = "Mobile number is required";
  else if (!/^\d{10}$/.test(f.mobile.trim())) e.mobile = "Must be exactly 10 digits";
  return e;
}

export default function StudentForm({ editing, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(editing);

  // when the user hits "Edit" on a row, pour that student into the form
  useEffect(() => {
    setForm(editing ? { ...editing, id: String(editing.id), semester: String(editing.semester) } : EMPTY);
    setErrors({});
  }, [editing]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const found = check(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    try {
      await onSubmit(form);
      setForm(EMPTY);
      setErrors({});
    } catch (err) {
      // server-side validation failure (e.g. duplicate ID) -> show under the field
      setErrors(err.fieldErrors || {});
    }
  }

  const field = (name, label, input) => (
    <div className={`field ${errors[name] ? "bad" : ""}`}>
      <label htmlFor={`f-${name}`}>{label}</label>
      {input}
      {errors[name] && <small role="alert">{errors[name]}</small>}
    </div>
  );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate id="student-form">
      <div className="card-head">
        <h2>{isEditing ? `Editing ${editing.name.split(" ")[0]}` : "New enrolment"}</h2>
        {isEditing && <span className="pill">ID locked</span>}
      </div>

      <div className="grid">
        {field("id", "Student ID",
          <input id="f-id" inputMode="numeric" value={form.id} onChange={set("id")} disabled={isEditing} placeholder="e.g. 104" />
        )}
        {field("name", "Full name",
          <input id="f-name" value={form.name} onChange={set("name")} placeholder="Priya Singh" />
        )}
        {field("email", "Email",
          <input id="f-email" type="email" value={form.email} onChange={set("email")} placeholder="priya@college.edu" />
        )}
        {field("mobile", "Mobile number",
          <input id="f-mobile" inputMode="numeric" maxLength={10} value={form.mobile} onChange={set("mobile")} placeholder="10 digits" />
        )}
        {field("branch", "Branch",
          <select id="f-branch" value={form.branch} onChange={set("branch")}>
            <option value="">Select branch</option>
            {BRANCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
        )}
        {field("semester", "Semester",
          <input id="f-semester" type="number" min="1" max="8" value={form.semester} onChange={set("semester")} placeholder="1 – 8" />
        )}
      </div>

      <div className="actions">
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : isEditing ? "Save changes" : "Add student"}
        </button>
        {isEditing && (
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
