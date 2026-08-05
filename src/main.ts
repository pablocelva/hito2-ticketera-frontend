import './styles/global.css';
import { EventService } from './services/event.service';
import { EventBoardView } from './views/eventBoard.view';
import {
  applyEventFilter,
  getAvailableCities,
  getAvailableStatuses,
  type EventFilter,
} from './utils/event.filter.utils';
import { filterToQuery, queryToFilter } from './utils/url.filter.utils';

async function bootstrap(): Promise<void> {
  const view = new EventBoardView();

  try {
    // 1. Mostrar estado de carga (skeleton loaders)
    view.showLoading();

    // 2. Obtener cartelera (API con fallback al JSON estático)
    const events = await EventService.getAllEvents();

    // 3. Manejo de estado vacío
    if (events.length === 0) {
      view.showEmpty();
      return;
    }

    // 4. Filtros iniciales desde la URL (?q=...&ciudad=...&estado=...&orden=...)
    let filter: EventFilter = queryToFilter(window.location.search);

    const updateUrl = (next: EventFilter): void => {
      const query = filterToQuery(next);
      const url = query === '' ? window.location.pathname : `?${query}`;
      window.history.replaceState(null, '', url);
    };

    const render = (): void => {
      const visible = applyEventFilter(events, filter);

      view.renderFilterBar(
        getAvailableCities(events),
        getAvailableStatuses(events),
        filter,
        (nextFilter) => {
          filter = nextFilter;
          updateUrl(filter);
          render();
        },
      );

      view.renderEvents(visible);
    };

    // 5. Renderizado exitoso
    render();
  } catch (error) {
    console.error('[Ticketera] Error crítico durante la inicialización:', error);
    view.showError(
      'No pudimos cargar la cartelera en este momento. Verifica tu conexión e inténtalo de nuevo.',
      () => void bootstrap(),
    );
  }
}

await bootstrap();
