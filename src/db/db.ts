import Dexie, { type Table } from 'dexie';

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface Product {
  id?: number;
  name: string;
  unit: string;
  price: number;
}

export interface Invoice {
  id?: number;
  invoiceNo: number;
  customerId: number;
  date: string; // ISO format date string
  totalAmount: number;
}

export interface InvoiceItem {
  id?: number;
  invoiceId: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
}

export interface Payment {
  id?: number;
  customerId: number;
  date: string; // ISO format date string
  amount: number;
  notes?: string;
}

export interface Delivery {
  id?: number;
  customerId: number;
  date: string; // ISO format date string
  vehicleNo?: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
  status: 'unbilled' | 'billed';
  invoiceId?: number;
}

export class StoneCrusherDB extends Dexie {
  customers!: Table<Customer>;
  products!: Table<Product>;
  invoices!: Table<Invoice>;
  invoiceItems!: Table<InvoiceItem>;
  payments!: Table<Payment>;
  deliveries!: Table<Delivery>;

  constructor() {
    super('StoneCrusherDB');
    this.version(1).stores({
      customers: '++id, name, phone',
      products: '++id, name',
      invoices: '++id, invoiceNo, customerId, date',
      invoiceItems: '++id, invoiceId, productId',
      payments: '++id, customerId, date'
    });
    this.version(2).stores({
      customers: '++id, name, phone',
      products: '++id, name',
      invoices: '++id, invoiceNo, customerId, date',
      invoiceItems: '++id, invoiceId, productId',
      payments: '++id, customerId, date',
      deliveries: '++id, customerId, date, status'
    });
  }
}

export const db = new StoneCrusherDB();
