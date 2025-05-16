import React, { useState } from "react";
import { Button, Container, Card } from "react-bootstrap";
import CreateEventPost from "../components/modals/CreateEventPost";
import CreateNewsPost from "../components/modals/CreateNewsPost";
import AddRole from "../components/modals/AddRole";

const Admin = () => {
  const [eventVisible, setEventVisible] = useState(false);
  const [newsVisible, setNewsVisible] = useState(false);
  const [addRoleVisible, setAddRoleVisible] = useState(false);

  return (
    <Container 
      className="d-flex justify-content-center align-items-center" 
      style={{ minHeight: "80vh" }}
    >
      <Card 
        style={{ 
          width: "100%", 
          maxWidth: "500px", 
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
        }}
        className="p-4"
      >
        <Card.Body className="d-flex flex-column">
          <Button 
            variant={"primary"} 
            className="mt-2 mb-2"
            onClick={() => setEventVisible(true)}
            style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
          >
            Добавить пост в календарь событий
          </Button>
          <Button 
            variant={"primary"} 
            className="mt-2 mb-2"
            onClick={() => setNewsVisible(true)}
            style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
          >
            Добавить пост в ленту новостей
          </Button>
          <Button 
            variant={"primary"} 
            className="mt-2 mb-2"
            onClick={() => setAddRoleVisible(true)}
            style={{ backgroundColor: "#0d6efd", borderColor: "#0d6efd" }}
          >
            Выдать роль пользователю
          </Button>
        </Card.Body>
      </Card>

      <CreateEventPost show={eventVisible} onHide={() => setEventVisible(false)}/>
      <CreateNewsPost show={newsVisible} onHide={() => setNewsVisible(false)}/>
      <AddRole show={addRoleVisible} onHide={() => setAddRoleVisible(false)}/>
    </Container>
  );
};

export default Admin;