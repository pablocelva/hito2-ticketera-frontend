import { renderIcon } from '../../utils/icon.utils';
import {
  Ticket,
  Mail,
  Globe,
  MapPin,
  Lock,
  ShieldCheck,
  Heart,
} from 'lucide';

export function createFooterElement(): HTMLElement {
  const container = document.createElement('footer');
  container.className =
    'animate-fade-up mt-10 pt-8 border-t border-zinc-800/80';

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
      <div class="md:col-span-2">
        <div class="flex items-center gap-2 mb-3">
          ${renderIcon(Ticket, 'w-5 h-5 text-violet-500')}
          <span class="text-lg font-black uppercase tracking-tight text-white">TICKET<span class="text-violet-500">ERA</span></span>
        </div>
        <p class="text-xs text-zinc-400 leading-relaxed max-w-sm">
          Boletería independiente que conecta artistas con su público.
          Entradas directas del artista, sin intermediarios y con reservas en línea.
        </p>
      </div>

      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">Información</h3>
        <ul class="space-y-2 text-xs text-zinc-400">
          <li><a href="#cartelera" class="hover:text-violet-400 transition-colors">Cómo comprar</a></li>
          <li><a href="#cartelera" class="hover:text-violet-400 transition-colors">Preguntas frecuentes</a></li>
          <li><a href="#cartelera" class="hover:text-violet-400 transition-colors">Términos y condiciones</a></li>
          <li><a href="#cartelera" class="hover:text-violet-400 transition-colors">Política de privacidad</a></li>
        </ul>
      </div>

      <div>
        <h3 class="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-3">Contacto</h3>
        <ul class="space-y-2 text-xs text-zinc-400">
          <li class="flex items-center gap-2">
            ${renderIcon(Mail, 'w-3.5 h-3.5 text-violet-400 shrink-0')}
            <span>soporte@ticketera.cl</span>
          </li>
          <li class="flex items-center gap-2">
            ${renderIcon(Globe, 'w-3.5 h-3.5 text-violet-400 shrink-0')}
            <span>ticketera.cl</span>
          </li>
          <li class="flex items-center gap-2">
            ${renderIcon(MapPin, 'w-3.5 h-3.5 text-violet-400 shrink-0')}
            <span>Santiago, Chile</span>
          </li>
        </ul>
        <div class="mt-4 flex items-center gap-2 flex-wrap">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300">
            ${renderIcon(Lock, 'w-3 h-3 text-emerald-400 shrink-0')}
            Pago seguro
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300">
            ${renderIcon(ShieldCheck, 'w-3 h-3 text-emerald-400 shrink-0')}
            Compra garantizada
          </span>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-4 border-t border-zinc-800/60 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
      <p class="font-semibold uppercase tracking-wider">
        © ${new Date().getFullYear()} Ticketera · Boletería independiente
      </p>
      <p class="flex items-center gap-1.5">
        Hecho con ${renderIcon(Heart, 'w-3 h-3 text-fuchsia-500 shrink-0')}
        <span>para la escena local</span>
      </p>
    </div>
  `;

  return container;
}
