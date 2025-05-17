import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOneNews } from '../http/newsAPI';
import { Container, Card, Spinner, Button } from 'react-bootstrap';

const NewsPost = () => {
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    fetchOneNews(id)
      .then(data => setNewsItem(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!newsItem) {
    return <Container className="mt-5">Новость не найдена</Container>;
  }

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <Card.Body>
          <h1 className="mb-4">{newsItem.title}</h1>
          
          <Card.Text className="mb-4" style={{ whiteSpace: 'pre-line' }}>
            {newsItem.description}
          </Card.Text>
          
          <div className="d-flex justify-content-between align-items-center">
            <Button 
              variant="primary"
              onClick={() => console.log('Лайк!')} // Здесь будет логика лайков
            >
              ❤️ Лайк ({newsItem.likes})
            </Button>
            
            <small className="text-muted">
              Дата публикации: {new Date(newsItem.createdAt).toLocaleDateString()}
            </small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewsPost;