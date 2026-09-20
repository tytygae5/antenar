// Revenue and channel Adsense/Membros performance aggregator

let revenueHistory = [
  { month: 'Abril', adsense: 420.50, membros: 80.00, superchats: 15.00, total: 515.50 },
  { month: 'Maio', adsense: 590.20, membros: 110.00, superchats: 20.00, total: 720.20 },
  { month: 'Junho', adsense: 710.00, membros: 140.00, superchats: 35.00, total: 885.00 },
  { month: 'Julho', adsense: 847.32, membros: 230.00, superchats: 45.00, total: 1122.32 }
];

export function getRevenueStats() {
  const currentMonth = revenueHistory[revenueHistory.length - 1];
  const lastMonth = revenueHistory[revenueHistory.length - 2];
  
  const percentageIncrease = (((currentMonth.total - lastMonth.total) / lastMonth.total) * 100).toFixed(0);

  return {
    success: true,
    history: revenueHistory,
    current: currentMonth,
    projections: {
      nextMonth: (currentMonth.total * 1.15).toFixed(2),
      percent: '15'
    },
    trend: `+${percentageIncrease}% vs. mês anterior`,
    bestVideo: {
      title: "Gamma App Review Completo",
      earnings: 186.00
    }
  };
}

export function addRevenueRecord(month, adsense, membros, superchats) {
  const total = parseFloat(adsense) + parseFloat(membros) + parseFloat(superchats);
  const record = { month, adsense, membros, superchats, total };
  revenueHistory.push(record);
  return record;
}
