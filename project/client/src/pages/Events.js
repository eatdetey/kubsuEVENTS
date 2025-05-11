import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import TypeBar from "../components/TypeBar";
import EventList from "../components/EventList";

const Events = () => {
  return (
    <Container>
        <Row className="mt-3">
            <Col md={3}>
                <TypeBar />
            </Col>
            <Col md={9}>
                <EventList />
            </Col>
        </Row>

    </Container>
  )
}

export default Events;
