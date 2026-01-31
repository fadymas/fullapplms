// src/components/codes/CodeFilters.jsx

const CodeFilters = ({ getCodes, is_used, setIsUsed }) => {
  const handleFilterChange = (e) => {
    const { value } = e.target

    setIsUsed(value)
  }

  const statuses = [
    { name: false, label: 'نشط' },
    { name: true, label: 'مستخدم' }
  ]

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <label htmlFor="statusFilter" className="form-label small">
          الحالة
        </label>
        <select
          id="statusFilter"
          name="status"
          className="form-select form-select-sm"
          value={is_used}
          onChange={handleFilterChange}
        >
          <option value="">كل الحالات</option>
          {statuses.map((status, index) => (
            <option key={index} value={status.name}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default CodeFilters
