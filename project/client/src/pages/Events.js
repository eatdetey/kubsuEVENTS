import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Spinner, Alert } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { Context } from '../index';
import EventList from '../components/EventList';
import CategoryFilter from '../components/CategoryFilter';
import { fetchEvents } from '../http/eventAPI';
import { fetchCategories } from '../http/categoriesAPI';

const Events = observer(() => {
  const { events } = useContext(Context);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('category') || null;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    let alive = true;
    if (activeSlug && !activeCategory) return;
    setLoading(true);
    setError(null);
    fetchEvents({ categoryId: activeCategory?.id })
      .then((data) => { if (alive) events.setEventPost(data || []); })
      .catch(() => { if (alive) setError('Не удалось загрузить мероприятия'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [activeCategory, activeSlug, events]);

  const handleSelect = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set('category', slug); else next.delete('category');
    setSearchParams(next, { replace: true });
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 1100 }}>
      <h2 className="mb-3" style={{ fontWeight: 700 }}>События</h2>

      {categories.length > 0 && (
        <CategoryFilter
          categories={categories}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />
      )}

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row className="g-3">
          <EventList events={events.eventPost} loading={false} error={null} />
        </Row>
      )}
    </Container>
  );
});

export default Events;
