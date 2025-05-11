import React from "react";
import { Button, Container } from "react-bootstrap";

const Admin = () => {
  return (
    <Container className="d-flex flex-column">
        <Button>Добавить пост в календарь событий</Button>
        <Button>Добавить пост в ленту новостей</Button>
        <Button>Выдать роль пользователю</Button>
    </Container>
  )
}

export default Admin;
