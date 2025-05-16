import { Modal, Form, Button, Dropdown, Row, Col } from "react-bootstrap";

const CreateEventPost = ({show, onHide}) => {
    return (
         <Modal
            show={show}
            onHide={onHide}
            size="xl"
            centered
        >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Добавить новое событие 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
            <Form>
                <Row className="mt-3">
                    <Col xs={4} className="d-flex justify-content-center align-items-start">
                    <div
                        style={{
                        width: 300,
                        height: 300,
                        border: "1px dashed gray",
                        borderRadius: 8,
                        overflow: "hidden",
                        position: "relative",
                        }}
                    >
                        {/* Здесь будет изображение после загрузки */}
                        <Form.Label
                        htmlFor="image-upload"
                        style={{
                            cursor: "pointer",
                            width: "100%",
                            height: "100%",
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "gray",
                        }}
                        >
                        Загрузить<br />изображение
                        </Form.Label>

                        <Form.Control
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        style={{ display: "none" }}
                        />
                    </div>
                    </Col>

                    <Col xs={8}>
                    <Form.Control
                        placeholder="Название мероприятия"
                        className="mb-3"
                    />
                    <Form.Control
                        as="textarea"
                        rows={10}
                        placeholder="Описание мероприятия"
                        className="mb-3"
                    />
                    <Form.Label>Дата, время и место проведения</Form.Label>
                    <Form.Control
                        type="datetime-local"
                        className="mb-3"
                    />
                    <Form.Control
                        placeholder="Место проведения"
                        className="mb-3"
                    />
                    </Col>
                </Row>
            </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={onHide}>В отложенное</Button>
        <Button variant="outline-success" onClick={onHide}>Опубликовать</Button>
      </Modal.Footer>
    </Modal>
    )
}

export default CreateEventPost;