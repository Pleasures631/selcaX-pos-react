export interface Orders {
  id?: number;
  name: string;
  price: number;
  qty: string;
  qtyOrder: number;
  created_date?: string;
  order_id: string;
  status: string;
  subTotalItem: number;
  cust_name: string;
  cust_address: string;
  notes: string;
}

export interface getOrders {
  order_id: string | null;
  name: string | null;
  amount: number | null;
  status: number | null;
  order_date: string | null;
  qty: string | null;
  id: number | null;
}

export interface splitOrders {
  order_id: string | null;
  notes: string | null;
  name: string;
  price: number;
  qtyOrder: string;
  subTotalItem: number;
  cust_name: string;
  cust_address: string;
}
