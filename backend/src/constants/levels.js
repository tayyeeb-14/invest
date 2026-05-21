const LEVEL_THRESHOLDS = [300, 500, 700, 900, 1100];
const MAX_LEVEL = 5;
const MIN_START_INVESTMENT = 300;

const getLevelFromInvestment = (totalInvestment) => {
  let level = 0;
  LEVEL_THRESHOLDS.forEach((threshold, index) => {
    if (totalInvestment >= threshold) {
      level = index + 1;
    }
  });

  return Math.max(level, 1);
};

const getNextLevelThreshold = (currentLevel) => {
  if (currentLevel >= MAX_LEVEL) {
    return null;
  }

  return LEVEL_THRESHOLDS[currentLevel] || null;
};

module.exports = {
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  MIN_START_INVESTMENT,
  getLevelFromInvestment,
  getNextLevelThreshold
};
