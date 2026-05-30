import React, { useContext, useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Context } from '..';
import {
  fetchComments,
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
} from '../http/commentsAPI';
import { ROLES } from '../utils/consts';

const PAGE_SIZE = 10;
const CONTENT_MAX = 2000;

const CommentsSection = observer(({ newsPostId }) => {
  const { user } = useContext(Context);
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0, limit: PAGE_SIZE, total: 0, totalPages: 0,
  });
  const [loadingPage, setLoadingPage] = useState(false);
  const [error, setError] = useState(null);

  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPage = useCallback(async (page, replace) => {
    setLoadingPage(true);
    setError(null);
    try {
      const res = await fetchComments(newsPostId, page, PAGE_SIZE);
      setComments((prev) => (replace ? res.data : [...prev, ...res.data]));
      setPagination(res.pagination);
    } catch (e) {
      setError('Не удалось загрузить комментарии');
    } finally {
      setLoadingPage(false);
    }
  }, [newsPostId]);

  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);

  const canDelete = (comment) => {
    if (!user.isAuth) return false;
    if (comment.author && comment.author.id === user.user.id) return true;
    return user.role === ROLES.MOD || user.role === ROLES.ADMIN;
  };

  const trimmedLen = draft.trim().length;
  const canSubmit = !submitting && trimmedLen >= 1 && trimmedLen <= CONTENT_MAX;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const newComment = await apiCreateComment(newsPostId, draft.trim());
      // Prepend (sort DESC by createdAt) and bump counter.
      setComments((prev) => [newComment, ...prev]);
      setPagination((p) => ({ ...p, total: p.total + 1 }));
      setDraft('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Не удалось отправить комментарий');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await apiDeleteComment(newsPostId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Не удалось удалить комментарий');
    }
  };

  const hasMore = pagination.page > 0 && pagination.page < pagination.totalPages;

  return (
    <section className="comments-section mt-4">
      <h3 className="section-heading">
        Комментарии{' '}
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
          ({pagination.total})
        </span>
      </h3>

      {user.isAuth ? (
        <Form onSubmit={handleSubmit} className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            value={draft}
            maxLength={CONTENT_MAX}
            placeholder="Напишите комментарий..."
            onChange={(e) => setDraft(e.target.value)}
            disabled={submitting}
            style={{ borderRadius: 'var(--radius-md)' }}
          />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <small style={{ color: 'var(--color-text-muted)' }}>
              {trimmedLen}/{CONTENT_MAX}
            </small>
            <Button
              type="submit"
              disabled={!canSubmit}
              style={{ borderRadius: 'var(--radius-pill)', padding: '6px 18px' }}
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
          <em>Войдите, чтобы оставить комментарий.</em>
        </div>
      )}

      {error && (
        <div className="mb-2" style={{ color: 'var(--color-danger)' }}>{error}</div>
      )}

      {loadingPage && comments.length === 0 && (
        <div className="text-center my-3">
          <Spinner animation="border" size="sm" />
        </div>
      )}

      {!loadingPage && comments.length === 0 && !error && (
        <div style={{ color: 'var(--color-text-muted)' }}>
          Комментариев пока нет.
        </div>
      )}

      <ul className="list-unstyled mb-0">
        {comments.map((c) => (
          <li key={c.id} className="app-card p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="d-flex align-items-center" style={{ gap: 8 }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    {c.author?.username ?? 'Аноним'}
                  </strong>
                  <small style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </small>
                </div>
                <p className="mb-0 mt-1" style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)' }}>
                  {c.content}
                </p>
              </div>
              {canDelete(c) && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  className="ms-2 flex-shrink-0"
                  onClick={() => handleDelete(c.id)}
                  style={{ borderRadius: 'var(--radius-pill)' }}
                >
                  Удалить
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="text-center mt-2">
          <Button
            variant="outline-primary"
            disabled={loadingPage}
            onClick={() => loadPage(pagination.page + 1, false)}
            style={{ borderRadius: 'var(--radius-pill)' }}
          >
            {loadingPage ? <><Spinner size="sm" animation="border" /> Загрузка...</> : 'Загрузить ещё'}
          </Button>
        </div>
      )}
    </section>
  );
});

export default CommentsSection;
