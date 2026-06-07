const PROFESSIONAL_CLUSTERS = {
  tech: ["software", "engineer", "developer", "data", "product", "it"],
  business: ["manager", "consultant", "mba", "finance", "analyst", "business"],
  care: ["doctor", "teacher", "professor", "health", "medical"],
  creative: ["architect", "designer", "writer", "artist"],
  legal: ["lawyer", "legal", "advocate"],
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const isMaybe = (value) => normalize(value) === "maybe";

const sameValue = (left, right) =>
  normalize(left) && normalize(left) === normalize(right);

const getProfessionCluster = (profession) => {
  const normalizedProfession = normalize(profession);

  return Object.entries(PROFESSIONAL_CLUSTERS).find(([, keywords]) =>
    keywords.some((keyword) => normalizedProfession.includes(keyword))
  )?.[0];
};

const buildFitLabel = (score) => {
  if (score >= 85) return "High Potential Match";
  if (score >= 72) return "Strong Match";
  if (score >= 58) return "Promising Match";
  return "Needs Matchmaker Review";
};

const createScorecard = () => {
  const breakdown = [];
  const reasons = [];
  const cautions = [];
  let total = 0;

  const add = ({ label, score, max, reason, caution }) => {
    const safeScore = Math.max(0, Math.min(score, max));
    total += safeScore;
    breakdown.push({
      label,
      score: safeScore,
      max,
    });

    if (reason && safeScore >= Math.ceil(max * 0.55)) {
      reasons.push(reason);
    }

    if (caution && safeScore < Math.ceil(max * 0.45)) {
      cautions.push(caution);
    }
  };

  return {
    add,
    result: () => ({
      score: Math.round(total),
      breakdown,
      reasons,
      cautions,
    }),
  };
};

const scoreAge = (customer, candidate) => {
  const customerAge = toNumber(customer.age);
  const candidateAge = toNumber(candidate.age);

  if (!customerAge || !candidateAge) {
    return {
      label: "Age preference",
      score: 0,
      max: 18,
      caution: "Age data is missing for this comparison.",
    };
  }

  const gap = candidateAge - customerAge;
  const customerGender = normalize(customer.gender);

  if (customerGender === "male") {
    if (gap <= -1 && gap >= -6) {
      return {
        label: "Age preference",
        score: 18,
        max: 18,
        reason: "Age gap fits the requested preference for a younger partner.",
      };
    }

    if (gap === 0) {
      return {
        label: "Age preference",
        score: 13,
        max: 18,
        reason: "Same-age match keeps life stage closely aligned.",
      };
    }

    if (gap < -6 && gap >= -10) {
      return {
        label: "Age preference",
        score: 10,
        max: 18,
        reason: "Candidate is younger, though the age gap needs review.",
        caution: "The age gap is wider than the ideal range.",
      };
    }

    if (gap > 0 && gap <= 2) {
      return {
        label: "Age preference",
        score: 7,
        max: 18,
        caution: "Candidate is slightly older than the stated preference.",
      };
    }
  }

  if (customerGender === "female") {
    if (gap >= 1 && gap <= 6) {
      return {
        label: "Age preference",
        score: 18,
        max: 18,
        reason: "Age gap fits a common preference for a slightly older partner.",
      };
    }

    if (gap === 0) {
      return {
        label: "Age preference",
        score: 14,
        max: 18,
        reason: "Same-age match keeps life stage closely aligned.",
      };
    }

    if (gap > 6 && gap <= 10) {
      return {
        label: "Age preference",
        score: 9,
        max: 18,
        reason: "Candidate is older, though the age gap needs review.",
        caution: "The age gap is wider than the ideal range.",
      };
    }

    if (gap < 0 && gap >= -2) {
      return {
        label: "Age preference",
        score: 7,
        max: 18,
        caution: "Candidate is slightly younger than the stated preference.",
      };
    }
  }

  const absoluteGap = Math.abs(gap);

  return {
    label: "Age preference",
    score: absoluteGap <= 8 ? 6 : 2,
    max: 18,
    caution: "Age preference is outside the ideal range.",
  };
};

const scoreIncome = (customer, candidate) => {
  const customerIncome = toNumber(customer.income);
  const candidateIncome = toNumber(candidate.income);

  if (!customerIncome || !candidateIncome) {
    return {
      label: "Income alignment",
      score: 0,
      max: 14,
      caution: "Income data is missing for this comparison.",
    };
  }

  const customerGender = normalize(customer.gender);
  const ratio = candidateIncome / customerIncome;

  if (customerGender === "male") {
    if (ratio >= 0.65 && ratio <= 1) {
      return {
        label: "Income alignment",
        score: 14,
        max: 14,
        reason: "Income levels fit the requested traditional earning preference.",
      };
    }

    if (ratio < 0.65) {
      return {
        label: "Income alignment",
        score: 9,
        max: 14,
        reason: "Candidate earns less, with a larger financial gap to review.",
        caution: "Income difference is wider than ideal.",
      };
    }

    if (ratio <= 1.25) {
      return {
        label: "Income alignment",
        score: 7,
        max: 14,
        caution: "Candidate earns slightly more than the stated preference.",
      };
    }
  }

  if (customerGender === "female") {
    if (ratio >= 1 && ratio <= 1.8) {
      return {
        label: "Income alignment",
        score: 14,
        max: 14,
        reason: "Income suggests strong financial stability and parity.",
      };
    }

    if (ratio >= 0.75 && ratio < 1) {
      return {
        label: "Income alignment",
        score: 10,
        max: 14,
        reason: "Income is close enough to support financial compatibility.",
      };
    }

    if (ratio > 1.8) {
      return {
        label: "Income alignment",
        score: 8,
        max: 14,
        caution: "Large income gap may need expectation-setting.",
      };
    }
  }

  return {
    label: "Income alignment",
    score: 3,
    max: 14,
    caution: "Income alignment is weak for this pairing.",
  };
};

const scoreHeight = (customer, candidate) => {
  const customerHeight = toNumber(customer.height);
  const candidateHeight = toNumber(candidate.height);

  if (!customerHeight || !candidateHeight) {
    return {
      label: "Height preference",
      score: 0,
      max: 12,
      caution: "Height data is missing for this comparison.",
    };
  }

  const gap = candidateHeight - customerHeight;
  const customerGender = normalize(customer.gender);

  if (customerGender === "male") {
    if (gap <= 0 && gap >= -15) {
      return {
        label: "Height preference",
        score: 12,
        max: 12,
        reason: "Height fits the requested preference for a shorter partner.",
      };
    }

    if (gap > 0 && gap <= 5) {
      return {
        label: "Height preference",
        score: 6,
        max: 12,
        caution: "Candidate is slightly taller than the stated preference.",
      };
    }
  }

  if (customerGender === "female") {
    if (gap >= 0 && gap <= 15) {
      return {
        label: "Height preference",
        score: 12,
        max: 12,
        reason: "Height fits a common preference for a similar or taller partner.",
      };
    }

    if (gap < 0 && gap >= -5) {
      return {
        label: "Height preference",
        score: 6,
        max: 12,
        caution: "Candidate is slightly shorter than the stated preference.",
      };
    }
  }

  return {
    label: "Height preference",
    score: Math.abs(gap) <= 10 ? 5 : 2,
    max: 12,
    caution: "Height preference is outside the ideal range.",
  };
};

const scoreChildren = (customer, candidate) => {
  if (sameValue(customer.wantKids, candidate.wantKids)) {
    return {
      label: "Children preference",
      score: 16,
      max: 16,
      reason: "Both profiles share the same view on having children.",
    };
  }

  if (isMaybe(customer.wantKids) || isMaybe(candidate.wantKids)) {
    return {
      label: "Children preference",
      score: 8,
      max: 16,
      caution: "Children preference has flexibility but needs conversation.",
    };
  }

  return {
    label: "Children preference",
    score: 0,
    max: 16,
    caution: "Different views on children are a major compatibility risk.",
  };
};

const scoreRelocation = (customer, candidate) => {
  if (sameValue(customer.relocate, candidate.relocate)) {
    return {
      label: "Relocation preference",
      score: 12,
      max: 12,
      reason: "Relocation expectations are aligned.",
    };
  }

  if (isMaybe(customer.relocate) || isMaybe(candidate.relocate)) {
    return {
      label: "Relocation preference",
      score: 7,
      max: 12,
      reason: "At least one profile is flexible on relocation.",
      caution: "Relocation expectations should be clarified.",
    };
  }

  return {
    label: "Relocation preference",
    score: 1,
    max: 12,
    caution: "Relocation expectations are not aligned.",
  };
};

const scoreProfession = (customer, candidate) => {
  const customerProfession = normalize(customer.profession || customer.designation);
  const candidateProfession = normalize(candidate.profession || candidate.designation);

  if (!customerProfession || !candidateProfession) {
    return {
      label: "Career compatibility",
      score: 0,
      max: 12,
      caution: "Career data is missing for this comparison.",
    };
  }

  if (customerProfession === candidateProfession) {
    return {
      label: "Career compatibility",
      score: 12,
      max: 12,
      reason: "Both profiles work in the same profession.",
    };
  }

  const customerCluster = getProfessionCluster(customerProfession);
  const candidateCluster = getProfessionCluster(candidateProfession);

  if (customerCluster && customerCluster === candidateCluster) {
    return {
      label: "Career compatibility",
      score: 8,
      max: 12,
      reason: "Career paths sit in a similar professional cluster.",
    };
  }

  return {
    label: "Career compatibility",
    score: 5,
    max: 12,
    reason: "Both profiles have established professional backgrounds.",
  };
};

const scoreLocation = (customer, candidate) => {
  if (sameValue(customer.city, candidate.city)) {
    return {
      label: "Location fit",
      score: 8,
      max: 8,
      reason: "Both profiles are in the same city.",
    };
  }

  return {
    label: "Location fit",
    score: 0,
    max: 8,
    caution: "Different cities make this a long-distance or relocation match.",
  };
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const buildTags = ({ score, reasons, cautions }) => {
  const tags = [];

  if (score >= 85) tags.push("High Potential");
  else if (score >= 72) tags.push("Strong Fit");
  else if (score >= 58) tags.push("Promising");
  else tags.push("Review");

  if (reasons.some((reason) => reason.includes("children"))) {
    tags.push("Values Aligned");
  }

  if (reasons.some((reason) => reason.includes("Relocation"))) {
    tags.push("Relocation Fit");
  }

  if (reasons.some((reason) => reason.includes("profession") || reason.includes("Career"))) {
    tags.push("Career Fit");
  }

  if (!cautions.length) {
    tags.push("Low Friction");
  }

  return unique(tags).slice(0, 4);
};

const calculateMatchFit = (customer, candidate) => {
  if (!customer || !candidate) {
    return {
      score: 0,
      fitLabel: "Invalid Profile",
      tags: [],
      reasons: [],
      cautions: ["Customer or candidate profile is missing."],
      breakdown: [],
    };
  }

  if (sameValue(customer.gender, candidate.gender)) {
    return {
      score: 0,
      fitLabel: "Not Eligible",
      tags: ["Not Eligible"],
      reasons: [],
      cautions: ["Same-gender profiles are excluded for this assignment brief."],
      breakdown: [
        {
          label: "Gender fit",
          score: 0,
          max: 8,
        },
      ],
    };
  }

  const scorecard = createScorecard();

  scorecard.add({
    label: "Gender fit",
    score: 8,
    max: 8,
    reason: "Profile is eligible by opposite-gender matching rule.",
  });
  scorecard.add(scoreAge(customer, candidate));
  scorecard.add(scoreIncome(customer, candidate));
  scorecard.add(scoreHeight(customer, candidate));
  scorecard.add(scoreChildren(customer, candidate));
  scorecard.add(scoreRelocation(customer, candidate));
  scorecard.add(scoreProfession(customer, candidate));
  scorecard.add(scoreLocation(customer, candidate));

  const result = scorecard.result();

  return {
    ...result,
    fitLabel: buildFitLabel(result.score),
    tags: buildTags(result),
  };
};

module.exports = calculateMatchFit;
