import React, { useContext, useEffect, useState } from 'react';
import { Container, Spinner, Button, Form, Alert, Badge } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../index';
import { fetchProfile, updateProfile } from '../http/userAPI';
import { fetchFavorites, removeFavorite } from '../http/favoritesAPI';
import { fetchMyRegistrations } from '../http/registrationsAPI';
import { EVENT_ROUTE, EVENTPOST_ROUTE, LOGIN_ROUTE, ROLES } from '../utils/consts';
import { CalendarIcon, MapPinIcon, HeartIcon, TicketIcon } from '../components/icons/Icons';
import TicketModal from '../components/modals/TicketModal';

// First letter of username (or email local-part), upper case.
function initials(profile) {
  const src = profile?.username || profile?.email || '';
  return (src.trim()[0] || '?').toUpperCase();
}

const ROLE_CLASS = {
  [ROLES.USER]: 'role-badge--USER',
  [ROLES.EDITOR]: 'role-badge--EDITOR',
  [ROLES.MOD]: 'role-badge--MOD',
  [ROLES.SECURITY]: 'role-badge--SECURITY',
  [ROLES.ADMIN]: 'role-badge--ADMIN',
};
const RoleBadge = ({ role }) => (
  <span className={`role-badge ${ROLE_CLASS[role] || 'role-badge--USER'}`}>{role}</span>
);

const SectionHeading = ({ Icon, title, count }) => (
  <div className="d-flex align-items-center" style={{ gap: 10, marginBottom: 16 }}>
    <span style={{ color: 'var(--color-primary)' }}><Icon size={22} /></span>
    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
    {count !== undefined && count > 0 && (
      <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>({count})</span>
    )}
  </div>
);

const UserProfile = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [favError, setFavError] = useState(null);
  const [regError, setRegError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: '' });

  // Ticket modal state.
  const [ticketModalReg, setTicketModalReg] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const profileData = await fetchProfile();
        if (!alive) return;
        if (!profileData) throw new Error('Профиль не найден');
        setProfile(profileData);
        setFormData({ email: profileData.email });

        // Both lists are loaded in parallel — failures are isolated so one
        // bad endpoint doesn't blank the other block.
        const [regsRes, favsRes] = await Promise.allSettled([
          fetchMyRegistrations(),
          fetchFavorites(),
        ]);
        if (!alive) return;
        if (regsRes.status === 'fulfilled') setRegistrations(regsRes.value || []);
        else setRegError('Не удалось загрузить регистрации');
        if (favsRes.status === 'fulfilled') setFavorites(favsRes.value || []);
        else setFavError('Не удалось загрузить избранное');
      } catch (e) {
        if (!alive) return;
        setProfileError(e.message);
        user.setIsAuth(false);
        navigate(LOGIN_ROUTE);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(formData);
      setProfile(updated);
      setEditMode(false);
      user.setUser(updated);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Ошибка обновления профиля');
    }
  };

  const handleRemoveFavorite = async (eventId) => {
    const prev = favorites;
    setFavorites((p) => p.filter((ev) => ev.id !== eventId));
    try {
      await removeFavorite(eventId);
      toast.success('Удалено из избранного');
    } catch (err) {
      setFavorites(prev);
      toast.error(err.response?.data?.message || 'Не удалось убрать из избранного');
    }
  };

  const logOut = () => {
    user.setUser({});
    user.setIsAuth(false);
    localStorage.removeItem('token');
    navigate(EVENT_ROUTE);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  if (profileError) {
    return (
      <Container className="mt-4" style={{ maxWidth: 760 }}>
        <Alert variant="danger">{profileError}</Alert>
      </Container>
    );
  }
  if (!profile) {
    return (
      <Container className="mt-4" style={{ maxWidth: 760 }}>
        <Alert variant="warning">Профиль пользователя не найден</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: 760 }}>
      {/* ---------- Block 1: profile card ---------- */}
      <section className="profile-section">
        <div className="app-card" style={{ padding: 24, borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <div className="d-flex align-items-center" style={{ gap: 20 }}>
            <div className="avatar-circle" aria-hidden="true">{initials(profile)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="d-flex align-items-center flex-wrap" style={{ gap: 12, marginBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                  {profile.username || profile.email.split('@')[0]}
                </h2>
                <RoleBadge role={profile.role} />
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 8 }}>
                {profile.email}
              </div>
              {profile.createdAt && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                  С нами с {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
            {!editMode && (
              <Button
                variant="outline-primary"
                size="sm"
                className="btn-rounded-md"
                onClick={() => setEditMode(true)}
                style={{ padding: '6px 14px', fontSize: 13 }}
              >
                Изменить email
              </Button>
            )}
          </div>

          {editMode && (
            <Form onSubmit={handleSaveProfile} className="mt-3">
              <Form.Group className="mb-2">
                <Form.Label>Новый email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ borderRadius: 12 }}
                />
              </Form.Group>
              <div className="d-flex" style={{ gap: 8 }}>
                <Button type="submit" variant="primary" className="btn-rounded-md">Сохранить</Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="btn-rounded-md"
                  onClick={() => { setEditMode(false); setFormData({ email: profile.email }); }}
                >
                  Отмена
                </Button>
              </div>
            </Form>
          )}
        </div>
      </section>

      {/* ---------- Block 2: my registrations ---------- */}
      <section className="profile-section">
        <div className="app-card" style={{ padding: 24, borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <SectionHeading Icon={TicketIcon} title="Мои регистрации" count={registrations.length} />

          {regError ? (
            <Alert variant="danger" className="mb-0">{regError}</Alert>
          ) : registrations.length === 0 ? (
            <div className="text-center" style={{ padding: 16 }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Вы ещё не регистрировались на мероприятия.
              </p>
              <Button
                variant="primary"
                className="btn-rounded-md"
                onClick={() => navigate(EVENT_ROUTE)}
              >
                Найти мероприятия
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {registrations.map((r) => (
                <div
                  key={r.ticketUuid}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`${EVENTPOST_ROUTE}/${r.event.id}`)}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>
                      {r.event.title}
                    </h3>
                    <div className="d-flex flex-wrap"
                         style={{ gap: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {r.event.starts && (
                        <span className="d-inline-flex align-items-center" style={{ gap: 4 }}>
                          <CalendarIcon className="inline-icon" />
                          {new Date(r.event.starts).toLocaleString()}
                        </span>
                      )}
                      {r.isAttended
                        ? <Badge bg="success" style={{ fontWeight: 500 }}>Посетил</Badge>
                        : <Badge bg="secondary" style={{ fontWeight: 500 }}>Ожидается</Badge>}
                    </div>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="btn-rounded-md"
                    onClick={() => setTicketModalReg(r)}
                    style={{ padding: '6px 14px', fontSize: 13, flexShrink: 0 }}
                  >
                    Показать билет
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Block 3: favorites ---------- */}
      <section className="profile-section">
        <div className="app-card" style={{ padding: 24, borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          <SectionHeading Icon={HeartIcon} title="Избранное" count={favorites.length} />

          {favError ? (
            <Alert variant="danger" className="mb-0">{favError}</Alert>
          ) : favorites.length === 0 ? (
            <div className="text-center" style={{ padding: 16 }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Здесь будут сохранённые мероприятия.
              </p>
              <Button
                variant="primary"
                className="btn-rounded-md"
                onClick={() => navigate(EVENT_ROUTE)}
              >
                Перейти к мероприятиям
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {favorites.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`${EVENTPOST_ROUTE}/${ev.id}`)}
                  >
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>{ev.title}</h3>
                    <div className="d-flex flex-wrap"
                         style={{ gap: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {ev.starts && (
                        <span className="d-inline-flex align-items-center" style={{ gap: 4 }}>
                          <CalendarIcon className="inline-icon" />
                          {new Date(ev.starts).toLocaleDateString()}
                        </span>
                      )}
                      {ev.place && (
                        <span className="d-inline-flex align-items-center" style={{ gap: 4 }}>
                          <MapPinIcon className="inline-icon" />
                          {ev.place}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-btn-round"
                    onClick={() => handleRemoveFavorite(ev.id)}
                    aria-label="Убрать из избранного"
                    title="Убрать из избранного"
                    style={{ flexShrink: 0 }}
                  >
                    {/* Small × via SVG to match icon-btn-round sizing. */}
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Block 4: settings ---------- */}
      <section className="profile-section">
        <div className="app-card" style={{ padding: 24, borderRadius: 20 }}>
          <h2 className="section-heading mb-3" style={{ fontSize: 18 }}>Настройки</h2>
          <Button
            variant="danger"
            onClick={logOut}
            style={{ borderRadius: 12, padding: '10px 20px' }}
          >
            Выйти
          </Button>
        </div>
      </section>

      <TicketModal
        show={Boolean(ticketModalReg)}
        onHide={() => setTicketModalReg(null)}
        registration={ticketModalReg}
      />
    </Container>
  );
});

export default UserProfile;
