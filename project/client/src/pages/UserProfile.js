import React, { useContext, useEffect, useState } from "react";
import { Container, Card, Spinner, Button, Form, Alert, Tab, Tabs, ListGroup } from "react-bootstrap";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { fetchProfile, updateProfile } from "../http/userAPI";
import { fetchWatchlist, removeFromWatchlist } from "../http/watchlistAPI";
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
        const profileData = await fetchProfile();
        if (!profileData) throw new Error('Профиль не найден');
        
        setProfile(profileData);
        setFormData({ email: profileData.email });

        try {
          const watchlistData = await fetchWatchlist();
          // предполагаем, что watchlistData — массив с объектами, где eventpost — объект с инфо о событии
          const validWatchlist = (watchlistData || []).filter(item => 
            item?.eventpost && item.eventpost.id
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

  const handleRemove = async (eventId) => {
    try {
      await removeFromWatchlist(eventId);
      setWatchlist(prev => prev.filter(item => item.eventpost.id !== eventId));
    } catch (error) {
      alert("Ошибка при удалении из избранного");
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
                  <p><strong>Дата регистрации:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
                  
                  <Button variant="outline-primary" onClick={() => setEditMode(true)}>
                    Редактировать профиль
                  </Button>
                </>
              )}
            </Tab>

            <Tab eventKey="watchlist" title="Избранные мероприятия">
              {watchlistError && <Alert variant="danger">{watchlistError}</Alert>}
              {!watchlist.length ? (
                <p>У вас нет избранных мероприятий.</p>
              ) : (
                <ListGroup>
                  {watchlist.map(item => (
                    <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{item.eventpost.title}</h5>
                        <p>{item.eventpost.description.length > 150 ? 
                          item.eventpost.description.slice(0, 150) + '...' : item.eventpost.description}</p>
                        <small>Место: {item.eventpost.place}</small>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleRemove(item.eventpost.id)}>
                        Удалить
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
});

export default UserProfile;
