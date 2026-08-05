import { type Event, EventStatus } from '../../models';
import { renderIcon, type IconDefinition } from '../../utils/icon.utils';
import { formatDate } from '../../utils/date.utils';
import { formatPrice } from '../../utils/currency.utils';
import {
  Ticket,
  Music,
  Calendar,
  MapPin,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide';

interface StatusConfig {
  label: string;
  badgeClass: string;
  buttonText: string;
  buttonDisabled: boolean;
  buttonClass: string;
  icon: IconDefinition;
}

function getStatusConfig(status: EventStatus): StatusConfig {
  switch (status) {
    case EventStatus.ON_SALE:
      return {
        label: 'A LA VENTA',
        badgeClass:
          'bg-violet-600 text-white border border-violet-400 font-black tracking-widest shadow',
        buttonText: 'Comprar Entradas',
        buttonDisabled: false,
        buttonClass:
          'bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-wider border border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.35)] cursor-pointer',
        icon: Ticket,
      };
    case EventStatus.SCHEDULED:
      return {
        label: 'PRÓXIMAMENTE',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider',
        buttonText: 'Próximamente',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: Calendar,
      };
    case EventStatus.SOLD_OUT:
      return {
        label: 'AGOTADO',
        badgeClass:
          'bg-red-950/90 text-red-400 border border-red-800 font-black tracking-widest',
        buttonText: 'Agotado',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: XCircle,
      };
    case EventStatus.LIVE:
      return {
        label: 'EN VIVO',
        badgeClass:
          'bg-emerald-950/90 text-emerald-400 border border-emerald-800 font-black tracking-widest animate-pulse',
        buttonText: 'Ver En Vivo',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: Radio,
      };
    case EventStatus.FINISHED:
      return {
        label: 'FINALIZADO',
        badgeClass:
          'bg-zinc-900/90 text-zinc-400 border border-zinc-800 font-bold uppercase',
        buttonText: 'Finalizado',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: CheckCircle2,
      };
    case EventStatus.CANCELED:
      return {
        label: 'CANCELADO',
        badgeClass:
          'bg-zinc-900/90 text-red-500 border border-red-900/80 font-bold uppercase line-through',
        buttonText: 'Cancelado',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: XCircle,
      };
    default:
      return {
        label: 'POR CONFIRMAR',
        badgeClass:
          'bg-zinc-900/90 text-zinc-200 border border-zinc-700 font-extrabold tracking-wider',
        buttonText: 'Ver Detalles',
        buttonDisabled: true,
        buttonClass:
          'bg-zinc-900 text-zinc-600 font-bold uppercase tracking-wider border border-zinc-800 cursor-not-allowed',
        icon: Calendar,
      };
  }
}

export function generateEventCardHtml(event: Event): string {
  if (!event) {
    return `
      <article class="h-full bg-zinc-950 border border-violet-600/40 rounded-xl p-5 text-center text-violet-400 flex flex-col justify-center">
        <p class="font-bold uppercase text-sm">Información del evento no disponible</p>
      </article>
    `;
  }

  const config = getStatusConfig(event.status);
  const formattedDate = formatDate(event.date);
  const available = Math.max(0, event.capacity - event.ticketsSold);
  const availabilityLabel =
    event.status === EventStatus.ON_SALE
      ? available === 1
        ? '¡Última entrada!'
        : `Quedan ${available} entradas`
      : '';
  const imageUrl = event.imageUrl || '/images/placeholder.svg';

  return `
    <article
      class="group bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-lg hover:border-violet-500/60 transition-all duration-200 flex flex-col justify-between h-full relative"
      data-id="${event.id}"
    >
      <div class="relative w-full h-40 overflow-hidden bg-zinc-900 shrink-0">
        <img
          src="${imageUrl}"
          alt="${event.title}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onerror="this.onerror=null; this.src='/images/placeholder.svg';"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/40"></div>
        <span class="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${config.badgeClass}">
          ${renderIcon(config.icon, 'w-3 h-3')}
          ${config.label}
        </span>
      </div>

      <div class="p-4 flex flex-col justify-between flex-grow gap-3">
        <header class="flex flex-col gap-1">
          <h3 class="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-violet-400 transition-colors duration-150 line-clamp-2">
            ${event.title}
          </h3>
          <div class="flex items-center gap-1.5 text-violet-400 font-extrabold text-xs tracking-wider">
            ${renderIcon(Music, 'w-3.5 h-3.5 shrink-0')}
            <span>${event.artist}</span>
          </div>
        </header>

        <div class="flex flex-col gap-1.5 pt-2.5 border-t border-zinc-800/80 text-xs text-zinc-300">
          <div class="flex items-center gap-2">
            ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-400 shrink-0')}
            <span><strong class="text-zinc-400 font-semibold">Fecha:</strong> ${formattedDate} · ${event.time}</span>
          </div>
          <div class="flex items-center gap-2">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-zinc-400 shrink-0')}
            <span><strong class="text-zinc-400 font-semibold">Lugar:</strong> ${event.venue}, ${event.city}</span>
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="text-sm font-black text-white">${formatPrice(event.price)}</span>
            <span class="text-[11px] font-bold text-zinc-500">${availabilityLabel}</span>
          </div>
        </div>

        <footer class="mt-auto pt-1">
          <button
            class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-150 ${config.buttonClass}"
            ${config.buttonDisabled ? 'disabled' : ''}
            aria-label="${config.buttonText} para ${event.title}"
          >
            ${renderIcon(config.icon, 'w-3.5 h-3.5')}
            <span>${config.buttonText}</span>
          </button>
        </footer>
      </div>
    </article>
  `;
}

export function createEventCardElement(event: Event): HTMLElement {
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateEventCardHtml(event).trim();
    const element = tempDiv.firstElementChild as HTMLElement | null;
    if (!element) {
      throw new Error('No se pudo generar la tarjeta del evento.');
    }
    return element;
  } catch (error) {
    console.error('[Ticketera] Error al crear la tarjeta del evento:', error);
    const fallback = document.createElement('article');
    fallback.className =
      'h-full bg-zinc-950 border border-violet-600/40 rounded-xl p-4 text-center text-violet-400 flex flex-col justify-center items-center gap-2';
    fallback.innerHTML = `
      ${renderIcon(AlertTriangle, 'w-5 h-5')}
      <p class="text-xs font-black uppercase">No se pudo cargar este evento.</p>
    `;
    return fallback;
  }
}