import { useState, useRef, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { createEvent, updateEvent } from '../../http/eventAPI';
import { observer } from 'mobx-react-lite';
import CategoryMultiSelect from '../CategoryMultiSelect';
import LocationPicker from '../LocationPicker';
import CrosspostStub from '../stubs/CrosspostStub';

const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return process.env.REACT_APP_API_URL + img;
    return process.env.REACT_APP_API_URL + '/static/' + img;
};

const validateMaxParticipants = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0) return 'Должно быть положительным целым числом';
    return null;
};

const CreateEventPost = observer(({ show, onHide, editing = false, existingPost = null, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [place, setPlace] = useState('');
    const [starts, setStarts] = useState('');
    const [img, setImg] = useState(null);
    const [categoryIds, setCategoryIds] = useState([]);

    // Stage 3 geo / registration fields.
    const [registrationRequired, setRegistrationRequired] = useState(false);
    const [maxParticipants, setMaxParticipants] = useState('');
    // Map pin: null while no marker is placed, else { lat, lon } numbers.
    const [mapPin, setMapPin] = useState(null);

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!show) return;
        if (editing && existingPost) {
            setTitle(existingPost.title || '');
            setDescription(existingPost.description || '');
            setPlace(existingPost.place || '');
            setStarts(existingPost.starts ? new Date(existingPost.starts).toISOString().slice(0, 16) : '');
            setPreview(existingPost.img ? getImageUrl(existingPost.img) : null);
            setCategoryIds((existingPost.categories || []).map((c) => c.id));
            setRegistrationRequired(Boolean(existingPost.registration_required));
            setMaxParticipants(
                existingPost.max_participants != null ? String(existingPost.max_participants) : ''
            );
            // The server returns DECIMAL as a string ("45.0355000") — coerce
            // to numbers so the picker treats them as a valid initial pin.
            const lat = existingPost.latitude != null ? Number(existingPost.latitude) : null;
            const lon = existingPost.longitude != null ? Number(existingPost.longitude) : null;
            setMapPin(
                Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null
            );
        } else {
            setTitle(''); setDescription(''); setPlace(''); setStarts('');
            setImg(null); setPreview(null);
            setCategoryIds([]);
            setRegistrationRequired(false);
            setMaxParticipants('');
            setMapPin(null);
        }
        setError('');
        setSubmitting(false);
    }, [show, editing, existingPost]);

    const selectFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImg(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Live inline errors — recomputed on every render. The map picker
    // produces only valid lat/lon pairs by construction, so there is no
    // lat/lon error branch anymore.
    const maxError = registrationRequired ? validateMaxParticipants(maxParticipants) : null;
    const hasInlineError = Boolean(maxError);

    const handleSubmit = async () => {
        try {
            setError('');
            if (hasInlineError) {
                setError('Исправьте ошибки в полях ниже');
                return;
            }
            setSubmitting(true);

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('place', place);
            const startsISO = new Date(starts).toISOString();
            formData.append('starts', startsISO);
            if (img) formData.append('img', img);
            formData.append('categoryIds', JSON.stringify(categoryIds));

            // Geo / registration. The server's extractEventGeoFields accepts
            // "true"/"false" strings (multipart) and string numbers.
            formData.append('registration_required', registrationRequired ? 'true' : 'false');
            if (registrationRequired && maxParticipants !== '') {
                formData.append('max_participants', String(parseInt(maxParticipants, 10)));
            }
            if (mapPin) {
                formData.append('latitude', String(mapPin.lat));
                formData.append('longitude', String(mapPin.lon));
            } else if (editing && existingPost && (existingPost.latitude != null || existingPost.longitude != null)) {
                // Edit-mode clear: existing event had coords, the user
                // removed the marker. Empty string tells the server to null
                // the column (see eventGeoFields.js).
                formData.append('latitude', '');
                formData.append('longitude', '');
            }

            const result = editing && existingPost?.id
                ? await updateEvent(existingPost.id, formData)
                : await createEvent(formData);
            onUpdate?.(result);
            handleClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при сохранении');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
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
                                    border: '1px dashed gray',
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: preview ? `url(${preview}) center/cover` : 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {!preview && (
                                    <Form.Label
                                        style={{
                                            cursor: 'pointer',
                                            width: '100%',
                                            height: '100%',
                                            margin: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            color: 'gray',
                                        }}
                                    >
                                        Загрузить изображение
                                    </Form.Label>
                                )}
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={selectFile}
                                    required={!editing}
                                />
                            </div>
                        </Col>

                        <Col xs={8}>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Название мероприятия"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    as="textarea"
                                    rows={6}
                                    placeholder="Описание мероприятия"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Дата и время проведения</Form.Label>
                                <Form.Control
                                    value={starts}
                                    onChange={(e) => setStarts(e.target.value)}
                                    type="datetime-local"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={place}
                                    onChange={(e) => setPlace(e.target.value)}
                                    placeholder="Место проведения"
                                    required
                                />
                            </Form.Group>

                            <CategoryMultiSelect value={categoryIds} onChange={setCategoryIds} />

                            {/* Registration ----------------------------------- */}
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="evt-reg-required"
                                    label="Требуется регистрация"
                                    checked={registrationRequired}
                                    onChange={(e) => setRegistrationRequired(e.target.checked)}
                                />
                            </Form.Group>
                            {registrationRequired && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Максимум участников</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(e.target.value)}
                                        placeholder="Опционально"
                                        isInvalid={Boolean(maxError)}
                                    />
                                    <Form.Control.Feedback type="invalid">{maxError}</Form.Control.Feedback>
                                    <Form.Text className="text-muted">
                                        Оставьте пустым, чтобы не ограничивать количество мест.
                                    </Form.Text>
                                </Form.Group>
                            )}

                            {/* Geo — pin on map instead of typed coords. */}
                            <Form.Group className="mb-3">
                                <Form.Label>Место на карте</Form.Label>
                                <LocationPicker value={mapPin} onChange={setMapPin} height={260} />
                            </Form.Group>

                            <CrosspostStub />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={handleClose}>Закрыть</Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || hasInlineError}
                >
                    {submitting ? 'Сохранение…' : (editing ? 'Сохранить' : 'Опубликовать')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

export default CreateEventPost;
