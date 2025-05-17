import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOneEvent } from '../http/eventAPI';
import { addToWatchlist } from '../http/watchlistAPI';
import { Image, Card, Container, Spinner, Row, Col, Button } from 'react-bootstrap';
import star from '../assets/star.png';
import { toast } from 'react-toastify';
import { Context } from '..';
import CreateEventPost from "../components/modals/CreateEventPost";

const EventPost = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const { user } = useContext(Context);
    const [editVisible, setEditVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    const handleAddToWatchlist = async (e) => {
        e.stopPropagation();
        try {
            await addToWatchlist(event.id);
            toast.success('Добавлено в избранное!');
        } catch (error) {
            toast.error('Ошибка при добавлении в избранное');
            console.error(error);
        }
    };

    return (
        <Container className="mt-4">
            <Card>
                <Row className="g-4 p-4">
                    <Col md={4} sm={12} className="d-flex flex-column align-items-center">
                        <Image
                            src={getImageUrl(event.img)}
                            onError={(e) => e.target.src = '/placeholder.png'}
                            fluid
                            style={{ maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        {user.isAuth && (
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-3"
                            onClick={handleAddToWatchlist}
                        >
                            <img src={star} alt="Добавить в избранное" width={20} height={20} className="me-2" />
                            Добавить в избранное
                        </Button>
                        )}
                        {(user.role === 'ADMIN' || event.userId === user.id) && (
                        <Button
                            variant="warning"
                            className="mt-2"
                            onClick={() => {
                            setSelectedEvent(event);
                            setEditVisible(true);
                            }}
                        >
                            Редактировать
                        </Button>
                        )}
                    </Col>
                    <Col md={8} sm={12}>
                        <Card.Body>
                            <Card.Title className="mb-3">{event.title}</Card.Title>
                            <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
                                {event.description || 'Описание отсутствует'}
                            </Card.Text>
                            <div className="event-details mt-4">
                                <p><strong>Место:</strong> {event.place || 'Не указано'}</p>
                                <p><strong>Время начала:</strong> {event.starts ? new Date(event.starts).toLocaleString() : 'Не указано'}</p>
                                <p><strong>Статус:</strong> {event.status || 'Не указан'}</p>
                            </div>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
            <CreateEventPost
                show={editVisible}
                onHide={() => setEditVisible(false)}
                editing={true}
                existingPost={selectedEvent}
                onUpdate={(updatedEvent) => {
                    setEvent(updatedEvent);
                    setEditVisible(false);
                    }}
                />
        </Container>
    );
};

export default EventPost;
