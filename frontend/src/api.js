import axios from "axios";

// All HTTP talk with the Express server lives here, so components stay clean.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 8000,
});

// Turn any axios failure into one predictable shape: { message, fieldErrors }
function normaliseError(err) {
  if (err.response) {
    return {
      message: err.response.data?.message || "The server rejected the request",
      fieldErrors: err.response.data?.errors || {},
      status: err.response.status,
    };
  }
  return {
    message: "Cannot reach the server. Is the backend running on port 5000?",
    fieldErrors: {},
    status: 0,
  };
}

async function call(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (err) {
    throw normaliseError(err);
  }
}

export const getStudents = (q = "") => call(client.get("/students", { params: q ? { q } : {} }));
export const addStudent = (student) => call(client.post("/students", student));
export const updateStudent = (id, student) => call(client.put(`/students/${id}`, student));
export const deleteStudent = (id) => call(client.delete(`/students/${id}`));
