import React from "react";
import { Button, Card, Col } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import star from '../assets/star.png';
import { useNavigate } from 'react-router-dom';
import { EVENTPOST_ROUTE } from "../utils/consts";
import { toast } from 'react-toastify';

const EventItem = ({ event }) => {
    const history = useNavigate();
    
    const handleImageError = (e) => {
        e.target.src = '/placeholder.png';
    };

    const getImageUrl = () => {
        if (!event.img) return '/placeholder.png';
        
        if (event.img.startsWith('http')) {
            return event.img;
        }
        
        if (event.img.startsWith('/')) {
            return process.env.REACT_APP_API_URL + event.img;
        }
        
        return process.env.REACT_APP_API_URL + '/static/' + event.img;
    };

    const imageUrl = getImageUrl();

    return (
        <Col md={4} className="mt-3" onClick={() => history(EVENTPOST_ROUTE + '/' + event.id)}>
            <Card style={{ width: 250, height: 350, cursor: 'pointer' }} border="light">
                <Image 
                    width={250} 
                    height={350} 
                    src={imageUrl}
                    onError={handleImageError}
                    thumbnail
                />
                <div className="md-1 d-flex justify-content-between align-items-center mt-2">
                    <div className="text-truncate" style={{ maxWidth: '150px' }}>{event.title}</div>
                    <div className="d-flex">
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.success('Добавлено в избранное!');
                            }}
                        >
                            <Image width={15} height={15} src={star} />
                        </Button>
                    </div>
                </div>
                <div className="text-muted small mt-1 text-truncate">
                    {event.description || 'Нет описания'}
                </div>
            </Card>
        </Col>
    );
};

export default EventItem;