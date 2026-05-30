import React, { useContext, useState } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '..';
import CreateEventPost from '../components/modals/CreateEventPost';
import CreateNewsPost from '../components/modals/CreateNewsPost';
import { ROLES, ADMIN_CATEGORIES_ROUTE, ADMIN_USERS_ROUTE } from '../utils/consts';
import { useHasRole } from '../utils/roles';

// Admin hub. The route itself is restricted to EDITOR/MOD/ADMIN — the
// individual cards then check finer-grained permissions before rendering.
const Admin = observer(() => {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [eventVisible, setEventVisible] = useState(false);
  const [newsVisible, setNewsVisible] = useState(false);

  const canCreateEvent = useHasRole(ROLES.MOD, ROLES.ADMIN);
  const canCreateNews = useHasRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN);
  const canManageCategories = useHasRole(ROLES.MOD, ROLES.ADMIN);
  const isAdmin = useHasRole(ROLES.ADMIN);

  const Card = ({ title, description, action }) => (
    <Col xs={12} md={6} lg={4} className="mb-3">
      <div className="app-card p-3 h-100 d-flex flex-column">
        <h3 className="mb-1" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
        <p className="flex-grow-1" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {description}
        </p>
        {action}
      </div>
    </Col>
  );

  return (
    <Container className="mt-4" style={{ maxWidth: 1100 }}>
      <h2 className="mb-1" style={{ fontWeight: 700 }}>Админ-панель</h2>
      <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Привет, <strong>{user.user?.username || user.user?.email}</strong>. Ваша роль: <code>{user.role}</code>.
      </p>

      <Row>
        {canCreateNews && (
          <Card
            title="Новый пост в новостях"
            description="Опубликовать новость. EDITOR редактирует только свои; MOD и ADMIN — любые."
            action={
              <Button
                variant="primary"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => setNewsVisible(true)}
              >
                Создать новость
              </Button>
            }
          />
        )}
        {canCreateEvent && (
          <Card
            title="Новое мероприятие"
            description="Создать событие. Доступно для MOD и ADMIN."
            action={
              <Button
                variant="primary"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => setEventVisible(true)}
              >
                Создать мероприятие
              </Button>
            }
          />
        )}
        {canManageCategories && (
          <Card
            title="Категории"
            description="Управлять списком категорий: добавлять, переименовывать, удалять (только ADMIN)."
            action={
              <Button
                variant="outline-primary"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => navigate(ADMIN_CATEGORIES_ROUTE)}
              >
                Открыть
              </Button>
            }
          />
        )}
        {isAdmin && (
          <Card
            title="Пользователи и роли"
            description="Просмотреть всех пользователей и менять их роли."
            action={
              <Button
                variant="outline-primary"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => navigate(ADMIN_USERS_ROUTE)}
              >
                Открыть
              </Button>
            }
          />
        )}
      </Row>

      <CreateEventPost show={eventVisible} onHide={() => setEventVisible(false)} />
      <CreateNewsPost show={newsVisible} onHide={() => setNewsVisible(false)} />
    </Container>
  );
});

export default Admin;
