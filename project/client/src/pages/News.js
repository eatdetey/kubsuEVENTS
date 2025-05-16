import { observer } from "mobx-react-lite";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../index";
import { Container, Row, Spinner } from "react-bootstrap";
import NewsItem from "../components/NewsItem";
import { fetchNews } from "../http/newsAPI";

const News = observer(() => {
  const { news } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews()
      .then(data => {
        news.setNews(data || []);
        setLoading(false);
      })
      .catch(e => {
        console.error("Ошибка загрузки новостей:", e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Новости</h2>
      <Row className="g-4 justify-content-center">
        {news.newsItems?.map(item => (
          <NewsItem key={item.id} news={item} />
        ))}
      </Row>
    </Container>
  );
});

export default News;