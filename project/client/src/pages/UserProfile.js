import React, { useContext, useEffect, useState } from "react";
import { Container, Card, Spinner, Button, Form, Alert, Tab, Tabs } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { fetchProfile, updateProfile, fetchWatchlist } from "../http/userAPI";
import EventList from "../components/EventList";
import { useNavigate } from "react-router-dom";

const UserProfile = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [watchlistError, setWatchlistError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем профиль
        const profileData = await fetchProfile();
        if (!profileData) throw new Error('Профиль не найден');
        
        setProfile(profileData);
        setFormData({ email: profileData.email });

        // Загружаем watchlist
        try {
          const watchlistData = await fetchWatchlist();
          // Фильтруем null и undefined
          const validWatchlist = (watchlistData || []).filter(item => 
            item?.event_post && item.event_post.id
          );
          setWatchlist(validWatchlist);
        } catch (watchlistErr) {
          console.error('Watchlist load error:', watchlistErr);
          setWatchlist([]);
          setWatchlistError('Ошибка загрузки избранного');
        }
      } catch (profileErr) {
        console.error('Profile load error:', profileErr);
        setProfileError(profileErr.message);
        user.setIsAuth(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateProfile(formData);
      if (!updatedProfile) {
        throw new Error('Не удалось обновить профиль');
      }
      setProfile(updatedProfile);
      setEditMode(false);
      user.setUser(updatedProfile);
    } catch (e) {
      setProfileError(e.response?.data?.message || 'Ошибка обновления профиля');
    }
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
      <Container className="mt-4">
        <Alert variant="danger">
          {profileError}
          <Button 
            variant="outline-danger" 
            className="ms-3"
            onClick={() => window.location.reload()}
          >
            Повторить
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          Профиль пользователя не найден
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title as="h2" className="mb-4">Личный кабинет</Card.Title>
          
          <Tabs defaultActiveKey="profile" className="mb-3">
            <Tab eventKey="profile" title="Профиль">
              {editMode ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit">
                      Сохранить
                    </Button>
                    <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                      Отмена
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Роль:</strong> {profile.role}</p>
                  <p><strong>Дата регистрации:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
                  
                  <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                    Редактировать профиль
                  </Button>
                </>
              )}
            </Tab>

            <Tab eventKey="watchlist" title="Избранные мероприятия">
              {watchlistError ? (
                <Alert variant="danger">{watchlistError}</Alert>
              ) : watchlist.length > 0 ? (
                <EventList 
                  events={watchlist.map(item => item.event_post).filter(Boolean)} 
                />
              ) : (
                <p className="text-muted">У вас пока нет сохраненных мероприятий</p>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default UserProfile;