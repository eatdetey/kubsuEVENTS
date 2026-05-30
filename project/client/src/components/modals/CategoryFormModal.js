import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

// Lowercase-ASCII, hyphenated slug — matches the backend regex /^[a-z0-9-]+$/.
function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SLUG_RE = /^[a-z0-9-]+$/;

const CategoryFormModal = ({ show, onHide, onSubmit, initial }) => {
  const isEdit = Boolean(initial);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return;
    setName(initial?.name || '');
    setSlug(initial?.slug || '');
    setSlugTouched(Boolean(initial?.slug));
    setError('');
    setSubmitting(false);
  }, [show, initial]);

  // Auto-generate slug from name until the user edits it manually.
  const handleNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSlugChange = (e) => {
    setSlug(e.target.value);
    setSlugTouched(true);
  };

  const slugError = slug && !SLUG_RE.test(slug)
    ? 'Slug может содержать только строчные латинские буквы, цифры и дефис'
    : null;

  const canSubmit = !submitting && name.trim().length > 0 && slug.trim().length > 0 && !slugError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim() });
      onHide();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Редактировать категорию' : 'Добавить категорию'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Название</Form.Label>
            <Form.Control
              value={name}
              onChange={handleNameChange}
              placeholder="Например, Математика"
              autoFocus
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              value={slug}
              onChange={handleSlugChange}
              placeholder="matematika"
              isInvalid={Boolean(slugError)}
              required
            />
            <Form.Control.Feedback type="invalid">{slugError}</Form.Control.Feedback>
            <Form.Text className="text-muted">
              Автогенерация из названия; можно отредактировать вручную.
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end" style={{ gap: 8 }}>
            <Button variant="outline-secondary" type="button" onClick={onHide}>Отмена</Button>
            <Button variant="primary" type="submit" disabled={!canSubmit}>
              {submitting ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CategoryFormModal;
