import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { createNews } from "../../http/newsAPI";
import { observer } from "mobx-react-lite";

const CreateNewsPost = observer(({ show, onHide }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const addNews = async () => {
        try {
            setError('');
            
            if (!title.trim()) {
                throw new Error('Введите заголовок новости');
            }

            if (!description.trim()) {
                throw new Error('Введите текст новости');
            }

            await createNews({ title, description });
            handleClose();
            
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при создании новости');
            console.error('Ошибка:', err);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить новостной пост</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Заголовок новости"
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                        <Form.Control
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            as="textarea"
                            rows={10}
                            placeholder="Текст новости"
                            required
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={handleClose}>Закрыть</Button>
                <Button variant="outline-success" onClick={addNews}>Сохранить</Button>
            </Modal.Footer>
        </Modal>
    );
});

export default CreateNewsPost;