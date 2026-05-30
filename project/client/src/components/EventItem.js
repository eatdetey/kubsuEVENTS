import React, { useContext, useState, useEffect } from 'react';
import { Button, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { EVENTPOST_ROUTE } from '../utils/consts';
import { toast } from 'react-toastify';
import { Context } from '../index';
import { addFavorite, removeFavorite } from '../http/favoritesAPI';
import { CalendarIcon, MapPinIcon, HeartIcon } from './icons/Icons';

const EventItem = ({ event }) => {
    const navigate = useNavigate();
    const { user } = useContext(Context);

    // The source of truth is event.isFavorited from the API. We mirror it
    // into local state so optimistic updates render immediately, and re-sync
    // whenever the parent re-fetches the list.
    const [isFav, setIsFav] = useState(Boolean(event.isFavorited));
    const [pending, setPending] = useState(false);
    useEffect(() => { setIsFav(Boolean(event.isFavorited)); }, [event.isFavorited]);

    const getImageUrl = () => {
        if (!event.img) return null;
        if (event.img.startsWith('http')) return event.img;
        if (event.img.startsWith('/')) return process.env.REACT_APP_API_URL + event.img;
        return process.env.REACT_APP_API_URL + '/static/' + event.img;
    };

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        e.target.nextElementSibling?.removeAttribute('hidden');
    };

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (!user.isAuth) {
            toast.error('Пожалуйста, войдите, чтобы добавлять в избранное.');
            return;
        }
        if (pending) return;

        const prev = isFav;
        const next = !prev;
        setIsFav(next); // optimistic flip
        setPending(true);
        try {
            if (next) await addFavorite(event.id);
            else await removeFavorite(event.id);
            // event.isFavorited stays out of sync until the parent refetches,
            // but local state now reflects the truth.
        } catch (err) {
            // Rollback.
            setIsFav(prev);
            toast.error(err.response?.data?.message || 'Не удалось обновить избранное');
        } finally {
            setPending(false);
        }
    };

    const open = () => navigate(`${EVENTPOST_ROUTE}/${event.id}`);
    const imageUrl = getImageUrl();
    const primaryCategory = event.categories?.[0]?.name;
    const isFull =
        event.max_participants != null &&
        (event.registeredCount ?? 0) >= event.max_participants;

    return (
        <Col xs={12} md={6} lg={4} style={{ marginBottom: 24 }}>
            <article className="media-card" onClick={open}>
                <div className="media-card__cover-wrap">
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt="" className="media-card__cover" onError={handleImageError} />
                            <div className="media-card__cover-placeholder" hidden>
                                <CalendarIcon size={56} />
                            </div>
                        </>
                    ) : (
                        <div className="media-card__cover-placeholder">
                            <CalendarIcon size={56} />
                        </div>
                    )}
                    {primaryCategory && (
                        <span className="media-card__cover-badge">{primaryCategory}</span>
                    )}
                </div>

                <div className="media-card__body">
                    <h3 className="media-card__title">{event.title}</h3>

                    <div className="media-card__meta">
                        {event.starts && (
                            <span className="media-card__meta-item">
                                <CalendarIcon className="inline-icon" />
                                {new Date(event.starts).toLocaleDateString()}
                            </span>
                        )}
                        {event.place && (
                            <span className="media-card__meta-item">
                                <MapPinIcon className="inline-icon" />
                                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {event.place}
                                </span>
                            </span>
                        )}
                        {event.registration_required && !isFull && (
                            <span className="badge-soft badge-soft--info">Нужна регистрация</span>
                        )}
                        {isFull && (
                            <span className="badge-soft badge-soft--danger">Мест нет</span>
                        )}
                    </div>

                    <p className="media-card__excerpt">{event.description || ''}</p>

                    <div className="media-card__footer">
                        <Button
                            variant="primary"
                            className="btn-rounded-md"
                            onClick={(e) => { e.stopPropagation(); open(); }}
                        >
                            Подробнее
                        </Button>
                        <button
                            type="button"
                            className={`icon-btn-round ${isFav ? 'is-active' : ''}`}
                            onClick={handleToggleFavorite}
                            disabled={pending}
                            aria-pressed={isFav}
                            aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
                            title={isFav ? 'В избранном' : 'В избранное'}
                        >
                            <HeartIcon filled={isFav} />
                        </button>
                    </div>
                </div>
            </article>
        </Col>
    );
};

export default EventItem;
