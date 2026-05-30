import React from 'react';
import { Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { NEWSPOST_ROUTE } from '../utils/consts';
import LikeButton from './LikeButton';
import { CalendarIcon, NewspaperIcon } from './icons/Icons';

const NewsItem = ({ news }) => {
  const navigate = useNavigate();
  const open = () => navigate(`${NEWSPOST_ROUTE}/${news.id}`);
  const primaryCategory = news.categories?.[0]?.name;
  const date = news.last_updated || news.createdAt;

  return (
    <Col xs={12} md={6} lg={4} style={{ marginBottom: 24 }}>
      <article className="media-card" onClick={open}>
        {/* News rows have no cover image field on the server — always show
            the newspaper placeholder. Adding a real cover_url column is a
            backend task for a future iteration. */}
        <div className="media-card__cover-wrap">
          <div className="media-card__cover-placeholder">
            <NewspaperIcon size={56} />
          </div>
          {primaryCategory && (
            <span className="media-card__cover-badge">{primaryCategory}</span>
          )}
        </div>

        <div className="media-card__body">
          <h3 className="media-card__title">{news.title}</h3>

          <div className="media-card__meta">
            {date && (
              <span className="media-card__meta-item">
                <CalendarIcon className="inline-icon" />
                {new Date(date).toLocaleDateString()}
              </span>
            )}
          </div>

          <p className="media-card__excerpt">{news.description || ''}</p>

          <div className="media-card__footer">
            <Button
              variant="primary"
              className="btn-rounded-md"
              onClick={(e) => { e.stopPropagation(); open(); }}
            >
              Читать
            </Button>
            <LikeButton newsPostId={news.id} />
          </div>
        </div>
      </article>
    </Col>
  );
};

export default NewsItem;
