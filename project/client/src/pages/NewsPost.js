import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOneNews } from '../http/newsAPI';
import { Container, Card, Spinner, Button, Alert } from 'react-bootstrap';
import { NEWS_ROUTE } from '../utils/consts';

const NewsPost = () => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadNews = async () => {
      try {
        const data = await fetchOneNews(id);
        if (!data) {
          navigate(NEWS_ROUTE, { state: { error: 'Новость не найдена' } });
          return;
        }
        setNews(data);
      } catch (e) {
        setError(e.response?.data?.message || 'Ошибка загрузки новости');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error}
          <div className="d-flex justify-content-end mt-2">
            <Button 
              variant="outline-danger" 
              onClick={() => navigate(NEWS_ROUTE)}
            >
              Вернуться к списку новостей
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!news) return null;

  return (
    <Container className="mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h1" className="mb-4">{news.title}</Card.Title>
          
          <Card.Text style={{ whiteSpace: 'pre-line', fontSize: '1.1rem' }}>
            {news.description}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button 
              variant="primary"
              onClick={() => console.log('Лайк поставлен')}
            >
              ❤️ Лайк ({news.likes})
            </Button>
            
            <small className="text-muted">
              {new Date(news.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewsPost;