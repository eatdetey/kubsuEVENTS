import { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { createNews, updateNews } from '../../http/newsAPI';
import { observer } from 'mobx-react-lite';
import CategoryMultiSelect from '../CategoryMultiSelect';
import CrosspostStub from '../stubs/CrosspostStub';

const CreateNewsPost = observer(({ show, onHide, editing = false, existingPost = null, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show) return;
    if (editing && existingPost) {
      setTitle(existingPost.title || '');
      setDescription(existingPost.description || '');
      setCategoryIds((existingPost.categories || []).map((c) => c.id));
    } else {
      setTitle('');
      setDescription('');
      setCategoryIds([]);
    }
    setError('');
  }, [show, editing, existingPost]);

  const handleSubmit = async () => {
    try {
      setError('');
      if (!title.trim()) throw new Error('Введите заголовок новости');
      if (!description.trim()) throw new Error('Введите текст новости');
      setSubmitting(true);
      const body = { title, description, categoryIds };
      const result = editing && existingPost?.id
        ? await updateNews(existingPost.id, body)
        : await createNews(body);
      onUpdate?.(result);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка при сохранении');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategoryIds([]);
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? 'Редактировать новость' : 'Добавить новостной пост'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок новости"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              as="textarea"
              rows={10}
              placeholder="Текст новости"
              required
            />
          </Form.Group>

          <CategoryMultiSelect value={categoryIds} onChange={setCategoryIds} />

          <CrosspostStub />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={handleClose}>Закрыть</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Сохранение…' : (editing ? 'Сохранить' : 'Опубликовать')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default CreateNewsPost;
