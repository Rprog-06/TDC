const fs = require("fs");
const { faker } = require("@faker-js/faker");

const profiles = [];

const professions = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Lawyer",
  "Manager",
  "Architect"
];

for (let i = 1; i <= 100; i++) {
  profiles.push({
    id: i,

    firstName: faker.person.firstName(),

    gender:
      i % 2 === 0
        ? "Female"
        : "Male",

    age:
      Math.floor(Math.random() * 10) + 24,

    city:
      faker.location.city(),

    height:
      Math.floor(Math.random() * 20) + 155,

    income:
      Math.floor(Math.random() * 2000000)
      + 500000,

    profession:
      professions[
        Math.floor(
          Math.random() *
          professions.length
        )
      ],

    wantKids:
      Math.random() > 0.5
        ? "Yes"
        : "No",

    relocate:
      Math.random() > 0.5
        ? "Yes"
        : "No"
  });
}

fs.writeFileSync(
  "./data/profiles.json",
  JSON.stringify(profiles, null, 2)
);

console.log("100 profiles generated");