export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export function generateOrderNumber(): string {
  const letters = 'KP';
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${letters}-${numbers}`;
}

// Generates a mock but realistic PIX Copy and Paste (EMV Payload) for demonstration
export function generatePixCode(amount: number, orderId: string): string {
  const amountStr = amount.toFixed(2);
  return `00020126580014br.gov.bcb.pix0114+551933029515520400005303986540${amountStr.length < 10 ? '0' : ''}${amountStr.length}${amountStr}5802BR5925RESTAURANTE KAIPIRA PIRA6010PIRACICABA62200516${orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}6304`;
}
