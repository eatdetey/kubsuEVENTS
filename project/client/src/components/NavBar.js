import React, { useContext } from 'react';
import { Context } from '..';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  ADMIN_ROUTE,
  EVENT_ROUTE,
  LOGIN_ROUTE,
  NEWS_ROUTE,
  USERPROFILE_ROUTE,
  ROLES,
} from '../utils/consts';
import { observer } from 'mobx-react-lite';
import { useHasRole } from '../utils/roles';

const NavBar = observer(() => {
  const { user } = useContext(Context);
  const history = useNavigate();

  // Only need to know if the user can see the admin panel link; the panel
  // itself routes through to /admin/categories and /admin/users.
  const isStaff = useHasRole(ROLES.EDITOR, ROLES.MOD, ROLES.ADMIN);

  const logOut = () => {
    user.setUser({});
    user.setIsAuth(false);
    localStorage.removeItem('token');
  };

  return (
    <Navbar
      expand="lg"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 0',
      }}
    >
      <Container>
        <Navbar.Brand
          onClick={() => history(EVENT_ROUTE)}
          style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--color-text-primary)' }}
        >
          Учебное сообщество
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Button
              variant="link"
              onClick={() => history(EVENT_ROUTE)}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              События
            </Button>
            <Button
              variant="link"
              onClick={() => history(NEWS_ROUTE)}
              style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
            >
              Новости
            </Button>
          </Nav>

          {user.isAuth ? (
            <Nav className="align-items-center" style={{ gap: 8 }}>
              {/* "Категории" and "Пользователи" links live only on the
                  admin dashboard (/admin) — keeps the top nav minimal. */}
              {isStaff && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  style={{ borderRadius: 'var(--radius-pill)' }}
                  onClick={() => history(ADMIN_ROUTE)}
                >
                  Админ панель
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => history(USERPROFILE_ROUTE)}
              >
                Профиль
              </Button>
              <Button
                variant="link"
                size="sm"
                style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}
                onClick={() => { logOut(); history(EVENT_ROUTE); }}
              >
                Выйти
              </Button>
            </Nav>
          ) : (
            <Nav>
              <Button
                variant="primary"
                size="sm"
                style={{ borderRadius: 'var(--radius-pill)' }}
                onClick={() => history(LOGIN_ROUTE)}
              >
                Войти
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

export default NavBar;
