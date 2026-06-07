const assert = require("node:assert/strict");

const calculateMatchFit = require("../utils/matchingalgo");

const baseCustomer = {
  id: 1,
  firstName: "Riya",
  lastName: "Sharma",
  age: 29,
  gender: "Female",
  city: "Mumbai",
  height: 164,
  income: 1600000,
  profession: "Consultant",
  wantKids: "Yes",
  relocate: "Maybe",
};

const strongFemaleCustomerMatch = {
  id: 2,
  firstName: "Arjun",
  age: 32,
  gender: "Male",
  city: "Mumbai",
  height: 176,
  income: 2200000,
  profession: "Manager",
  wantKids: "Yes",
  relocate: "Yes",
};

const maleCustomer = {
  ...baseCustomer,
  id: 3,
  firstName: "Rahul",
  age: 31,
  gender: "Male",
  height: 178,
  income: 2000000,
  profession: "Software Engineer",
  relocate: "No",
};

const strongMaleCustomerMatch = {
  id: 4,
  firstName: "Ananya",
  age: 27,
  gender: "Female",
  city: "Mumbai",
  height: 165,
  income: 1500000,
  profession: "Software Engineer",
  wantKids: "Yes",
  relocate: "No",
};

const sameGenderFit = calculateMatchFit(baseCustomer, {
  ...strongFemaleCustomerMatch,
  gender: "Female",
});

assert.equal(sameGenderFit.score, 0);
assert.equal(sameGenderFit.fitLabel, "Not Eligible");

const femaleCustomerFit = calculateMatchFit(
  baseCustomer,
  strongFemaleCustomerMatch
);

assert.ok(femaleCustomerFit.score >= 85);
assert.equal(femaleCustomerFit.fitLabel, "High Potential Match");
assert.ok(femaleCustomerFit.reasons.length >= 3);
assert.ok(femaleCustomerFit.breakdown.length >= 6);
assert.ok(femaleCustomerFit.tags.includes("High Potential"));

const maleCustomerFit = calculateMatchFit(
  maleCustomer,
  strongMaleCustomerMatch
);

assert.ok(maleCustomerFit.score >= 85);
assert.ok(
  maleCustomerFit.reasons.some((reason) =>
    reason.includes("younger partner")
  )
);
assert.ok(
  maleCustomerFit.reasons.some((reason) =>
    reason.includes("shorter partner")
  )
);

console.log("Matching algorithm tests passed");
