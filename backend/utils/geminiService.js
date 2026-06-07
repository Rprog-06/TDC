const {
 GoogleGenerativeAI
} = require(
 "@google/generative-ai"
);

const genAI =
new GoogleGenerativeAI(
 process.env.GEMINI_API_KEY
);

async function generateReason(
 customer,
 match
) {

 const model =
 genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
 });

 const prompt = `
You are assisting a professional Indian matchmaking team.

Customer:
${customer.firstName} ${customer.lastName || ""}
Age: ${customer.age}
Gender: ${customer.gender}
City: ${customer.city}
Profession: ${customer.profession || customer.designation}
Income: ${customer.income}
Want kids: ${customer.wantKids}
Relocate: ${customer.relocate}

Suggested match:
${match.firstName} ${match.lastName || ""}
Age: ${match.age}
Gender: ${match.gender}
City: ${match.city}
Profession: ${match.profession || match.designation}
Income: ${match.income}
Want kids: ${match.wantKids}
Relocate: ${match.relocate}

Rule-based fit:
${match.fitLabel} (${match.score}%)
Reasons: ${(match.reasons || []).join("; ")}
Cautions: ${(match.cautions || []).join("; ") || "None"}

Write 2 concise, warm lines explaining why this is a good match.
Mention any caution gently if it matters.
`;

 const result =
 await model.generateContent(
  prompt
 );

 return result.response.text();
}

module.exports =
generateReason;
