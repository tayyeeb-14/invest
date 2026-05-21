const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, "");

export const toAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "";
  }
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }
  if (assetPath.startsWith("/")) {
    return `${backendOrigin}${assetPath}`;
  }
  return `${backendOrigin}/${assetPath}`;
};
