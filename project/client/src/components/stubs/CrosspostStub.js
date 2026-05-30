import React from 'react';
import { Form, Badge } from 'react-bootstrap';

// Disabled "soon" preview for the cross-posting feature. The underlying
// integration (server modules for VK + Telegram) is planned but not active.
// Activating the feature is a matter of wiring real state / submit handlers
// here — the surrounding form makes no assumptions about its values.
const CrosspostStub = () => {
  return (
    <div className="mt-3" style={{
      borderTop: '1px solid var(--color-border)',
      paddingTop: 12,
    }}>
      <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
        <strong style={{ color: 'var(--color-text-primary)' }}>
          Публикация в социальных сетях
        </strong>
        <Badge bg="secondary">Скоро</Badge>
      </div>

      <Form.Check
        type="checkbox"
        id="crosspost-vk"
        label={<>ВКонтакте <Badge bg="light" text="secondary" className="ms-1">Скоро</Badge></>}
        disabled
      />
      <Form.Check
        type="checkbox"
        id="crosspost-tg"
        label={<>Telegram <Badge bg="light" text="secondary" className="ms-1">Скоро</Badge></>}
        disabled
      />

      <Form.Text className="text-muted d-block mt-1">
        Функция находится в разработке.
      </Form.Text>
    </div>
  );
};

export default CrosspostStub;
