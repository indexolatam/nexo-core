export type PaymentStatus = "Pagado" | "Pendiente" | "Cancelado";

export type PaymentMethod = "Efectivo" | "Transferencia" | "Tarjeta" | "Otro";

export type FinanceMovement = {
  id: string;
  persona_id: string;
  persona_nombre: string;
  servicio: string;
  monto: number;
  metodo_pago: PaymentMethod;
  estado: PaymentStatus;
  fecha: string;
  hora: string;
  referencia_transaccion?: string;
  banco?: string;
  observaciones?: string;
};

export type FinanceQuickFilter = "Todos" | "Pendientes";

export type PaymentView = "lista" | "tabla" | "cuadricula";

export const paymentMethods: PaymentMethod[] = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];
export const paymentStatuses: PaymentStatus[] = ["Pagado", "Pendiente", "Cancelado"];

export type FinanceFilterState = {
  estado: PaymentStatus[];
  metodo: PaymentMethod[];
  fecha_desde: string;
  fecha_hasta: string;
  servicio: string;
  monto_min: string;
  monto_max: string;
};