const profiles =
require("../data/profiles.json");
const customers =
require("../data/customer.json");

const calculateMatchScore =
require("../utils/matchingalgo");
const generateReason =
require("../utils/geminiService");

const getMatches = async (req, res) => {

  const id = Number(req.params.id);
  const includeAiReason = req.query.ai === "true";
  const matchId = req.query.matchId ? Number(req.query.matchId) : null;

  const customer = customers.find(
    c => c.id === id
  );

  if (!customer) {
    return res.status(404).json({
      message: "Customer not found"
    });
  }

  const matches = profiles
    .map(candidate => ({
      ...candidate,
      score: calculateMatchScore(
        customer,
        candidate
      )
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a,b) => b.score - a.score)
    .slice(0,5);

  if (!includeAiReason) {
    return res.json(matches);
  }

  if (matchId) {
    const match = matches.find((candidate) => candidate.id === matchId);

    if (!match) {
      return res.status(404).json({
        message: "Match not found"
      });
    }

    try {
      const reason = await generateReason(customer, match);
      return res.json({
        ...match,
        reason
      });
    } catch (error) {
      console.error("Gemini reason failed:", error.message);
      return res.json({
        ...match,
        reason: "AI reason is unavailable right now."
      });
    }
  }

  const matchesWithReason = await Promise.all(
    matches.map(async (match) => {
      try {
        const reason = await generateReason(customer, match);

        return {
          ...match,
          reason
        };
      } catch (error) {
        console.error("Gemini reason failed:", error.message);

        return {
          ...match,
          reason: "AI reason is unavailable right now."
        };
      }
    })
  );

  res.json(matchesWithReason);
};

module.exports = {
  getMatches
};
