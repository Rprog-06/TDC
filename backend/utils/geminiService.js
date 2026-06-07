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
Customer:
${customer.firstName}

Match:
${match.firstName}

Explain in 2 lines why this
could be a good match.
`;

 const result =
 await model.generateContent(
  prompt
 );

 return result.response.text();
}

module.exports =
generateReason;