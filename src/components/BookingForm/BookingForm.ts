import { type Booking, type Event } from '../../models';
import { BookingService } from '../../services/booking.service';
import { renderIcon } from '../../utils/icon.utils';
import { isValidEmail, isWithinRange } from '../../utils/validation.utils';
import { formatPrice } from '../../utils/currency.utils';
import { Ticket, User, Mail, CheckCircle2, AlertCircle } from 'lucide';

export function renderBookingForm(event?: Event): string {
  const eventBadge = event
    ? `
      <div class="mb-4 p-3 bg-zinc-900/90 border border-zinc-800 rounded-lg flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 overflow-hidden">
          <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-violet-950 text-violet-300 border border-violet-800 shrink-0">SELECCIONADO</span>
          <span class="text-xs font-bold text-white truncate">${event.title}</span>
        </div>
        <span class="text-xs font-semibold text-zinc-400 shrink-0">${formatPrice(event.price)} c/u</span>
      </div>
    `
    : '';

  return `
    <section class="w-full bg-zinc-950 border border-zinc-800/90 rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <header class="mb-4">
        <div class="flex items-center gap-2 mb-1">
          ${renderIcon(Ticket, 'w-5 h-5 text-violet-500')}
          <h2 class="text-lg md:text-xl font-black uppercase tracking-tight text-white">Reserva de Entradas</h2>
        </div>
        <p class="text-xs text-zinc-400">Completa tus datos para asegurar tu lugar en el evento.</p>
      </header>

      ${eventBadge}

      <form id="form-reserva" data-event-id="${event?.id ?? ''}" class="space-y-4" novalidate>
        <div class="space-y-1.5">
          <label for="txt-nombre" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${renderIcon(User, 'w-3.5 h-3.5 text-zinc-400')}
            <span>Nombre completo</span>
          </label>
          <input
            type="text"
            id="txt-nombre"
            name="nombre"
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all duration-150"
            placeholder="Nombre y apellido"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label for="txt-email" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${renderIcon(Mail, 'w-3.5 h-3.5 text-zinc-400')}
            <span>Email</span>
          </label>
          <input
            type="email"
            id="txt-email"
            name="email"
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all duration-150"
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label for="txt-cantidad" class="block text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            ${renderIcon(Ticket, 'w-3.5 h-3.5 text-zinc-400')}
            <span>Cantidad de entradas</span>
          </label>
          <input
            type="number"
            id="txt-cantidad"
            name="cantidad"
            class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all duration-150"
            min="1"
            max="10"
            placeholder="1"
            required
          />
        </div>

        <div id="bloque-error" class="hidden text-xs font-bold text-red-400 bg-red-950/70 border border-red-800/80 rounded-lg p-3 flex items-center gap-2"></div>

        <button
          type="submit"
          id="btn-reservar"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-black text-xs md:text-sm uppercase tracking-wider border border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-150 cursor-pointer"
        >
          ${renderIcon(Ticket, 'w-4 h-4')}
          <span>Reservar</span>
        </button>
      </form>
    </section>
  `;
}

function renderSuccessState(
  sectionElement: HTMLElement,
  booking: Booking,
  event: Event,
): void {
  sectionElement.innerHTML = `
    <div class="text-center py-6 px-4 flex flex-col items-center gap-2">
      ${renderIcon(CheckCircle2, 'w-10 h-10 text-emerald-400 mb-1')}
      <h3 class="text-lg font-black text-white uppercase tracking-tight">¡Reserva Confirmada!</h3>
      <p class="text-xs text-zinc-300 max-w-md">
        Se reservaron <strong class="text-white font-extrabold">${booking.quantity} entrada(s)</strong> para
        <strong class="text-violet-400 font-bold">${event.title}</strong>.
      </p>
      <p class="text-[11px] text-zinc-400 mt-1">
        Total: <span class="text-zinc-200 font-semibold">${formatPrice(booking.totalPrice)}</span> ·
        Código: <span class="text-zinc-200 font-semibold">${booking.id}</span>
      </p>
      <p class="text-[11px] text-zinc-400">
        Enviaremos la confirmación a <span class="text-zinc-200 font-semibold">${booking.customerEmail}</span>.
      </p>
      <button
        type="button"
        id="btn-nueva-reserva"
        class="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-extrabold uppercase tracking-wider rounded-lg border border-zinc-700 transition-colors cursor-pointer"
      >
        Realizar Otra Reserva
      </button>
    </div>
  `;

  const btnNuevaReserva = sectionElement.querySelector('#btn-nueva-reserva');
  btnNuevaReserva?.addEventListener('click', () => {
    const freshElement = createBookingFormElement(event);
    sectionElement.replaceWith(freshElement);
  });
}

export function createBookingFormElement(
  event?: Event,
  onSubmitSuccess?: (booking: Booking) => void,
): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = renderBookingForm(event).trim();
  const sectionElement = container.firstElementChild as HTMLElement | null;
  if (!sectionElement) {
    throw new Error('No se pudo crear el formulario de reserva.');
  }

  // Aserciones especializadas + guardias de nulidad
  const form = sectionElement.querySelector('#form-reserva') as HTMLFormElement | null;
  const nameInput = sectionElement.querySelector('#txt-nombre') as HTMLInputElement | null;
  const emailInput = sectionElement.querySelector('#txt-email') as HTMLInputElement | null;
  const quantityInput = sectionElement.querySelector('#txt-cantidad') as HTMLInputElement | null;
  const errorBlock = sectionElement.querySelector('#bloque-error') as HTMLElement | null;
  const submitButton = sectionElement.querySelector('#btn-reservar') as HTMLButtonElement | null;

  const showError = (msg: string): void => {
    if (errorBlock === null) return;
    errorBlock.innerHTML = `${renderIcon(AlertCircle, 'w-4 h-4 shrink-0 text-red-400')}<span>${msg}</span>`;
    errorBlock.classList.remove('hidden');
  };

  const setSubmitting = (submitting: boolean): void => {
    if (submitButton === null) return;
    submitButton.disabled = submitting;
    submitButton.innerHTML = submitting
      ? '<span class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span><span>Procesando reserva...</span>'
      : `${renderIcon(Ticket, 'w-4 h-4')}<span>Reservar</span>`;
  };

  if (
    form !== null &&
    nameInput !== null &&
    emailInput !== null &&
    quantityInput !== null &&
    errorBlock !== null
  ) {
    form.addEventListener('submit', async (formEvent: SubmitEvent) => {
      // 1. Neutralizar el envío nativo del navegador (primera instrucción)
      formEvent.preventDefault();

      errorBlock.classList.add('hidden');

      // 2. Extraer payload con aserciones especializadas
      const customerName = nameInput.value.trim();
      const customerEmail = emailInput.value.trim();
      const quantityValue = quantityInput.value.trim();
      const quantity = parseInt(quantityValue, 10);
      const eventId = form.getAttribute('data-event-id') ?? '';

      // 3. Validaciones reactivas en el cliente
      if (customerName.length === 0) {
        showError('El nombre es requerido.');
        nameInput.focus();
        return;
      }
      if (customerEmail.length === 0) {
        showError('El correo electrónico es requerido.');
        emailInput.focus();
        return;
      }
      if (!isValidEmail(customerEmail)) {
        showError('Por favor, ingresa un correo electrónico válido.');
        emailInput.focus();
        return;
      }
      if (quantityValue.length === 0 || isNaN(quantity)) {
        showError('Ingresa la cantidad de entradas.');
        quantityInput.focus();
        return;
      }
      if (!isWithinRange(quantity, 1, 10)) {
        showError('La cantidad de entradas debe ser entre 1 y 10.');
        quantityInput.focus();
        return;
      }
      if (eventId.length === 0) {
        showError('Selecciona un evento para reservar.');
        return;
      }
      if (!event) {
        showError('Selecciona un evento para reservar.');
        return;
      }

      // 4. Feedback visual de carga antes de la petición (Pilar 3)
      setSubmitting(true);

      try {
        const booking = await BookingService.createBooking({
          eventId,
          customerName,
          customerEmail,
          quantity,
          unitPrice: event.price,
        });

        renderSuccessState(sectionElement, booking, event);
        onSubmitSuccess?.(booking);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible completar la reserva.';
        console.error('[Ticketera] Error al crear la reserva:', error);
        showError(message);
      } finally {
        setSubmitting(false);
      }
    });
  }

  return sectionElement;
}