import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Context } from "..";
import { Row } from "react-bootstrap";
import EventItem from "./EventItem";

const EventList = observer(() => {
  const { events } = useContext(Context);

  return (
    <Row className="d-flex">
      {events.eventPost?.map(event => (
        <EventItem key={event.id} events={event} />
      ))}
    </Row>
  );
});

export default EventList;
