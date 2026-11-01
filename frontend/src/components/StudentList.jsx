export default function StudentList({ students, loading, filtering, query, onEdit, onDelete, editingId }) {
  if (loading) {
    return <div className="empty">Loading records…</div>;
  }

  if (students.length === 0) {
    return (
      <div className="empty">
        <strong>{filtering ? "No student found" : "No records yet"}</strong>
        <p>
          {filtering
            ? query
              ? `Nothing matches “${query}” with the current filter.`
              : "Nobody is enrolled in that branch yet."
            : "Use the form to enrol the first student."}
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Sem</th>
            <th>Mobile</th>
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className={editingId === s.id ? "editing" : ""}>
              <td data-label="ID" className="mono">{s.id}</td>
              <td data-label="Name" className="name">{s.name}</td>
              <td data-label="Email">{s.email}</td>
              <td data-label="Branch"><span className={`tag ${s.branch}`}>{s.branch}</span></td>
              <td data-label="Sem" className="mono">{s.semester}</td>
              <td data-label="Mobile" className="mono">{s.mobile}</td>
              <td data-label="Actions" className="right">
                <button className="btn small" onClick={() => onEdit(s)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(s)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
