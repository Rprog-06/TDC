const calculateMatchScore = (
  customer,
  candidate
) => {

  if (
    customer.gender === candidate.gender
  )
    return 0;

  let score = 0;

  const ageDiff =
    Math.abs(customer.age - candidate.age);

  if (ageDiff <= 2)
    score += 25;
  else if (ageDiff <= 5)
    score += 15;

  if (
    customer.wantKids ===
    candidate.wantKids
  )
    score += 25;

  if (
    customer.profession ===
    candidate.profession
  )
    score += 25;

  if (
    customer.city === candidate.city
  )
    score += 25;

  return score;
};

module.exports = calculateMatchScore;