import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Dropdown, Col, Row } from "react-bootstrap";

const options = [
  { label: "Организатор", value: "ADMIN" },
  { label: "Репортер", value: "MODERATOR" },
  { label: "Пользователь", value: "USER" },
];

const AddRole = ({ show, onHide }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (show) {
      setSelectedRole(null);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Выдать роль пользователю</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={4}>
              <Form.Control placeholder="Пользователь" className="mt-3" />
            </Col>
            <Col xs={4} className="mt-3">
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                  {selectedRole ? selectedRole.label : "Выберите роль"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {options.map((option) => (
                    <Dropdown.Item
                      key={option.value}
                      onClick={() => setSelectedRole(option)}
                    >
                      {option.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-success" onClick={onHide}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddRole;
