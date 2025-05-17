import { useState, useRef, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";
import { createEvent, updateEvent } from "../../http/eventAPI"; // ✅ Добавь updateEvent
import { observer } from "mobx-react-lite";

const CreateEventPost = observer(({ show, onHide, editing = false, existingPost = null, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [place, setPlace] = useState('');
    const [starts, setStarts] = useState('');
    const [img, setImg] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (editing && existingPost) {
            setTitle(existingPost.title || '');
            setDescription(existingPost.description || '');
            setPlace(existingPost.place || '');
            setStarts(existingPost.starts ? new Date(existingPost.starts).toISOString().slice(0, 16) : '');
            setPreview(existingPost.img ? getImageUrl(existingPost.img) : null);
        }
    }, [editing, existingPost]);

    const getImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return process.env.REACT_APP_API_URL + img;
        return process.env.REACT_APP_API_URL + '/static/' + img;
    };

    const selectFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImg(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            setError('');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('place', place);
            const startsISO = new Date(starts).toISOString();
            formData.append('starts', startsISO);
            if (img) formData.append('img', img);

            if (editing && existingPost?.id) {
                const updated = await updateEvent(existingPost.id, formData);
                onUpdate?.(updated);
            } else {
                await createEvent(formData);
            }

            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при сохранении');
            console.error('Ошибка:', err);
        }
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setPlace('');
        setStarts('');
        setImg(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>{editing ? 'Редактировать событие' : 'Добавить новое событие'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
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
                                    background: preview ? `url(${preview}) center/cover` : 'none'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {!preview && (
                                    <Form.Label
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
                                        Загрузить изображение
                                    </Form.Label>
                                )}
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={selectFile}
                                    required={!editing} // только при создании
                                />
                            </div>
                        </Col>

                        <Col xs={8}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Название мероприятия"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    as="textarea"
                                    rows={10}
                                    placeholder="Описание мероприятия"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Дата и время проведения</Form.Label>
                                <Form.Control
                                    value={starts}
                                    onChange={e => setStarts(e.target.value)}
                                    type="datetime-local"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={place}
                                    onChange={e => setPlace(e.target.value)}
                                    placeholder="Место проведения"
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={handleSubmit}>
                    {editing ? 'Сохранить' : 'Опубликовать'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

export default CreateEventPost;
