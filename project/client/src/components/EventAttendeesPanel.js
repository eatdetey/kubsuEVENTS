import React, { useState } from 'react';
import { Button, Spinner, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { fetchEventRegistrations } from '../http/registrationsAPI';

// Lazy-loaded attendees table: nothing is fetched until the user clicks
// "Показать участников" — keeps event detail snappy for ordinary visitors.
const EventAttendeesPanel = ({ eventId }) => {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  // Pagination state — kept simple with a "Load more" pattern.
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadPage = async (nextPage, replace) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEventRegistrations(eventId, nextPage, 20);
      setData((prev) => (replace ? res.data : [...prev, ...res.data]));
      setStats(res.stats);
      setPage(res.pagination.page);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 403) {
        setError('Просматривать список могут только MOD или ADMIN');
      } else {
        setError(msg || 'Не удалось загрузить участников');
      }
      toast.error(msg || 'Не удалось загрузить участников');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpened(true);
    loadPage(1, true);
  };

  if (!opened) {
    return (
      <Button
        variant="outline-primary"
        style={{ borderRadius: 'var(--radius-pill)' }}
        onClick={handleOpen}
      >
        Показать участников
      </Button>
    );
  }

  return (
    <div className="app-card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="section-heading mb-0">Участники</h3>
        {stats && (
          <small style={{ color: 'var(--color-text-muted)' }}>
            Зарегистрировано <strong>{stats.total}</strong>, присутствовало <strong>{stats.attended}</strong>
          </small>
        )}
      </div>

      {error && <div className="mb-2" style={{ color: 'var(--color-danger)' }}>{error}</div>}

      {loading && data.length === 0 ? (
        <div className="d-flex justify-content-center"><Spinner animation="border" size="sm" /></div>
      ) : data.length === 0 && !error ? (
        <div style={{ color: 'var(--color-text-muted)' }}>Зарегистрированных пока нет.</div>
      ) : (
        <Table responsive borderless className="mb-0 align-middle">
          <thead>
            <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <th>Имя</th>
              <th>Дата регистрации</th>
              <th>Статус посещения</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.ticketUuid}>
                <td><strong>{row.username || `user#${row.userId}`}</strong></td>
                <td>
                  {row.registeredAt
                    ? new Date(row.registeredAt).toLocaleString()
                    : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                </td>
                <td>
                  {row.isAttended
                    ? <Badge bg="success">Был</Badge>
                    : <Badge bg="secondary">Не был</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {page > 0 && page < totalPages && (
        <div className="text-center mt-2">
          <Button
            variant="outline-primary"
            disabled={loading}
            onClick={() => loadPage(page + 1, false)}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {loading ? <><Spinner size="sm" animation="border" /> Загрузка…</> : 'Загрузить ещё'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventAttendeesPanel;
