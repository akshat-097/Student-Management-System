const BRANCHES = ["CSE", "CS", "IT", "ECE"];

export default function SearchStudent({ query, onQueryChange, branch, onBranchChange }) {
  return (
    <div className="toolbar">
      <label className="search">
        <span className="sr-only">Search by student ID or name</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Search by ID or name…"
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </label>

      <div className="chips" role="group" aria-label="Filter by branch">
        {["All", ...BRANCHES].map((b) => {
          const value = b === "All" ? "" : b;
          return (
            <button
              key={b}
              type="button"
              className={`chip ${branch === value ? "on" : ""}`}
              onClick={() => onBranchChange(value)}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
}
