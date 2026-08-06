import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import { eventsData } from './data.js';
import {
  BookingStatus,
  type Booking,
  type CreateBookingRequest,
} from '../src/models/booking.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3100);

app.use(cors());
app.use(express.json());

const bookings: Booking[] = [];

app.get('/api/v1/events', (_req: Request, res: Response) => {
  res.json(eventsData);
});

app.get('/api/v1/events/:id', (req: Request, res: Response) => {
  const event = eventsData.find((item) => item.id === req.params.id);
  if (!event) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }
  res.json(event);
});

app.get('/api/v1/events-error', (_req: Request, res: Response) => {
  res.status(500).json({ error: 'Error de servidor simulado' });
});

app.post('/api/v1/bookings', (req: Request, res: Response) => {
  const { eventId, customerName, customerEmail, quantity, unitPrice } =
    (req.body ?? {}) as Partial<CreateBookingRequest>;

  if (
    !eventId ||
    !customerName ||
    !customerEmail ||
    typeof quantity !== 'number' ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    res.status(400).json({ error: 'Payload de reserva inválido' });
    return;
  }

  const event = eventsData.find((item) => item.id === eventId);
  if (!event) {
    res.status(404).json({ error: 'Evento no encontrado' });
    return;
  }

  const available = event.capacity - event.ticketsSold;
  if (quantity > available) {
    res.status(409).json({ error: 'No hay entradas suficientes para el evento.' });
    return;
  }

  const price = typeof unitPrice === 'number' ? unitPrice : event.price;
  const booking: Booking = {
    id: `bk-${Date.now()}`,
    eventId,
    customerName,
    customerEmail,
    quantity,
    unitPrice: price,
    totalPrice: price * quantity,
    status: BookingStatus.CONFIRMED,
    createdAt: new Date(),
  };

  bookings.push(booking);
  event.ticketsSold += quantity;

  res.status(201).json(booking);
});

app.listen(PORT, () => {
  console.log(`Mock API Ticketera corriendo en http://localhost:${PORT}`);
});
