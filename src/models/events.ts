export enum EventStatus {
    SCHEDULED = 'SCHEDULED',
    ON_SALE = 'ON_SALE',
    SOLD_OUT = 'SOLD_OUT',
    LIVE = 'LIVE',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
  }
  
  export interface Event {
    id: string;
    title: string;
    artist: string;
    venue: string;
    city: string;
    date: Date;
    time: string;
    price: number;
    capacity: number;
    ticketsSold: number;
    status: EventStatus;
    imageUrl?: string;
    isFeatured?: boolean;
  }