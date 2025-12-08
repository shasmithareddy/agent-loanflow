export interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalPercentage: number;
  interestPercentage: number;
}

export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EMIResult {
  // EMI = (P × r × (1+r)^n) / ((1+r)^n – 1)
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const n = tenureMonths;

  if (monthlyInterestRate === 0) {
    const emi = principal / n;
    return {
      emi,
      totalAmount: principal,
      totalInterest: 0,
      principalPercentage: 100,
      interestPercentage: 0,
    };
  }

  const emi =
    (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, n)) /
    (Math.pow(1 + monthlyInterestRate, n) - 1);

  const totalAmount = emi * n;
  const totalInterest = totalAmount - principal;

  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    principalPercentage: Math.round((principal / totalAmount) * 100),
    interestPercentage: Math.round((totalInterest / totalAmount) * 100),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}
