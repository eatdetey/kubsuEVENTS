import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Context } from "..";
import ListGroup from 'react-bootstrap/ListGroup';

const TypeBar = observer(() => {
    const { events } = useContext(Context);

    const statuses = [...new Set(events.eventPost.map(event => event.status))];

    return (
        <ListGroup className="mt-3">
            {statuses.map(status => (
                <ListGroup.Item key={status}>
                    {status}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
});

export default TypeBar;
