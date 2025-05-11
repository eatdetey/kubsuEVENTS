import React from "react";
import { Button, Card, Col } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import star from '../assets/star.png'
import { useNavigate } from 'react-router-dom';
import { EVENTPOST_ROUTE } from "../utils/consts";
import { toast } from 'react-toastify';

const EventItem = ({events}) => {
    const history = useNavigate()
    return (
        <Col md={3} className={"mt-3"} onClick={() => history(EVENTPOST_ROUTE + '/' + events.id)}>
            <Card style={{width: 220, cursor: 'pointer'}} border={"light"}>
                <Image width={220} height={220} src={events.img} />
                <div className="md-1 d-flex justify-content-between">
                    <div>{events.title}</div>
                    <div className="d-flex">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation()
                                toast.success('Добавлено в избранное!');
                            }
                        }
                        >
                            <Image width={15} height={15} src={star}/>
                        </Button>
                    </div>
                </div>
                <div>{events.description}</div>
            </Card>
        </Col>
    )
}

export default EventItem;
