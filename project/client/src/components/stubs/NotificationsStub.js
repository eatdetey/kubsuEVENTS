import React, { useState } from 'react';
import { Form, Button, Badge } from 'react-bootstrap';
import CategoryMultiSelect from '../CategoryMultiSelect';

// Disabled "soon" preview for push notifications. The category multi-select
// is interactive (local state only) so users can see how the chooser will
// look, but the toggle is locked and the Save button is disabled — there is
// no backend yet.
const NotificationsStub = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const soonHint = 'Функция находится в разработке';

  return (
    <div className="app-card p-3 mt-3">
      <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
        <h3 className="section-heading mb-0">Уведомления</h3>
        <Badge bg="secondary">Скоро</Badge>
      </div>

      <Form.Check
        type="switch"
        id="push-toggle"
        label="Получать push-уведомления"
        disabled
        className="mb-3"
        title={soonHint}
      />

      <div style={{ opacity: 0.85 }}>
        <CategoryMultiSelect
          value={selectedCategories}
          onChange={setSelectedCategories}
          label="Категории, по которым хотите получать уведомления"
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2">
        <Form.Text className="text-muted mb-0">{soonHint}.</Form.Text>
        <Button
          variant="primary"
          disabled
          title={soonHint}
          style={{ borderRadius: 'var(--radius-pill)' }}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default NotificationsStub;
