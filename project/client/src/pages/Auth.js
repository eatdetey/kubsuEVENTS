import React, { useContext, useState } from "react";
import { Button, Container, Form, Row } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { EVENT_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE } from "../utils/consts";
import { login, registration } from "../http/userAPI";
import { observer } from "mobx-react-lite";
import { Context } from "../index";

const Auth = observer(() => {
    const {user} = useContext(Context)
    const history = useNavigate()
    const location = useLocation()
    const isLogin = location.pathname === LOGIN_ROUTE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const click = async () => {
        try {
            let data
            if (isLogin) {
                data = await login(email, password);
            } else {
                data = await registration(email, password);
            }
            // Pass the decoded JWT payload — NOT the store instance. Passing
            // `user` here would set this._user = this on the store, and the
            // `role` getter (returns this._user.role) would recurse, triggering
            // "[MobX] Cycle detected in computation UserEvent.role".
            user.setUser(data)
            user.setIsAuth(true)
            history(EVENT_ROUTE)
        } catch (e) {
            alert(e.response?.data?.message || e.message || 'Ошибка авторизации')
        }
    }

  return (
    <Container 
        className="d-flex justify-content-center align-items-center"
        style={{height:window.innerHeight-54}}
    >
        <Card style={{width: 600}} className="p-5">
            <h2 className="m-auto">{isLogin ? 'Авторизация' : 'Регистрация'}</h2>
            <Form className="d-flex flex-column">
                <Form.Control 
                    className="mt-2"
                    placeholder="Введите ваш email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Form.Control 
                    className="mt-2"
                    placeholder="Введите ваш пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                />
                <Row className="d-flex justify-content-between align-items-center mt-3">
                    {isLogin ? (
                        <div className="col-auto">
                        Нет аккаунта? <NavLink to={REGISTRATION_ROUTE}>Зарегистрироваться</NavLink>
                        </div>
                    ) : (
                        <div className="col-auto">
                        Есть аккаунт? <NavLink to={LOGIN_ROUTE}>Войти</NavLink>
                        </div>
                    )}
                    <div className="col-auto">
                        <Button 
                            variant="outline-success"
                            onClick={click}
                        >
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                        </Button>
                    </div>
                </Row>

            </Form>
        </Card>
    </Container>
  )
  
}
)

export default Auth;
