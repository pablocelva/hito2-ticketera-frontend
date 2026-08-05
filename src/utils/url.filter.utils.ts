import { EventStatus } from '../models';
import {
  EMPTY_EVENT_FILTER,
  type EventFilter,
  type SortCriterion,
} from './event.filter.utils';

const VALID_SORT_CRITERIA: ReadonlySet<string> = new Set([
  'date',
  'price-asc',
  'price-desc',
  'name',
  'availability',
]);

export function filterToQuery(filter: EventFilter): string {
  const params = new URLSearchParams();
  const query = filter.query.trim();
  if (query !== '') {
    params.set('q', query);
  }
  if (filter.city !== 'all') {
    params.set('ciudad', filter.city);
  }
  if (filter.status !== 'all') {
    params.set('estado', filter.status);
  }
  if (filter.sort !== 'date') {
    params.set('orden', filter.sort);
  }
  return params.toString();
}

export function queryToFilter(search: string): EventFilter {
  const params = new URLSearchParams(search);
  const filter: EventFilter = { ...EMPTY_EVENT_FILTER };

  const query = params.get('q') ?? '';
  if (query.trim() !== '') {
    filter.query = query.trim();
  }

  const city = params.get('ciudad') ?? '';
  if (city !== '') {
    filter.city = city;
  }

  const status = params.get('estado') ?? '';
  if (status !== '' && (Object.values(EventStatus) as string[]).includes(status)) {
    filter.status = status as EventStatus;
  }

  const sort = params.get('orden') ?? '';
  if (sort !== '' && VALID_SORT_CRITERIA.has(sort)) {
    filter.sort = sort as SortCriterion;
  }

  return filter;
}
