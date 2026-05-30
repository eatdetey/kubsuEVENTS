import React, { useEffect, useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { fetchCategories } from '../http/categoriesAPI';

// Reusable multi-select for category ids. `value` is an array of numeric ids;
// `onChange(nextIds)` fires whenever a checkbox toggles. Loads the catalogue
// itself so callers don't have to.
const CategoryMultiSelect = ({ value = [], onChange, label = 'Категории', disabled = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((data) => { if (alive) setCategories(data); })
      .catch(() => { if (alive) setError('Не удалось загрузить категории'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const toggle = (id) => {
    const has = value.includes(id);
    onChange(has ? value.filter((v) => v !== id) : [...value, id]);
  };

  if (loading) return <div><Spinner size="sm" animation="border" /> Загрузка категорий…</div>;
  if (error) return <Form.Text className="text-danger">{error}</Form.Text>;
  if (categories.length === 0) {
    return <Form.Text className="text-muted">Категорий пока нет.</Form.Text>;
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label className="mb-2">{label}</Form.Label>
      <div className="d-flex flex-wrap" style={{ gap: 8 }}>
        {categories.map((c) => {
          const active = value.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className={`tag-pill ${active ? 'is-active' : ''}`}
              onClick={() => toggle(c.id)}
              aria-pressed={active}
              disabled={disabled}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </Form.Group>
  );
};

export default CategoryMultiSelect;
