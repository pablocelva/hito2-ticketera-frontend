import express from 'express';
import cors from 'cors';
import { eventsData } from './data.js';

const app = express();
const PORT = 3100;

app.use(cors());
app.use(express.json());

const bookings = [];

// Cartelera completa
app.get('/api/v1/events', (_req, res) => {
  res.json(eventsData);
});

// Detalle de un evento (404 si no existe)
app.get('/api/v1/events/:id', (req, res) => {
  const event = eventsData.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }
  res.json(event);
});

// Endpoint de error simulado (para probar el flujo de error en vivo)
app.get('/api/v1/events-error', (_req, res) => {
  res.status(500).json({ error: 'Error de servidor simulado' });
});

// Creación de reserva (simula TicketPool.reserve + OrderService)
app.post('/api/v1/bookings', (req, res) => {
  const { eventId, customerName, customerEmail, quantity, unitPrice } = req.body ?? {};

  if (!eventId || !customerName || !customerEmail || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Payload de reserva inválido' });
  }

  const event = eventsData.find((item) => item.id === eventId);
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }

  const available = event.capacity - event.ticketsSold;
  if (quantity > available) {
    return res.status(409).json({ error: 'No hay entradas suficientes para el evento.' });
  }

  const price = typeof unitPrice === 'number' ? unitPrice : event.price;
  const booking = {
    id: `bk-${Date.now()}`,
    eventId,
    customerName,
    customerEmail,
    quantity,
    unitPrice: price,
    totalPrice: price * quantity,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  event.ticketsSold += quantity;

  res.status(201).json(booking);
});

app.listen(PORT, () => {
  console.log(`Mock API Ticketera corriendo en http://localhost:${PORT}`);
});