export const ORDER_STATUS_LABELS = {
  Pending: "En attente",
  Preparing: "En préparation",
  Ready: "Prête",
  Collected: "Récupérée",
  Cancelled: "Annulée",
};

export const PAYMENT_STATUS_LABELS = {
  PayOnPickup: "À régler au retrait",
  PaidOnPickup: "Payé au retrait",
};

export function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status;
}

export function paymentStatusLabel(status) {
  return PAYMENT_STATUS_LABELS[status] || status;
}
