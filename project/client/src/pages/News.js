import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { Context } from '../index';
import NewsItem from '../components/NewsItem';
import CategoryFilter from '../components/CategoryFilter';
import { fetchNews } from '../http/newsAPI';
import { fetchCategories } from '../http/categoriesAPI';

const News = observer(() => {
  const { news } = useContext(Context);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('category') || null;

  const [categories, setCategories] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((data) => { if (alive) setCategories(data); })
      .catch(() => { /* filter row just won't render */ });
    return () => { alive = false; };
  }, []);

  const activeCategory = useMemo(
    () => (activeSlug ? categories.find((c) => c.slug === activeSlug) : null),
    [categories, activeSlug]
  );

  // Reload the list whenever the resolved filter changes. If a slug is in the
  // URL but the categories haven't loaded yet, wait until they do.
  useEffect(() => {
    let alive = true;
    if (activeSlug && !activeCategory) return;
    setLoadingList(true);
    setError(null);
    fetchNews({ categoryId: activeCategory?.id })
      .then((data) => { if (alive) news.setNews(data || []); })
      .catch(() => { if (alive) setError('Не удалось загрузить новости'); })
      .finally(() => { if (alive) setLoadingList(false); });
    return () => { alive = false; };
  }, [activeCategory, activeSlug, news]);

  const handleSelect = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 1100 }}>
      <h2 className="mb-3" style={{ fontWeight: 700 }}>Новости</h2>

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />
      )}

      {loadingList ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (news.newsItems?.length ?? 0) === 0 ? (
        <div className="text-center" style={{ color: 'var(--color-text-muted)', marginTop: 24 }}>
          Новостей по выбранной категории нет.
        </div>
      ) : (
        <Row className="g-3">
          {news.newsItems.map((item) => (
            <NewsItem key={item.id} news={item} />
          ))}
        </Row>
      )}
    </Container>
  );
});

export default News;
