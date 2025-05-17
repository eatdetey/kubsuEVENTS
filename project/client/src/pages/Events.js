import React, { useContext, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TypeBar from "../components/TypeBar";
import EventList from "../components/EventList";
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { fetchEvents } from "../http/eventAPI";

const Events = observer(() => {
  const {events} = useContext(Context)

  useEffect(() => {
    fetchEvents().then(data => events.setEventPost(data))
  }, [])

  return (
    <Container className="mt-4">
      <h2 className="text-center">События</h2>
        <Row className="mt-4">
            <Col md={12}>
                <EventList />
            </Col>
        </Row>

    </Container>
  )
}
)

export default Events;
