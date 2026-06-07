export const calculateMatchScore = (customer, candidate) => {
  if (!customer || !candidate) return 0;
  if (customer.gender === candidate.gender) return 0;

  let score = 0;

  const ageDiff = Math.abs(customer.age - candidate.age);
  if (ageDiff <= 2) score += 20;
  else if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 8) score += 8;

  const incomeDiff = Math.abs(customer.income - candidate.income);
  if (incomeDiff <= 200000) score += 20;
  else if (incomeDiff <= 500000) score += 15;
  else if (incomeDiff <= 900000) score += 8;

  const heightDiff = Math.abs(customer.height - candidate.height);
  if (heightDiff <= 5) score += 20;
  else if (heightDiff <= 10) score += 12;
  else if (heightDiff <= 15) score += 6;

  if (customer.wantKids === candidate.wantKids) score += 20;
  if (customer.profession === candidate.profession) score += 10;
  if (customer.relocate === candidate.relocate) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
};
