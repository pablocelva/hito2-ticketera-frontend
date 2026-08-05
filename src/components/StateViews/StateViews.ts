export function createErrorStateElement(
    message: string = 'Ocurrió un problema al cargar la cartelera.',
    onRetry?: () => void,
  ): HTMLElement {
    const container = document.createElement('div');
    container.className =
      'animate-fade-up col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-violet-600/40 rounded-xl text-zinc-400';
    container.innerHTML = `
      <h3 class="text-lg font-bold text-violet-400 mb-2 uppercase">¡Ups! Ocurrió un problema al cargar la cartelera.</h3>
      <p class="text-sm mb-4">${message}</p>
    `;
    if (onRetry) {
      const retryButton = document.createElement('button');
      retryButton.className =
        'px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-150 shadow cursor-pointer';
      retryButton.textContent = 'Reintentar';
      retryButton.addEventListener('click', () => onRetry());
      container.appendChild(retryButton);
    }
    return container;
  }
  
  export function createEmptyStateElement(): HTMLElement {
    const container = document.createElement('div');
    container.className =
      'animate-fade-up col-span-full text-center py-10 px-6 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl text-zinc-400';
    container.innerHTML =
      '<p class="text-base font-bold uppercase">No hay eventos disponibles por el momento. ¡Vuelve pronto!</p>';
    return container;
  }