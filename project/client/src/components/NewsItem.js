import React from "react";
import { Card, Col } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { NEWSPOST_ROUTE } from "../utils/consts";

const NewsItem = ({ news }) => {
  const navigate = useNavigate();
  
  return (
    <Col md={4} className="mt-3">
      <Card 
        style={{ 
          width: '100%', 
          cursor: 'pointer',
          minHeight: '300px',
          transition: 'transform 0.2s'
        }}
        className="hover-shadow"
        onClick={() => navigate(`${NEWSPOST_ROUTE}/${news.id}`)}
      >
        <Card.Body>
          <Card.Title>{news.title}</Card.Title>
          <Card.Text>
            {news.description.length > 300 
              ? news.description.slice(0, 300) + '...'
              : news.description}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Лайков: {news.likes}</span>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default NewsItem;