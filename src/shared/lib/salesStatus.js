import {
  Check,
  Minus,
  Receipt,
  ReceiptX,
} from "@phosphor-icons/react";

export function getPaymentStatusMeta(paymentStatus) {
  if (paymentStatus === "odendi") {
    return {
      label: "Ödendi",
      tone: "success",
      icon: Check,
    };
  }

  return {
    label: "Ödenmedi",
    tone: "default",
    icon: Minus,
  };
}

export function getInvoiceStatusMeta(invoiceStatus) {
  if (invoiceStatus === "faturalandi") {
    return {
      label: "Faturalandı",
      tone: "success",
      icon: Receipt,
    };
  }

  return {
    label: "Faturalanmadı",
    tone: "warning",
    icon: ReceiptX, // 🔥 değişti
  };
}