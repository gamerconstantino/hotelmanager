// Dados fictícios apenas para demonstração visual. Serão substituídos pela API e MySQL.
export const weeklyOccupancy = [
  { day: 'Seg', value: 68 }, { day: 'Ter', value: 82 }, { day: 'Qua', value: 74 },
  { day: 'Qui', value: 91 }, { day: 'Sex', value: 78 }, { day: 'Sáb', value: 96 },
  { day: 'Dom', value: 61 },
];

export const roomSummary = [
  { label: 'Ocupados', value: 24, color: 'dot-green' },
  { label: 'Disponíveis', value: 5, color: 'dot-blue' },
  { label: 'Em manutenção', value: 3, color: 'dot-orange' },
];

export const reservations = [
  { id: 1, name: 'Ana Silva', email: 'ana.silva@email.com', initials: 'AS', color: 'lavender', room: 'Quarto  asoci 101'.replace(' asoci ', ''), checkin: '18 Nov, 2026', checkout: '21 Nov, 2026', amount: '45.000 Kz', status: 'Confirmada', statusClass: 'confirmed' },
  { id: 2, name: 'Carlos Manuel', email: 'carlos@email.com', initials: 'CM', color: 'peach', room: 'Quarto 204', checkin: '18 Nov, 2026', checkout: '20 Nov, 2026', amount: '30.000 Kz', status: 'Check-in', statusClass: 'checked' },
  { id: 3, name: 'Marta Costa', email: 'marta.costa@email.com', initials: 'MC', color: 'mint', room: 'Quarto 105', checkin: '19 Nov, 2026', checkout: '22 Nov, 2026', amount: '60.000 Kz', status: 'Pendente', statusClass: 'pending' },
  { id: 4, name: 'Paulo António', email: 'paulo@email.com', initials: 'PA', color: 'sky', room: 'Quarto 302', checkin: '20 Nov, 2026', checkout: '23 Nov, 2026', amount: '75.000 Kz', status: 'Confirmada', statusClass: 'confirmed' },
];
