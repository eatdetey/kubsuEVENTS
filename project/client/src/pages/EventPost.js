import React from "react";
import { Container, Col, Row, Button, Card } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import star from '../assets/star.png';

const EventPost = () => {
    const eventpost = {
        "id": 5,
        "title": "Zaddy",
        "description": "Ооооооооооооо зеленоглазое такси ооооооооо не тормози не тормози",
        "starts": "13.12.2025",
        "place": "КубГУ",
        "status": "Опубликован",
        "img": "b30e3beb-d018-49a1-a807-637dd588d8be.jpg",
        "createdAt": "2025-05-01T19:33:51.115Z",
        "updatedAt": "2025-05-01T19:33:51.115Z",
        "watchlistId": null,
        "userId": 2
    };

    const formattedDate = new Date(eventpost.updatedAt).toLocaleString("ru-RU", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Container 
            className="d-flex justify-content-center align-items-center"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card className="p-5 position-relative" style={{ width: '100%', maxWidth: 900 }}>
                {/* Дата */}
                <div style={{ position: 'absolute', top: 10, right: 15, fontSize: 14, color: 'gray' }}>
                    Обновлено: {formattedDate}
                </div>

                <Row>
                    {/* Левая колонка с картинкой и доп. инфой */}
                    <Col md={4}>
                    <Image
                        width="100%"
                        style={{ objectFit: "cover", borderRadius: 8 }}
                        height={300}
                        src={eventpost.img}
                    />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <p>{eventpost.starts}</p>
                        <p>{eventpost.place}</p>
                        <Button variant="primary">
                        <Image width={15} height={15} src={star} />
                        </Button>
                    </div>
                    </Col>

                    <Col md={8} className="d-flex flex-column justify-content-start">
                    <h2>{eventpost.title}</h2>
                    <div className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
                        {eventpost.description}
                    </div>
                    </Col>
                </Row>
            </Card>

        </Container>
    );
};

export default EventPost;
