import React, { useEffect, useState, useContext } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../http/categoriesAPI';
import CategoryFormModal from '../components/modals/CategoryFormModal';
import { Context } from '..';
import { ROLES } from '../utils/consts';

const AdminCategories = observer(() => {
  const { user } = useContext(Context);
  const isAdmin = user.role === ROLES.ADMIN;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null | category object

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setItems(data);
    } catch (e) {
      setError('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateClick = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEditClick = (cat) => {
    setEditing(cat);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    if (editing) {
      const updated = await updateCategory(editing.id, payload);
      setItems((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
      toast.success('Категория обновлена');
    } else {
      const created = await createCategory(payload);
      setItems((prev) => [...prev, created]);
      toast.success('Категория создана');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Удалить категорию «${cat.name}»?`)) return;
    try {
      await deleteCategory(cat.id);
      setItems((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success('Категория удалена');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        // Surface the API's reason in plain language.
        toast.error(msg || 'Категория используется и не может быть удалена');
      } else if (status === 403) {
        toast.error('Удалять категории может только ADMIN');
      } else {
        toast.error(msg || 'Не удалось удалить категорию');
      }
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 900 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0" style={{ fontWeight: 700 }}>Категории</h2>
        <Button variant="primary" onClick={handleCreateClick} style={{ borderRadius: 'var(--radius-pill)' }}>
          + Добавить категорию
        </Button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : items.length === 0 ? (
        <div className="app-card p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
          Категорий пока нет. Создайте первую.
        </div>
      ) : (
        <div className="app-card p-2">
          <Table responsive borderless className="mb-0 align-middle">
            <thead>
              <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                <th>Название</th>
                <th>Slug</th>
                <th style={{ width: 220, textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td><code style={{ color: 'var(--color-text-secondary)' }}>{c.slug}</code></td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      style={{ borderRadius: 'var(--radius-pill)' }}
                      onClick={() => handleEditClick(c)}
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      style={{ borderRadius: 'var(--radius-pill)' }}
                      onClick={() => handleDelete(c)}
                      disabled={!isAdmin}
                      title={isAdmin ? '' : 'Удалять может только ADMIN'}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <CategoryFormModal
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </Container>
  );
});

export default AdminCategories;
