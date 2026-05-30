import React from 'react';
import { Modal, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

// Shows the QR code for an event_registrations row. Reused from the personal
// cabinet's "Показать билет" action — the same ticket_uuid value the security
// scanner will be looking for.
const TicketModal = ({ show, onHide, registration }) => {
  if (!registration) return null;
  const { ticketUuid, registeredAt, isAttended, event } = registration;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18 }}>{event?.title || 'Билет'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center" style={{ padding: 24 }}>
        <QRCodeSVG
          value={ticketUuid}
          size={240}
          includeMargin
          style={{ background: '#fff', borderRadius: 12 }}
        />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '16px 0 8px' }}>
          Покажите QR-код на входе. Билет действителен один раз.
        </p>
        <code style={{ fontSize: 11, color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
          {ticketUuid}
        </code>
        <div style={{ marginTop: 16 }}>
          {isAttended
            ? <Badge bg="success" style={{ fontWeight: 500 }}>Посещение отмечено</Badge>
            : <Badge bg="secondary" style={{ fontWeight: 500 }}>Ожидается</Badge>}
        </div>
        {registeredAt && (
          <small style={{ display: 'block', marginTop: 8, color: 'var(--color-text-muted)' }}>
            Зарегистрирован {new Date(registeredAt).toLocaleString()}
          </small>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TicketModal;
