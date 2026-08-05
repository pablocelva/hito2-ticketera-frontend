import type { Event } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import { formatDate } from '../../utils/date.utils';
import { formatPrice } from '../../utils/currency.utils';
import { Flame, Music, Calendar, Clock, MapPin, Ticket } from 'lucide';

export function createFeaturedBannerElement(event: Event): HTMLElement {
  const container = document.createElement('section');
  container.className =
    'w-full mb-6 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-xl relative group';

  const imageUrl = event.imageUrl || '/images/placeholder.svg';

  container.innerHTML = `
    <div class="relative min-h-[300px] md:min-h-[360px] flex flex-col justify-end p-5 md:p-7 overflow-hidden" data-id="${event.id}">
      <img
        src="${imageUrl}"
        alt="${event.title}"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
        onerror="this.onerror=null; this.src='/images/placeholder.svg';"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent"></div>

      <div class="relative z-10 max-w-2xl flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-widest bg-violet-600 text-white shadow">
            ${renderIcon(Flame, 'w-3 h-3 fill-current')}
            EVENTO DESTACADO
          </span>
        </div>

        <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight drop-shadow-md">
          ${event.title}
        </h2>

        <div class="flex items-center gap-2 text-zinc-200 font-extrabold text-base md:text-lg">
          ${renderIcon(Music, 'w-4 h-4 text-violet-400')}
          <span class="text-violet-400">${event.artist}</span>
        </div>

        <div class="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-semibold pt-1">
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
            ${renderIcon(Calendar, 'w-3.5 h-3.5 text-zinc-400')}
            <span>${formatDate(event.date)}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800">
            ${renderIcon(Clock, 'w-3.5 h-3.5 text-zinc-400')}
            <span>${event.time}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800 text-zinc-200">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-violet-400')}
            <span>${event.venue}, ${event.city}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded border border-zinc-800 text-zinc-200">
            ${renderIcon(Ticket, 'w-3.5 h-3.5 text-violet-400')}
            <span>${formatPrice(event.price)}</span>
          </div>
        </div>

        <div class="pt-2">
          <button class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black text-xs md:text-sm uppercase tracking-wider bg-violet-600 hover:bg-violet-500 text-white border border-violet-400 transition-all duration-150 shadow-[0_0_15px_rgba(139,92,246,0.35)] cursor-pointer">
            ${renderIcon(Ticket, 'w-4 h-4')}
            <span>Comprar Entradas</span>
          </button>
        </div>
      </div>
    </div>
  `;

  return container;
}