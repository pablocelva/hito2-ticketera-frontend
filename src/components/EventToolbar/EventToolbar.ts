import type { EventStatus } from '../../models';
import { renderIcon } from '../../utils/icon.utils';
import {
  EMPTY_EVENT_FILTER,
  EVENT_STATUS_LABELS,
  SORT_OPTIONS,
  type EventFilter,
  type SortCriterion,
} from '../../utils/event.filter.utils';
import { Search, MapPin, Filter, ArrowUpDown, RotateCcw } from 'lucide';

export interface EventToolbarConfig {
  cities: string[];
  statuses: EventStatus[];
  filter: EventFilter;
  onChange: (filter: EventFilter) => void;
}

function buildCityOptions(cities: string[], current: string): string {
  const allSelected = current === 'all' ? ' selected' : '';
  const options = [
    `<option value="all"${allSelected}>Todas las ciudades</option>`,
  ];
  cities.forEach((city) => {
    const selected = current === city ? ' selected' : '';
    options.push(`<option value="${city}"${selected}>${city}</option>`);
  });
  return options.join('');
}

function buildStatusOptions(statuses: EventStatus[], current: string): string {
  const allSelected = current === 'all' ? ' selected' : '';
  const options = [
    `<option value="all"${allSelected}>Todos los estados</option>`,
  ];
  statuses.forEach((status) => {
    const selected = current === status ? ' selected' : '';
    options.push(
      `<option value="${status}"${selected}>${EVENT_STATUS_LABELS[status]}</option>`,
    );
  });
  return options.join('');
}

function buildSortOptions(current: SortCriterion): string {
  return SORT_OPTIONS.map(({ value, label }) => {
    const selected = current === value ? ' selected' : '';
    return `<option value="${value}"${selected}>${label}</option>`;
  }).join('');
}

export function createEventToolbarElement(config: EventToolbarConfig): HTMLElement {
  const container = document.createElement('div');

  container.innerHTML = `
    <section
      class="animate-fade-up mb-5 rounded-xl bg-zinc-950 border border-zinc-800/90 p-4 shadow-xl flex flex-col lg:flex-row lg:items-end gap-3"
      aria-label="Filtros y ordenamiento de la cartelera"
    >
      <div class="flex-1 min-w-[220px]">
        <label for="filtro-busqueda" class="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
          ${renderIcon(Search, 'w-3.5 h-3.5 text-violet-400')}
          <span>Buscar</span>
        </label>
        <input
          id="filtro-busqueda"
          type="search"
          value="${config.filter.query}"
          placeholder="Artista o evento..."
          class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all duration-150"
        />
      </div>

      <div>
        <label for="filtro-ciudad" class="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
          ${renderIcon(MapPin, 'w-3.5 h-3.5 text-violet-400')}
          <span>Ciudad</span>
        </label>
        <select id="filtro-ciudad" class="w-full lg:w-44 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600 cursor-pointer">
          ${buildCityOptions(config.cities, config.filter.city)}
        </select>
      </div>

      <div>
        <label for="filtro-estado" class="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
          ${renderIcon(Filter, 'w-3.5 h-3.5 text-violet-400')}
          <span>Estado</span>
        </label>
        <select id="filtro-estado" class="w-full lg:w-44 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600 cursor-pointer">
          ${buildStatusOptions(config.statuses, config.filter.status)}
        </select>
      </div>

      <div>
        <label for="filtro-orden" class="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
          ${renderIcon(ArrowUpDown, 'w-3.5 h-3.5 text-violet-400')}
          <span>Ordenar por</span>
        </label>
        <select id="filtro-orden" class="w-full lg:w-52 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-600 cursor-pointer">
          ${buildSortOptions(config.filter.sort)}
        </select>
      </div>

      <button
        id="btn-limpiar-filtros"
        type="button"
        class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-colors cursor-pointer"
      >
        ${renderIcon(RotateCcw, 'w-3.5 h-3.5')}
        <span>Limpiar</span>
      </button>
    </section>
  `;

  const sectionElement = container.firstElementChild as HTMLElement | null;
  // c8 ignore next 2 -- guardia inalcanzable: el template siempre genera un <section>
  if (!sectionElement) {
    throw new Error('No se pudo crear la barra de filtros.');
  }

  const searchInput = sectionElement.querySelector('#filtro-busqueda') as HTMLInputElement | null;
  const citySelect = sectionElement.querySelector('#filtro-ciudad') as HTMLSelectElement | null;
  const statusSelect = sectionElement.querySelector('#filtro-estado') as HTMLSelectElement | null;
  const sortSelect = sectionElement.querySelector('#filtro-orden') as HTMLSelectElement | null;
  const clearButton = sectionElement.querySelector('#btn-limpiar-filtros') as HTMLButtonElement | null;

  // c8 ignore next -- guardia inalcanzable: el template siempre emite todos los controles
  if (
    searchInput !== null &&
    citySelect !== null &&
    statusSelect !== null &&
    sortSelect !== null &&
    clearButton !== null
  ) {
    searchInput.addEventListener('input', () => {
      config.onChange({ ...config.filter, query: searchInput.value });
    });
    citySelect.addEventListener('change', () => {
      config.onChange({ ...config.filter, city: citySelect.value });
    });
    statusSelect.addEventListener('change', () => {
      config.onChange({
        ...config.filter,
        status: statusSelect.value as EventStatus | 'all',
      });
    });
    sortSelect.addEventListener('change', () => {
      config.onChange({
        ...config.filter,
        sort: sortSelect.value as SortCriterion,
      });
    });
    clearButton.addEventListener('click', () => {
      config.onChange(EMPTY_EVENT_FILTER);
    });
  }

  return sectionElement;
}

export function updateEventToolbarElement(
  toolbar: HTMLElement,
  filter: EventFilter,
): void {
  const searchInput = toolbar.querySelector('#filtro-busqueda') as HTMLInputElement | null;
  const citySelect = toolbar.querySelector('#filtro-ciudad') as HTMLSelectElement | null;
  const statusSelect = toolbar.querySelector('#filtro-estado') as HTMLSelectElement | null;
  const sortSelect = toolbar.querySelector('#filtro-orden') as HTMLSelectElement | null;
  if (searchInput !== null) {
    searchInput.value = filter.query;
  }
  if (citySelect !== null) {
    citySelect.value = filter.city;
  }
  if (statusSelect !== null) {
    statusSelect.value = filter.status;
  }
  if (sortSelect !== null) {
    sortSelect.value = filter.sort;
  }
}
