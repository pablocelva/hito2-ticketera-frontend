export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
  }
  
  export interface Booking {
    id: string;
    eventId: string;
    customerName: string;
    customerEmail: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: BookingStatus;
    createdAt: Date;
  }
  
  export interface CreateBookingRequest {
    eventId: string;
    customerName: string;
    customerEmail: string;
    quantity: number;
    unitPrice: number;
  }