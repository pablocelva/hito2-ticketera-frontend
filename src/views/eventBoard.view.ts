import type { Event } from '../models';
import { EventService } from '../services/event.service';
import { createEventCardElement } from '../components/EventCard';
import { createFeaturedBannerElement } from '../components/FeaturedBanner/FeaturedBanner';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../components/LoadingSkeleton/LoadingSkeleton';
import {
  createErrorStateElement,
  createEmptyStateElement,
} from '../components/StateViews/StateViews';
import { createBookingFormElement } from '../components/BookingForm';

export class EventBoardView {
  private bannerContainer: HTMLElement | null;
  private carteleraContainer: HTMLElement | null;
  private contadorContainer: HTMLElement | null;
  private bookingContainer: HTMLElement | null;

  constructor() {
    this.bannerContainer = document.getElementById('contenedor-banner');
    this.carteleraContainer = document.getElementById('contenedor-cartelera');
    this.contadorContainer = document.getElementById('contador-fechas');
    this.bookingContainer = document.getElementById('contenedor-reserva');
  }

  showLoading(): void {
    if (this.contadorContainer !== null) {
      this.contadorContainer.innerHTML =
        '<span class="text-[11px] font-extrabold uppercase tracking-wider text-zinc-300">Cargando fechas...</span>';
    }
    if (this.bannerContainer !== null) {
      this.bannerContainer.replaceChildren(createBannerSkeletonElement());
    }
    if (this.carteleraContainer !== null) {
      this.carteleraContainer.replaceChildren(createGridSkeletonElement(6));
    }
    if (this.bookingContainer !== null) {
      this.bookingContainer.replaceChildren();
    }
  }

  renderBookingForm(selectedEvent?: Event): void {
    if (this.bookingContainer === null) return;
    try {
      const formElement = createBookingFormElement(selectedEvent);
      this.bookingContainer.replaceChildren(formElement);
    } catch (bookingError) {
      console.error('[Ticketera] Error al renderizar el formulario de reserva:', bookingError);
      this.bookingContainer.replaceChildren();
    }
  }

  renderEvents(events: Event[]): void {
    if (this.carteleraContainer === null) {
      console.error('[Ticketera] Error crítico: No se encontró "#contenedor-cartelera" en el DOM.');
      return;
    }

    if (this.contadorContainer !== null) {
      const count = events.length;
      const label = count === 1 ? 'Evento Confirmado' : 'Eventos Confirmados';
      this.contadorContainer.innerHTML = `<span>${count} ${label}</span>`;
    }

    const featuredEvent = EventService.getFeaturedEvent(events);

    if (this.bannerContainer !== null && featuredEvent !== null) {
      try {
        this.bannerContainer.replaceChildren(createFeaturedBannerElement(featuredEvent));
      } catch (bannerError) {
        console.error('[Ticketera] Error al renderizar banner destacado:', bannerError);
        this.bannerContainer.replaceChildren();
      }
    }

    const gridEvents = EventService.getGridEvents(events);
    const fragment = document.createDocumentFragment();
    gridEvents.forEach((event) => {
      try {
        fragment.appendChild(createEventCardElement(event));
      } catch (cardError) {
        console.error(`[Ticketera] Falló el renderizado del evento ID ${event.id}:`, cardError);
      }
    });
    this.carteleraContainer.replaceChildren(fragment);

    this.renderBookingForm(featuredEvent ?? undefined);
    this.setupBookingListeners(events, featuredEvent);
  }

  private setupBookingListeners(
    events: Event[],
    featuredEvent: Event | null,
  ): void {
    const handleTicketClick = (e: PointerEvent): void => {
      const target = e.target as HTMLElement | null;
      if (target === null) return;

      const button = target.closest('button');
      if (button !== null && button.disabled) return;

      const card = target.closest('[data-id]') as HTMLElement | null;
      const eventId = card?.getAttribute('data-id');
      let selectedEvent: Event | undefined;

      if (eventId) {
        selectedEvent = events.find((event) => event.id === eventId);
      } else if (
        this.bannerContainer !== null &&
        this.bannerContainer.contains(target) &&
        featuredEvent !== null
      ) {
        selectedEvent = featuredEvent;
      }

      if (selectedEvent !== undefined) {
        this.renderBookingForm(selectedEvent);
        this.bookingContainer?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (this.carteleraContainer !== null) {
      this.carteleraContainer.addEventListener('click', handleTicketClick);
    }
    if (this.bannerContainer !== null) {
      this.bannerContainer.addEventListener('click', handleTicketClick);
    }
  }

  showEmpty(): void {
    if (this.contadorContainer !== null) {
      this.contadorContainer.innerHTML = '<span>0 Eventos Confirmados</span>';
    }
    if (this.bannerContainer !== null) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer !== null) {
      this.carteleraContainer.replaceChildren(createEmptyStateElement());
    }
    if (this.bookingContainer !== null) {
      this.bookingContainer.replaceChildren();
    }
  }

  showError(message: string, onRetry?: () => void): void {
    if (this.contadorContainer !== null) {
      this.contadorContainer.innerHTML = '<span>0 Eventos Confirmados</span>';
    }
    if (this.bannerContainer !== null) {
      this.bannerContainer.replaceChildren();
    }
    if (this.carteleraContainer !== null) {
      this.carteleraContainer.replaceChildren(createErrorStateElement(message, onRetry));
    }
    if (this.bookingContainer !== null) {
      this.bookingContainer.replaceChildren();
    }
  }
}