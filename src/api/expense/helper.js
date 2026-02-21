const greedySettlementMinimizationAlgorithm = (settlement = {}) => {
  const result = [];
  let i = 0,
    j = 0;

  const { creditors, debtors, users } = settlement;
  if (!creditors?.length || !debtors?.length) return;

  while (i < creditors.length && j < debtors.length) {
    let credit = creditors[i].net;
    let debit = -debtors[j].net;
    let amount = Math.min(credit, debit);

    result.push({
      from: users[debtors[j]._id],
      to: users[creditors[i]._id],
      amount: Math.round(amount * 100) / 100,
    });

    creditors[i].net -= amount;
    debtors[j].net += amount;

    if (creditors[i].net === 0) i++;
    if (debtors[j].net === 0) j++;
  }
  return result;
};

export const settlementRearrangement = (settlements) => greedySettlementMinimizationAlgorithm(settlements?.[0]);
