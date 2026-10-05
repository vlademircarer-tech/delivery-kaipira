import { NeighborhoodDelivery } from '../types/delivery';

export const RESTAURANT_INFO = {
  name: 'Restaurante Kaipira Piracicaba',
  tagline: 'O autêntico sabor caipira & peixes do Rio Piracicaba',
  address: 'Av. Pompéia, 1018',
  neighborhood: 'Piracicamirim',
  city: 'Piracicaba - SP',
  cep: '13425-060',
  fullAddress: 'Av. Pompéia, 1018 - Piracicamirim, Piracicaba - SP, 13425-060',
  phone: '(19) 3302-9515',
  whatsappRaw: '551933029515',
  pixKey: '1933029515', // Chave PIX telefone
  pixName: 'Restaurante Kaipira Piracicaba Ltda',
  hours: {
    weekdays: '11:00 às 14:00',
    saturday: '11:00 às 14:00',
    sunday: 'Fechado',
  },
  scheduleDescription: [
    { day: 'Segunda-feira', hours: '11:00–14:00', isOpen: true },
    { day: 'Terça-feira', hours: '11:00–14:00', isOpen: true },
    { day: 'Quarta-feira', hours: '11:00–14:00', isOpen: true },
    { day: 'Quinta-feira', hours: '11:00–14:00', isOpen: true },
    { day: 'Sexta-feira', hours: '11:00–14:00', isOpen: true },
    { day: 'Sábado', hours: '11:00–14:00', isOpen: true },
    { day: 'Domingo', hours: 'Fechado', isOpen: false },
  ]
};

// Check if currently within operating hours (Segunda a Sábado 11h-14h)
export function isRestaurantOpen(): { isOpen: boolean; message: string } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  // Sunday closed
  if (day === 0) {
    return {
      isOpen: false,
      message: 'Fechado aos domingos. Abrimos amanhã às 11:00!',
    };
  }

  // 11:00 (660 min) to 14:00 (840 min)
  const openMinutes = 11 * 60;
  const closeMinutes = 14 * 60;

  if (totalMinutes >= openMinutes && totalMinutes < closeMinutes) {
    const minutesLeft = closeMinutes - totalMinutes;
    return {
      isOpen: true,
      message: `Aberto agora! Pedidos do almoço até 14:00 (${minutesLeft} min restantes)`,
    };
  } else if (totalMinutes < openMinutes) {
    const minsToOpen = openMinutes - totalMinutes;
    const hours = Math.floor(minsToOpen / 60);
    const mins = minsToOpen % 60;
    return {
      isOpen: false,
      message: `Abrimos hoje às 11:00 (${hours > 0 ? `${hours}h ` : ''}${mins}min para o fogão a lenha acender)`,
    };
  } else {
    return {
      isOpen: false,
      message: 'Cozinha fechada por hoje. Retornamos amanhã às 11:00!',
    };
  }
}

export const PIRACICABA_NEIGHBORHOODS: NeighborhoodDelivery[] = [
  { name: 'Piracicamirim (Próximo ao Restaurante)', zone: 'Leste', fee: 5.0, estimatedMinutes: '20-30 min' },
  { name: 'Pompéia', zone: 'Leste', fee: 5.0, estimatedMinutes: '20-30 min' },
  { name: 'Vila Monteiro', zone: 'Central', fee: 7.0, estimatedMinutes: '25-35 min' },
  { name: 'Bairro Alto', zone: 'Central', fee: 7.0, estimatedMinutes: '25-35 min' },
  { name: 'Centro de Piracicaba', zone: 'Central', fee: 8.0, estimatedMinutes: '30-40 min' },
  { name: 'São Dimas (ESALQ / USP)', zone: 'Leste', fee: 8.0, estimatedMinutes: '25-35 min' },
  { name: 'Agronomia', zone: 'Leste', fee: 8.0, estimatedMinutes: '25-35 min' },
  { name: 'Nova Piracicaba', zone: 'Norte', fee: 10.0, estimatedMinutes: '35-45 min' },
  { name: 'Vila Rezende', zone: 'Norte', fee: 10.0, estimatedMinutes: '35-45 min' },
  { name: 'Paulista', zone: 'Oeste', fee: 8.0, estimatedMinutes: '30-40 min' },
  { name: 'Dois Córregos', zone: 'Leste', fee: 6.0, estimatedMinutes: '25-35 min' },
  { name: 'Cecap', zone: 'Leste', fee: 7.0, estimatedMinutes: '25-35 min' },
  { name: 'Eldorado', zone: 'Leste', fee: 7.0, estimatedMinutes: '25-35 min' },
  { name: 'Morumbi', zone: 'Leste', fee: 6.5, estimatedMinutes: '25-35 min' },
  { name: 'Maracanã', zone: 'Leste', fee: 6.5, estimatedMinutes: '25-35 min' },
  { name: 'Santa Teresinha', zone: 'Norte', fee: 12.0, estimatedMinutes: '40-50 min' },
  { name: 'Algodoal', zone: 'Norte', fee: 11.0, estimatedMinutes: '35-45 min' },
  { name: 'Nhô Quim / Santana', zone: 'Norte', fee: 11.0, estimatedMinutes: '35-45 min' },
  { name: 'Jardim Elite', zone: 'Sul', fee: 7.5, estimatedMinutes: '25-35 min' },
  { name: 'Água Branca', zone: 'Leste', fee: 7.0, estimatedMinutes: '25-35 min' },
  { name: 'Outro bairro de Piracicaba (A combinar)', zone: 'Geral', fee: 12.0, estimatedMinutes: '40-55 min' },
];
