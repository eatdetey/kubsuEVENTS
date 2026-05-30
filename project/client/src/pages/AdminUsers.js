import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Form, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { Context } from '..';
import { fetchAllUsers, changeUserRole } from '../http/usersAdminAPI';
import { ROLES } from '../utils/consts';

const ROLE_OPTIONS = Object.values(ROLES);

const AdminUsers = observer(() => {
  const { user: currentUser } = useContext(Context);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  // Per-row pending state: { [userId]: true | false }.
  const [pending, setPending] = useState({});

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchAllUsers()
      .then((data) => { if (alive) setUsers(data); })
      .catch((err) => {
        if (!alive) return;
        const status = err.response?.status;
        setError(status === 403 ? 'Доступ только для ADMIN'
                                : 'Не удалось загрузить список пользователей');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // Client-side filter — fast enough for thesis-sized user lists. Switch to
  // a server-side ?search= param if the table grows large.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  const handleRoleChange = async (target, nextRole) => {
    if (target.role === nextRole) return;
    const prevRole = target.role;
    setPending((p) => ({ ...p, [target.id]: true }));
    // Optimistic local swap.
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u)));
    try {
      const updated = await changeUserRole(target.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, ...updated } : u)));
      toast.success(`Роль обновлена: ${target.username || target.email} → ${nextRole}`);
    } catch (err) {
      // Rollback.
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: prevRole } : u)));
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 400) toast.error(msg || 'Невалидная роль');
      else if (status === 403) toast.error('Менять роли может только ADMIN');
      else if (status === 404) toast.error('Пользователь не найден');
      else toast.error(msg || 'Не удалось изменить роль');
    } finally {
      setPending((p) => ({ ...p, [target.id]: false }));
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 1100 }}>
      <h2 className="mb-3" style={{ fontWeight: 700 }}>Пользователи</h2>

      <Form.Control
        type="search"
        placeholder="Поиск по имени или email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
        style={{ borderRadius: 'var(--radius-pill)', maxWidth: 400 }}
      />

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : filtered.length === 0 ? (
        <div className="app-card p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
          {users.length === 0 ? 'Пользователей нет.' : 'Совпадений не найдено.'}
        </div>
      ) : (
        <div className="app-card p-2">
          <Table responsive borderless className="mb-0 align-middle">
            <thead>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <th>Имя</th>
                <th>Email</th>
                <th style={{ width: 180 }}>Роль</th>
                <th>Дата регистрации</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUser.user?.id;
                const rowPending = Boolean(pending[u.id]);
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.username || `user#${u.id}`}</strong>
                      {isSelf && <Badge bg="info" className="ms-2">вы</Badge>}
                    </td>
                    <td><span style={{ color: 'var(--color-text-secondary)' }}>{u.email}</span></td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        disabled={isSelf || rowPending}
                        title={isSelf ? 'Нельзя изменить свою роль' : ''}
                        style={{ borderRadius: 'var(--radius-pill)' }}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
});

export default AdminUsers;
