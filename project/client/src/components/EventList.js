import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Context } from "..";
import { Row, Spinner, Alert } from "react-bootstrap";
import EventItem from "./EventItem";

const EventList = observer(({ events, loading, error }) => {
  const { events: eventsStore } = useContext(Context);

  const displayEvents = events || eventsStore.eventPost;

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (!displayEvents || displayEvents.length === 0) {
    return (
      <div className="text-center text-muted mt-4">
        Мероприятия не найдены
      </div>
    );
  }

  return (
    <Row className="g-4">
      {displayEvents.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </Row>
  );
});

export default EventList;