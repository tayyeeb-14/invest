const generateReferralCode = (name = "USER") => {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "TV";
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${random}`;
};

module.exports = { generateReferralCode };
