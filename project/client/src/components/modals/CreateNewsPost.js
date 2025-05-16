import { Modal, Form, Button } from "react-bootstrap";

const CreateNewsPost = ({show, onHide}) => {
    return (
         <Modal
         show={show}
         onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Добавить новостной пост 
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
            <Form>
                <Form.Control
                        placeholder="Заголовок"
                        className="mb-3"
                    />
                <Form.Control
                    as="textarea"
                    rows={10}
                    placeholder=""
                    className="mb-3"
                />
            </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={onHide}>В отложенное</Button>
        <Button variant="outline-success" onClick={onHide}>Сохранить</Button>
      </Modal.Footer>
    </Modal>
    )
}

export default CreateNewsPost;