const express = require("express");
const router = express.Router();

const BRANCHES = ["CSE", "CS", "IT", "ECE"];

// ---- in-memory "database" -------------------------------------------------
// Lives only as long as the Node process. Restart the server and it resets
// to this seed data (that is expected for this assignment).
let students = [
  { id: 101, name: "Rahul Sharma", email: "rahul@gmail.com", branch: "CSE", semester: 3, mobile: "9876543210" },
  { id: 102, name: "Ananya Verma", email: "ananya.verma@gmail.com", branch: "IT", semester: 5, mobile: "9123456780" },
  { id: 103, name: "Mohd. Faizan", email: "faizan@outlook.com", branch: "ECE", semester: 1, mobile: "8899776655" },
];

// ---- validation -----------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Returns { errors: {field: message}, clean: {...normalised student} }
function validateStudent(body, { requireId }) {
  const errors = {};
  const clean = {};

  if (requireId) {
    const rawId = body.id;
    if (rawId === undefined || rawId === null || String(rawId).trim() === "") {
      errors.id = "Student ID is required";
    } else if (!/^\d+$/.test(String(rawId).trim())) {
      errors.id = "Student ID must be a positive whole number";
    } else {
      clean.id = Number(rawId);
      if (clean.id <= 0) errors.id = "Student ID must be greater than 0";
    }
  }

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must have at least 2 characters";
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) errors.name = "Name can only contain letters, spaces, . ' -";
  else clean.name = name;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address";
  else clean.email = email;

  if (!BRANCHES.includes(body.branch)) errors.branch = `Branch must be one of ${BRANCHES.join(", ")}`;
  else clean.branch = body.branch;

  const sem = Number(body.semester);
  if (body.semester === "" || body.semester === undefined || body.semester === null) {
    errors.semester = "Semester is required";
  } else if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
    errors.semester = "Semester must be a whole number from 1 to 8";
  } else clean.semester = sem;

  const mobile = String(body.mobile ?? "").trim();
  if (!mobile) errors.mobile = "Mobile number is required";
  else if (!/^\d{10}$/.test(mobile)) errors.mobile = "Mobile number must be exactly 10 digits";
  else clean.mobile = mobile;

  return { errors, clean };
}

function badRequest(res, errors) {
  const first = Object.values(errors)[0];
  return res.status(400).json({ message: first, errors });
}

function parseIdParam(req, res) {
  if (!/^\d+$/.test(req.params.id)) {
    res.status(400).json({ message: "Student ID in the URL must be a number" });
    return null;
  }
  return Number(req.params.id);
}

// ---- routes ---------------------------------------------------------------

// GET /api/students            -> everything
// GET /api/students?q=rah      -> server-side search by id or name (bonus-friendly)
router.get("/", (req, res) => {
  const q = (req.query.q || "").toString().trim().toLowerCase();
  if (!q) return res.json(students);

  const found = students.filter(
    (s) => String(s.id).includes(q) || s.name.toLowerCase().includes(q)
  );
  res.json(found);
});

// GET /api/students/:id
router.get("/:id", (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ message: `No student found with ID ${id}` });
  res.json(student);
});

// POST /api/students
router.post("/", (req, res) => {
  const { errors, clean } = validateStudent(req.body || {}, { requireId: true });
  if (Object.keys(errors).length) return badRequest(res, errors);

  if (students.some((s) => s.id === clean.id)) {
    return res.status(409).json({
      message: `Student ID ${clean.id} already exists`,
      errors: { id: `Student ID ${clean.id} already exists` },
    });
  }

  students.push(clean);
  res.status(201).json({ message: `${clean.name} was added`, student: clean });
});

// PUT /api/students/:id   (full replacement of the editable fields; the ID itself is fixed)
router.put("/:id", (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: `No student found with ID ${id}` });

  const { errors, clean } = validateStudent(req.body || {}, { requireId: false });
  if (Object.keys(errors).length) return badRequest(res, errors);

  students[idx] = { id, ...clean };
  res.json({ message: `${clean.name} was updated`, student: students[idx] });
});

// DELETE /api/students/:id
router.delete("/:id", (req, res) => {
  const id = parseIdParam(req, res);
  if (id === null) return;

  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ message: `No student found with ID ${id}` });

  const [removed] = students.splice(idx, 1);
  res.json({ message: `${removed.name} was deleted`, student: removed });
});

module.exports = router;
