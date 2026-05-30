import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOneNews } from '../http/newsAPI';
import { Container, Spinner, Alert } from 'react-bootstrap';
import LikeButton from '../components/LikeButton';
import CommentsSection from '../components/CommentsSection';
import { CalendarIcon } from '../components/icons/Icons';

const NewsPost = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchOneNews(id)
      .then((data) => { if (alive) setNewsItem(data); })
      .catch(() => { if (alive) setError('Не удалось загрузить новость'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4" style={{ maxWidth: 760 }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!newsItem) {
    return (
      <Container className="mt-4" style={{ maxWidth: 760 }}>
        <div className="app-card p-4">Новость не найдена</div>
      </Container>
    );
  }

  const author = newsItem.user;
  const displayDate = newsItem.last_updated || newsItem.createdAt;

  return (
    <Container className="mt-4" style={{ maxWidth: 760 }}>
      <article className="app-card" style={{ padding: 24, borderRadius: 20 }}>
        {/* Categories */}
        {newsItem.categories?.length > 0 && (
          <div className="d-flex flex-wrap" style={{ gap: 6, marginBottom: 16 }}>
            {newsItem.categories.map((c) => (
              <span key={c.id} className="badge-soft badge-soft--info">{c.name}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.25, margin: '0 0 16px' }}>
          {newsItem.title}
        </h1>

        {/* Meta: author + date */}
        <div className="d-flex flex-wrap align-items-center"
             style={{ gap: 16, marginBottom: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>
          {author && (
            <span>
              Автор:{' '}
              <strong style={{ color: 'var(--color-text-secondary)' }}>
                {author.username || author.email}
              </strong>
            </span>
          )}
          {displayDate && (
            <span className="d-inline-flex align-items-center" style={{ gap: 6 }}>
              <CalendarIcon className="inline-icon" />
              {new Date(displayDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="article-body">
          {newsItem.description}
        </div>

        {/* Likes section — bigger button than in the list card. */}
        <div className="d-flex align-items-center"
             style={{ gap: 12, marginTop: 32 }}>
          <LikeButton newsPostId={newsItem.id} size="lg" />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            Понравилась статья — поставьте лайк.
          </span>
        </div>

        {/* Divider */}
        <hr className="article-divider" />

        {/* Comments */}
        <CommentsSection newsPostId={newsItem.id} />
      </article>
    </Container>
  );
};

export default NewsPost;
