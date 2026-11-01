# Student Registry

A full-stack student management app built for the **Full Stack Development Workshop** (B.Tech CSE).
React runs the interface, Node.js + Express serves a REST API, and all records live in a plain
JavaScript array in server memory. No database is used.

> **Author:** AKSHAT SINGH · ROLL NO. 25000320100142 · B.Tech CSE


## What it does

| Module | Behaviour |
| --- | --- |
| Add | Form with validation on both client and server. Duplicate IDs are rejected with a clear message. |
| View | Table of all students with a friendly empty state. |
| Update | **Edit** loads the row into the form (ID is locked), then saves through `PUT`. |
| Delete | **Delete** opens a confirmation dialog, then calls `DELETE`. The table refreshes without a page reload. |
| Search | Matches Student ID or name. The name search ignores case. Shows "No student found" when nothing matches. |
| Bonus | Pagination (5 per page) and a branch filter. |

## Tech stack

- **Frontend:** React 18 (functional components, `useState`, `useEffect`, `useMemo`, `useCallback`), Vite, Axios, plain CSS
- **Backend:** Node.js, Express 4, CORS
- **Storage:** in-memory array (resets when the server restarts, as the assignment expects)

## Project structure

```
student-management/
├── backend/
│   ├── server.js                
│   ├── routes/studentRoutes.js   
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              
│       ├── App.css
│       ├── api.js               
│       └── components/
│           ├── StudentForm.jsx
│           ├── StudentList.jsx
│           └── SearchStudent.jsx
├── screenshots/
└── README.md
```

## Installation and running

You need **Node.js 18 or newer** ([nodejs.org](https://nodejs.org)).

Open two terminals.

**Terminal 1: backend**

```bash
cd backend
npm install
npm start
```

The API starts on `http://localhost:5000`.

**Terminal 2: frontend**

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints (normally `http://localhost:5173`).

If your backend runs on a different port, create `frontend/.env` containing
`VITE_API_URL=http://localhost:PORT/api`.

## API endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| GET | `/students` | All students. Add `?q=text` to search by ID or name. | 200 |
| GET | `/students/:id` | One student by ID | 200 / 404 |
| POST | `/students` | Add a student | 201 / 400 / 409 |
| PUT | `/students/:id` | Update a student (ID cannot change) | 200 / 400 / 404 |
| DELETE | `/students/:id` | Delete a student | 200 / 404 |

**Sample POST body**

```json
{
  "id": 104,
  "name": "Priya Singh",
  "email": "priya@gmail.com",
  "branch": "CS",
  "semester": 4,
  "mobile": "9000011111"
}
```

**Validation rules (enforced on the server)**

- `id`: required, positive whole number, unique
- `name`: required, letters/spaces/`. ' -` only
- `email`: required, valid format (stored in lowercase)
- `branch`: one of `CSE`, `CS`, `IT`, `ECE`
- `semester`: whole number, 1 to 8
- `mobile`: exactly 10 digits

Errors come back as `{ "message": "...", "errors": { "field": "..." } }`.

## Test cases

| Test case | Result |
| --- | --- |
| Add valid student | Added, success toast shown |
| Add duplicate ID | `409`, "Student ID already exists" under the ID field |
| Submit empty form | Field-level validation messages |
| Fetch all students | Table populated on page load |
| Search by name or ID | Matching rows only (name search is case-insensitive) |
| Update details | Table shows new values |
| Delete student | Confirmation dialog, then the row disappears |
| Search unavailable student | "No student found" |
| Restart server | Data returns to the three seed records |

## Screenshots

Add your own screenshots to the `screenshots/` folder and link them here:

| Add | View | Update |
| --- | --- | --- |
| ![Add](screenshots/add.png) | ![View](screenshots/view.png) | ![Update](screenshots/update.png) |

| Delete | Search |
| --- | --- |
| ![Delete](screenshots/delete.png) | ![Search](screenshots/search.png) |

## Notes

- Data is temporary by design. Restarting `node server.js` resets it.
- The JSON-file persistence and React Router bonus tasks were not attempted.
