import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react'
import Loader from './Loader'

export default function DataTable({
  columns,
  data,
  title,
  count,
  loading,
  emptyMessage,
  onAdd,
  addLabel,
  rowActions,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
  search,
  onSearchChange,
}) {
  return (
    <div className="dt-shell">
      {(title || onAdd || onSearchChange) && (
        <div className="dt-bar">
          {title && (
            <>
              <span className="dt-title">{title}</span>
              {count != null && <span className="dt-count">{count}</span>}
            </>
          )}
          <div style={{ flex: 1 }} />
          {onSearchChange && (
            <div className="dt-search">
              <Search size={14} className="dt-search-icon" />
              <input
                type="text"
                className="dt-search-input"
                placeholder="Search by name..."
                value={search || ''}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {onAdd && (
            <button className="dt-btn" onClick={onAdd}>
              {addLabel || 'Add'}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="dt-table-wrap">
          <Loader className="dt-loader-centered" />
        </div>
      ) : data.length === 0 ? (
        <div className="dt-empty">
          <p>{emptyMessage || 'No data.'}</p>
          {onAdd && (
            <button className="dt-btn dt-btn--primary" onClick={onAdd}>
              {addLabel || 'Add'}
            </button>
          )}
        </div>
      ) : (
        <div className="dt-table-wrap">
          <table className="dt-table">
            <thead>
              <tr>
                {columns.map(col => {
                  const isSorted = sortBy && col.sortKey && sortBy === col.sortKey
                  const SortIcon = isSorted
                    ? (sortDir === 'asc' ? ArrowUp : ArrowDown)
                    : (col.sortKey ? ArrowUpDown : null)
                  return (
                    <th
                      key={col.key}
                      className={`${col.className || ''}${col.sortKey ? ' dt-th-sortable' : ''}${isSorted ? ' dt-th-sorted' : ''}`}
                      onClick={col.sortKey && onSort ? () => onSort(col.sortKey) : undefined}
                    >
                      {col.label}
                      {SortIcon && <SortIcon size={12} className="dt-sort-icon" />}
                    </th>
                  )
                })}
                {rowActions && <th className="dt-th-actions"></th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  onClick={() => onRowClick?.(item)}
                  className={onRowClick ? 'dt-row-clickable' : ''}
                >
                  {columns.map(col => (
                    <td key={col.key} className={col.className || ''}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td>
                      <div className="dt-row-actions">
                        {rowActions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
