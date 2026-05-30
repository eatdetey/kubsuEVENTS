import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOneEvent } from '../http/eventAPI';
import { addFavorite, removeFavorite } from '../http/favoritesAPI';
import { Container, Spinner, Button, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Context } from '..';
import CreateEventPost from '../components/modals/CreateEventPost';
import EventMapPreview from '../components/EventMapPreview';
import EventRegistrationPanel from '../components/EventRegistrationPanel';
import EventAttendeesPanel from '../components/EventAttendeesPanel';
import { CalendarIcon, MapPinIcon, UsersIcon, HeartIcon } from '../components/icons/Icons';
import { ROLES } from '../utils/consts';
import { useHasRole } from '../utils/roles';

const EventPost = () => {
    // All hooks must run unconditionally on every render — otherwise React
    // throws "Rendered more hooks than during the previous render" once an
    // early return path stops triggering. Keep this block at the very top.
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { user } = useContext(Context);
    const [editVisible, setEditVisible] = useState(false);
    const [favPending, setFavPending] = useState(false);
    const isStaff = useHasRole(ROLES.MOD, ROLES.ADMIN);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        fetchOneEvent(id)
            .then((data) => { if (alive) setEvent(data); })
            .catch(() => { if (alive) setError('Не удалось загрузить мероприятие'); })
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
            <Container className="mt-4" style={{ maxWidth: 900 }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    if (!event) {
        return (
            <Container className="mt-4" style={{ maxWidth: 900 }}>
                <div className="app-card p-4">Событие не найдено</div>
            </Container>
        );
    }

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return process.env.REACT_APP_API_URL + img;
        return process.env.REACT_APP_API_URL + '/static/' + img;
    };

    // Toggle the favorite state with optimistic update + rollback. The
    // event object's isFavorited becomes our single source of truth on
    // every refresh; locally we flip it inside setEvent for instant feedback.
    const toggleFavorite = async () => {
        if (!user.isAuth) {
            toast.error('Пожалуйста, войдите, чтобы добавлять в избранное.');
            return;
        }
        if (favPending) return;
        const prev = Boolean(event.isFavorited);
        const next = !prev;
        setEvent((e) => ({ ...e, isFavorited: next }));
        setFavPending(true);
        try {
            if (next) await addFavorite(event.id);
            else await removeFavorite(event.id);
        } catch (err) {
            setEvent((e) => ({ ...e, isFavorited: prev }));
            toast.error(err.response?.data?.message || 'Не удалось обновить избранное');
        } finally {
            setFavPending(false);
        }
    };

    const canEdit =
        user.role === ROLES.ADMIN ||
        user.role === ROLES.MOD ||
        event.userId === user.user?.id;

    const adjustCount = (delta) => {
        setEvent((prev) => prev
            ? { ...prev, registeredCount: Math.max(0, (prev.registeredCount ?? 0) + delta) }
            : prev);
    };

    const heroImage = getImageUrl(event.img);
    const primaryCategory = event.categories?.[0]?.name;
    const seatsLeft = event.max_participants != null
        ? Math.max(0, event.max_participants - (event.registeredCount ?? 0))
        : null;

    return (
        <Container className="mt-4" style={{ maxWidth: 880 }}>
            {/* ---------- Hero cover ---------- */}
            <div className="media-card" style={{ cursor: 'default' }}>
                <div className="media-card__cover-wrap" style={{ height: 280 }}>
                    {heroImage ? (
                        <img src={heroImage} alt="" className="media-card__cover"
                             onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div className="media-card__cover-placeholder">
                            <CalendarIcon size={64} />
                        </div>
                    )}
                    {primaryCategory && (
                        <span className="media-card__cover-badge">{primaryCategory}</span>
                    )}
                </div>

                <div className="media-card__body">
                    {/* Title */}
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 16px' }}>
                        {event.title}
                    </h1>

                    {/* Meta row with icons */}
                    <div className="media-card__meta" style={{ fontSize: 14, marginBottom: 24 }}>
                        {event.starts && (
                            <span className="media-card__meta-item">
                                <CalendarIcon className="inline-icon inline-icon--md" />
                                {new Date(event.starts).toLocaleString()}
                            </span>
                        )}
                        {event.place && (
                            <span className="media-card__meta-item">
                                <MapPinIcon className="inline-icon inline-icon--md" />
                                {event.place}
                            </span>
                        )}
                        {event.max_participants != null && (
                            <span className="media-card__meta-item">
                                <UsersIcon className="inline-icon inline-icon--md" />
                                <span>
                                    <strong>{seatsLeft}</strong>
                                    <span style={{ color: 'var(--color-text-muted)' }}> из {event.max_participants}</span>
                                </span>
                            </span>
                        )}
                        {event.registration_required
                            ? <Badge bg="success" style={{ fontWeight: 500 }}>Нужна регистрация</Badge>
                            : <Badge bg="secondary" style={{ fontWeight: 500 }}>Регистрация не требуется</Badge>}
                    </div>

                    {/* Body text */}
                    <p className="article-body" style={{ marginBottom: 24 }}>
                        {event.description || 'Описание отсутствует'}
                    </p>

                    {/* Actions row */}
                    <div className="d-flex flex-wrap" style={{ gap: 12, marginBottom: 16 }}>
                        {user.isAuth && (
                            <button
                                type="button"
                                className={`fav-btn ${event.isFavorited ? 'is-active' : ''}`}
                                onClick={toggleFavorite}
                                disabled={favPending}
                                aria-pressed={Boolean(event.isFavorited)}
                            >
                                <HeartIcon size={18} filled={Boolean(event.isFavorited)} />
                                {event.isFavorited ? 'В избранном' : 'В избранное'}
                            </button>
                        )}
                        {canEdit && (
                            <Button
                                variant="outline-secondary"
                                className="btn-rounded-md"
                                onClick={() => setEditVisible(true)}
                            >
                                Редактировать
                            </Button>
                        )}
                        {/* "Просмотров: N" removed (Task 3 of this stage).
                            The `views` column remains on the model — only
                            the display and the increment are gone. */}
                    </div>
                </div>
            </div>

            {/* ---------- Map ---------- */}
            {event.latitude != null && event.longitude != null && (
                <section style={{ marginTop: 40 }}>
                    <h2 className="section-heading" style={{ fontSize: 20 }}>Где это</h2>
                    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                        <EventMapPreview lat={event.latitude} lon={event.longitude} height={300} />
                    </div>
                </section>
            )}

            {/* ---------- Registration panel (USER + auth) ---------- */}
            {event.registration_required && (
                <section style={{ marginTop: 40 }}>
                    <EventRegistrationPanel event={event} onCountChange={adjustCount} />
                </section>
            )}

            {/* ---------- Attendees (MOD/ADMIN) ---------- */}
            {isStaff && (
                <section style={{ marginTop: 40, marginBottom: 40 }}>
                    <EventAttendeesPanel eventId={event.id} />
                </section>
            )}

            <CreateEventPost
                show={editVisible}
                onHide={() => setEditVisible(false)}
                editing={true}
                existingPost={event}
                onUpdate={(updatedEvent) => {
                    setEvent({ ...event, ...updatedEvent });
                    setEditVisible(false);
                }}
            />
        </Container>
    );
};

export default EventPost;
