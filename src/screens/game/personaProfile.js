import { getLocationSelection } from "../../data/locationCatalog";

const SETTINGS_STORAGE_KEY = "earth-online-settings";

function stripOptionPrefix(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/^[A-ZＡ-Ｚ]\s*[：:]\s*/, "").trim();
}

function normalizeSingleValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return stripOptionPrefix(value);
  }

  if (typeof value === "object") {
    if (typeof value.other === "string" && value.other.trim()) {
      return value.other.trim();
    }

    if (typeof value.selected === "string") {
      return stripOptionPrefix(value.selected);
    }
  }

  return "";
}

function normalizeMultiValue(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => stripOptionPrefix(item))
    .filter((item) => item.length > 0);
}

function formatBirthDate(birthDate) {
  if (!birthDate?.year || !birthDate?.month || !birthDate?.day) {
    return "未标定";
  }

  return `${birthDate.year}-${String(birthDate.month).padStart(2, "0")}-${String(
    birthDate.day,
  ).padStart(2, "0")}`;
}

function buildAge(birthDate) {
  if (!birthDate?.year || !birthDate?.month || !birthDate?.day) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.year;
  const passedBirthday =
    now.getMonth() + 1 > birthDate.month ||
    (now.getMonth() + 1 === birthDate.month && now.getDate() >= birthDate.day);

  if (!passedBirthday) {
    age -= 1;
  }

  return age;
}

function buildLevel(score, highThreshold, midThreshold) {
  if (score >= highThreshold) {
    return "高";
  }

  if (score >= midThreshold) {
    return "中";
  }

  return "低";
}

function buildSaveModel(cleaned) {
  const socialScore =
    (cleaned.birthplaceTier.includes("一线") ? 2 : 0) +
    (cleaned.familyType.includes("稳定") || cleaned.familyType.includes("体制") ? 2 : 0) +
    (cleaned.familyExpectation.includes("出人头地") ||
    cleaned.familyExpectation.includes("安排")
      ? 1
      : 0) +
    (cleaned.meaningOfHome.includes("避风港") ? 1 : 0);

  const attributeScore =
    cleaned.skillBias.length +
    (cleaned.learningStyle.includes("自学") || cleaned.learningStyle.includes("试错")
      ? 1
      : 0) -
    (cleaned.biggestWeakness.includes("三分钟热度") ||
    cleaned.biggestWeakness.includes("想太多")
      ? 1
      : 0);

  const vitalityScore =
    (cleaned.bodyFeedback.includes("精力旺盛") ? 3 : 0) +
    (cleaned.bodyFeedback.includes("一般") ? 2 : 0) +
    (cleaned.bodyFeedback.includes("容易疲惫") ? 1 : 0) +
    (cleaned.bodyCareAttitude.includes("规律维护") ? 2 : 0) +
    (cleaned.bodyCareAttitude.includes("焦虑但拖延") ? 1 : 0);

  const eventScore =
    (cleaned.moneyMindset.includes("搞钱优先") ? 2 : 0) +
    (cleaned.emergencyCash.includes("自己的存款") ? 2 : 0) +
    (cleaned.smallEmergencyCash.includes("自己的存款") ? 1 : 0) +
    (cleaned.alienBelief.includes("希望有") ? 1 : 0) +
    (cleaned.lifePriority.includes("隐藏的秘密") ? 1 : 0);

  return {
    social: {
      code: "S",
      label: `Social · ${buildLevel(socialScore, 5, 3)}`,
      score: socialScore,
      summary: cleaned.birthplaceTier || cleaned.familyType || "社会起点待补全",
    },
    attribute: {
      code: "A",
      label: `Attribute · ${buildLevel(attributeScore, 4, 2)}`,
      score: attributeScore,
      summary:
        cleaned.skillBias.join(" / ") || cleaned.learningStyle || "能力模组待补全",
    },
    vitality: {
      code: "V",
      label: `Vitality · ${buildLevel(vitalityScore, 5, 3)}`,
      score: vitalityScore,
      summary: cleaned.bodyFeedback || cleaned.bodyCareAttitude || "身心阈值待补全",
    },
    event: {
      code: "E",
      label: `Event · ${buildLevel(eventScore, 4, 2)}`,
      score: eventScore,
      summary:
        cleaned.emergencyCash || cleaned.moneyMindset || cleaned.lifePriority || "时运样本待补全",
    },
  };
}

function buildTags(cleaned) {
  return [
    cleaned.birthplaceTier,
    cleaned.familyExpectation,
    cleaned.relaxMode,
    cleaned.skillBias[0],
    cleaned.deepestDesire,
    cleaned.relationshipStatus,
    cleaned.moneyMindset,
    cleaned.careerStatus,
  ].filter(Boolean);
}

function buildSignals(cleaned) {
  return {
    pressureTriggers: [
      cleaned.familyExpectation,
      cleaned.biggestWeakness,
      cleaned.loveFear,
      cleaned.emergencyCash,
    ].filter(Boolean),
    comfortZones: [
      cleaned.relaxMode,
      cleaned.meaningOfHome,
      cleaned.deepestDesire,
    ].filter(Boolean),
    relationshipLens: [
      cleaned.attachmentStyle,
      cleaned.partnerPriority,
      cleaned.parentsMarriageImpact,
    ].filter(Boolean),
  };
}

function buildCleanedAnswers(rawAnswers = {}) {
  const birthDate = rawAnswers.birthDate || null;
  const currentLocation = getLocationSelection(rawAnswers.currentCity);

  return {
    birthDate,
    birthplaceTier: normalizeSingleValue(rawAnswers.birthplaceTier),
    familyType: normalizeSingleValue(rawAnswers.familyType),
    familyExpectation: normalizeSingleValue(rawAnswers.familyExpectation),
    childhoodFeedback: normalizeSingleValue(rawAnswers.childhoodFeedback),
    similarToParents: normalizeSingleValue(rawAnswers.similarToParents),
    meaningOfHome: normalizeSingleValue(rawAnswers.meaningOfHome),
    bodyFeedback: normalizeSingleValue(rawAnswers.bodyFeedback),
    bodyCareAttitude: normalizeSingleValue(rawAnswers.bodyCareAttitude),
    relaxMode: normalizeSingleValue(rawAnswers.relaxMode),
    skillBias: normalizeMultiValue(rawAnswers.skillBias),
    learningStyle: normalizeSingleValue(rawAnswers.learningStyle),
    biggestWeakness: normalizeSingleValue(rawAnswers.biggestWeakness),
    greatestFear: normalizeSingleValue(rawAnswers.greatestFear),
    deepestDesire: normalizeSingleValue(rawAnswers.deepestDesire),
    lifePriority: normalizeSingleValue(rawAnswers.lifePriority),
    alienBelief: normalizeSingleValue(rawAnswers.alienBelief),
    relationshipStatus: normalizeSingleValue(rawAnswers.relationshipStatus),
    attachmentStyle: normalizeSingleValue(rawAnswers.attachmentStyle),
    partnerPriority: normalizeSingleValue(rawAnswers.partnerPriority),
    loveFear: normalizeSingleValue(rawAnswers.loveFear),
    parentsMarriageImpact: normalizeSingleValue(rawAnswers.parentsMarriageImpact),
    savingsLevel: normalizeSingleValue(rawAnswers.savingsLevel),
    debtStatus: normalizeSingleValue(rawAnswers.debtStatus),
    incomeSource: normalizeSingleValue(rawAnswers.incomeSource),
    moneyMindset: normalizeSingleValue(rawAnswers.moneyMindset),
    emergencyCash: normalizeSingleValue(rawAnswers.emergencyCash),
    smallEmergencyCash: normalizeSingleValue(rawAnswers.smallEmergencyCash),
    careerStatus: normalizeSingleValue(rawAnswers.careerStatus),
    carryItem: normalizeSingleValue(rawAnswers.carryItem),
    currentCity:
      rawAnswers.currentCity && typeof rawAnswers.currentCity === "object"
        ? {
            provinceId: rawAnswers.currentCity.provinceId || "",
            cityId: rawAnswers.currentCity.cityId || "",
          }
        : { provinceId: "", cityId: "" },
    currentLocation,
    playerName:
      typeof rawAnswers.playerName === "string" && rawAnswers.playerName.trim()
        ? rawAnswers.playerName.trim()
        : "未命名旅客",
  };
}

export function readStoredPersonaAnswers() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

export function buildPersonaProfile(rawAnswers = {}) {
  const cleaned = buildCleanedAnswers(rawAnswers);
  const birthDateLabel = formatBirthDate(cleaned.birthDate);
  const age = buildAge(cleaned.birthDate);
  const saveModel = buildSaveModel(cleaned);
  const tags = buildTags(cleaned);
  const signals = buildSignals(cleaned);

  return {
    profileVersion: 2,
    boundAt: new Date().toISOString(),
    identity: {
      name: cleaned.playerName,
      birthDate: birthDateLabel,
      age,
      careerStatus: cleaned.careerStatus,
      carryItem: cleaned.carryItem,
      location: cleaned.currentLocation,
    },
    anchors: {
      origin: {
        birthplace: cleaned.birthplaceTier,
        familyType: cleaned.familyType,
        familyExpectation: cleaned.familyExpectation,
        currentCity: cleaned.currentLocation?.city || "",
        currentProvince: cleaned.currentLocation?.province || "",
      },
      body: {
        feedback: cleaned.bodyFeedback,
        careAttitude: cleaned.bodyCareAttitude,
        relaxMode: cleaned.relaxMode,
      },
      skills: {
        bias: cleaned.skillBias,
        learningStyle: cleaned.learningStyle,
        weakness: cleaned.biggestWeakness,
      },
      soul: {
        fear: cleaned.greatestFear,
        desire: cleaned.deepestDesire,
        priority: cleaned.lifePriority,
      },
      love: {
        status: cleaned.relationshipStatus,
        attachment: cleaned.attachmentStyle,
        priority: cleaned.partnerPriority,
      },
      finance: {
        savings: cleaned.savingsLevel,
        debt: cleaned.debtStatus,
        income: cleaned.incomeSource,
        cashFlow: cleaned.emergencyCash,
      },
    },
    saveModel,
    tags,
    signals,
    rawAnswers: {
      ...cleaned,
      currentCity: cleaned.currentCity,
    },
  };
}
