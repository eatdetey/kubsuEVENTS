import React, { useContext } from "react";
import { Context } from "..";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button } from 'react-bootstrap';
import { NavLink, useNavigate } from "react-router-dom";
import { ADMIN_ROUTE, EVENT_ROUTE, LOGIN_ROUTE, NEWS_ROUTE, USERPROFILE_ROUTE } from "../utils/consts";
import { observer } from "mobx-react-lite";

const NavBar = observer(() => {
    const {user} = useContext(Context)
    const history = useNavigate()

    const logOut = () => {
        user.setUser({})
        user.setIsAuth(false)
        localStorage.removeItem('token')
    }

    return (
        <>
      <Navbar bg="primary" data-bs-theme="dark">
        <Container>
            <Nav className="ml-auto">
                <Button 
                    variant={"outline-light"} 
                    onClick={() => history(EVENT_ROUTE)}
                    className="ml-2 me-2"
                >
                    Календарь событий
                </Button>
                <Button 
                    variant={"outline-light"} 
                    onClick={() => history(NEWS_ROUTE)}
                    className="ml-2 me-2"
                >
                    Лента новостей
                </Button>
            </Nav>
          {user.isAuth ?
          <Nav className="ml-auto">
            <Button 
                variant={"outline-light"} 
                onClick={() => history(ADMIN_ROUTE)}
                className="ml-2 me-2"
            >
                Админ панель
            </Button>
            <Button 
                variant={"outline-light"} 
                onClick={() => history(USERPROFILE_ROUTE)}
                className="ml-2 me-2"
            >
                Личный кабинет
            </Button>
            <Button
                variant={"outline-light"}
                onClick={() => {
                    logOut() 
                    history(EVENT_ROUTE)
                }}
                className="ml-2"
            >
                Выйти
            </Button>
          </Nav>
          :
          <Nav className="ml-auto">
            <Button 
                variant={"outline-light"} 
                onClick={() => history(LOGIN_ROUTE)}
            >
                Авторизация
            </Button>
          </Nav>
          }
        </Container>
      </Navbar>
      </>
    )
}
)

export default NavBar;
