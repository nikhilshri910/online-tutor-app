const axios = require("axios");
const env = require("../config/env");

async function uploadToVimeoFromUrl(sourceVideoUrl, title) {
  if (!env.vimeo.accessToken) {
    throw Object.assign(new Error("Missing VIMEO_ACCESS_TOKEN"), { statusCode: 500 });
  }

  const response = await axios.post(
    "https://api.vimeo.com/me/videos",
    {
      name: title,
      upload: {
        approach: "pull",
        link: sourceVideoUrl
      },
      privacy: {
        view: "unlisted"
      }
    },
    {
      headers: {
        Authorization: `Bearer ${env.vimeo.accessToken}`,
        "Content-Type": "application/json"
      }
    }
  );

  const uri = response.data.uri || "";
  const vimeoVideoId = uri.split("/").pop();
  const embedUrl = vimeoVideoId ? `https://player.vimeo.com/video/${vimeoVideoId}` : null;

  return { vimeoVideoId, embedUrl };
}

module.exports = {
  uploadToVimeoFromUrl
};
