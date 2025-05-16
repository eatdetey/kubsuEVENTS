import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOneEvent } from '../http/eventAPI';
import { Image, Card, Container, Spinner, Row, Col } from 'react-bootstrap';

const EventPost = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        fetchOneEvent(id).then(data => {
            setEvent(data);
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner animation="border" />;

    if (!event) return <div>Событие не найдено</div>;

    const getImageUrl = (img) => {
        if (!img) return '/placeholder.png';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return process.env.REACT_APP_API_URL + img;
        return process.env.REACT_APP_API_URL + '/static/' + img;
    };

    return (
        <Container className="mt-4">
            <Card>
                <Row>
                    <Col md={3}>
                    <Image
                        src={getImageUrl(event.img)}
                        onError={(e) => e.target.src = '/placeholder.png'}
                        fluid
                        className="w-100"
                        style={{ maxHeight: '300px', maxWidth: '300px', objectFit: 'cover' }}
                    />
                    </Col>
                    <Col md={3}>
                    <Card.Body>
                        <Card.Title>{event.title}</Card.Title>
                        <Card.Text>
                            {event.description || 'Описание отсутствует'}
                        </Card.Text>
                        <div className="event-details">
                            <p><strong>Место:</strong> {event.place || 'Не указано'}</p>
                            <p><strong>Время начала:</strong> {event.starts ? new Date(event.starts).toLocaleString() : 'Не указано'}</p>
                            <p><strong>Статус:</strong> {event.status || 'Не указан'}</p>
                        </div>
                    </Card.Body>
                    </Col>
                </Row>
            </Card>
        </Container>
    );
};

export default EventPost;