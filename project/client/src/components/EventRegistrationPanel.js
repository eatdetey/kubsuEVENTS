import React, { useContext, useEffect, useState } from 'react';
import { Button, Spinner, Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';
import { Context } from '..';
import {
  registerForEvent,
  fetchMyTicket,
  cancelRegistration,
} from '../http/registrationsAPI';

const TicketCard = ({ ticket, onCancel, cancelDisabled }) => (
  <div className="app-card p-4 d-flex flex-column align-items-center" style={{ gap: 16 }}>
    <h3 className="section-heading mb-0">Ваш билет</h3>
    <QRCodeSVG
      value={ticket.ticketUuid}
      size={220}
      includeMargin
      style={{ background: '#ffffff', borderRadius: 'var(--radius-md)' }}
    />
    <div className="text-center" style={{ maxWidth: 340 }}>
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
        Покажите QR-код организаторам на входе. Билет действителен один раз.
      </p>
      <code style={{ fontSize: 12, color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
        {ticket.ticketUuid}
      </code>
    </div>
    {ticket.isAttended ? (
      <Badge bg="success" style={{ fontWeight: 500 }}>Посещение отмечено</Badge>
    ) : (
      <Button
        variant="outline-danger"
        className="btn-rounded-md"
        onClick={onCancel}
        disabled={cancelDisabled}
      >
        {cancelDisabled ? 'Отмена…' : 'Отменить регистрацию'}
      </Button>
    )}
  </div>
);

// Drop-in panel for the event detail page. Shows nothing when the event has
// no registration requirement.
const EventRegistrationPanel = observer(({ event, onCountChange }) => {
  const { user } = useContext(Context);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // For an event where registration_required = false we render nothing.
  useEffect(() => {
    if (!event.registration_required) { setLoading(false); return; }
    if (!user.isAuth) { setLoading(false); return; }

    let alive = true;
    setLoading(true);
    fetchMyTicket(event.id)
      .then((data) => {
        if (!alive) return;
        // After the Stage-5 split, the favorites table is separate from
        // event_registrations, so any returned row IS a real registration.
        // We keep the registeredAt check as a defensive guard.
        setTicket(data.registeredAt ? data : null);
      })
      .catch((err) => {
        if (!alive) return;
        if (err.response?.status === 404) {
          setTicket(null);
        } else {
          toast.error(err.response?.data?.message || 'Не удалось загрузить статус регистрации');
        }
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [event.id, event.registration_required, user.isAuth]);

  if (!event.registration_required) return null;

  // Anonymous users get the prompt — no fetch happened, no spinner.
  if (!user.isAuth) {
    return (
      <div className="app-card p-3">
        <div style={{ color: 'var(--color-text-muted)' }}>
          <em>Войдите, чтобы зарегистрироваться на мероприятие.</em>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-card p-3 d-flex justify-content-center">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  const seatsCap = event.max_participants;
  const seatsTaken = event.registeredCount ?? 0;
  const isFull = seatsCap != null && seatsTaken >= seatsCap;

  const handleRegister = async () => {
    setBusy(true);
    try {
      const res = await registerForEvent(event.id);
      setTicket({
        ticketUuid: res.ticketUuid,
        eventId: res.eventId,
        registeredAt: res.registeredAt,
        isAttended: false,
        event: { title: event.title, date: event.starts },
      });
      onCountChange?.(+1);
      toast.success('Регистрация подтверждена');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        // Either already registered (race) or full.
        toast.warn(msg || 'Регистрация невозможна');
        // Try to recover state by refetching the ticket.
        try {
          const data = await fetchMyTicket(event.id);
          if (data.registeredAt) setTicket(data);
        } catch (_) { /* ignore */ }
      } else if (status === 400) {
        toast.warn(msg || 'Регистрация не требуется');
      } else {
        toast.error(msg || 'Не удалось зарегистрироваться');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Отменить регистрацию?')) return;
    setBusy(true);
    try {
      await cancelRegistration(event.id);
      setTicket(null);
      onCountChange?.(-1);
      toast.success('Регистрация отменена');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 400 && msg?.toLowerCase().includes('check-in')) {
        toast.warn('Нельзя отменить после прохода по QR');
      } else {
        toast.error(msg || 'Не удалось отменить регистрацию');
      }
    } finally {
      setBusy(false);
    }
  };

  if (ticket) {
    return <TicketCard ticket={ticket} onCancel={handleCancel} cancelDisabled={busy} />;
  }

  if (isFull) {
    return (
      <div className="app-card p-3 d-flex flex-column align-items-start" style={{ gap: 8 }}>
        <Badge bg="danger">Мест нет</Badge>
        <small style={{ color: 'var(--color-text-muted)' }}>
          Все {seatsCap} мест заняты.
        </small>
      </div>
    );
  }

  return (
    <div className="app-card p-4 d-flex flex-column" style={{ gap: 12 }}>
      <div>
        <h3 className="section-heading mb-1">Регистрация</h3>
        {seatsCap != null && (
          <small style={{ color: 'var(--color-text-muted)' }}>
            Свободно <strong>{seatsCap - seatsTaken}</strong> из {seatsCap} мест
          </small>
        )}
      </div>
      <Button
        variant="primary"
        onClick={handleRegister}
        disabled={busy}
        className="btn-rounded-md btn-block-full"
        style={{ fontSize: 16 }}
      >
        {busy ? 'Регистрация…' : 'Зарегистрироваться'}
      </Button>
    </div>
  );
});

export default EventRegistrationPanel;
