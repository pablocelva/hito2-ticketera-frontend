import './styles/global.css';
import { EventService } from './services/event.service';
import { EventBoardView } from './views/eventBoard.view';

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

    // 4. Renderizado exitoso
    view.renderEvents(events);
  } catch (error) {
    console.error('[Ticketera] Error crítico durante la inicialización:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error al cargar la cartelera.';
    view.showError(errorMessage, () => void bootstrap());
  }
}

await bootstrap();