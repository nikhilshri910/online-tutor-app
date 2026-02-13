const crypto = require("crypto");
const env = require("../config/env");

function verifyZoomWebhookPlaceholder(req, res) {
  const event = req.body?.event;

  // Placeholder verification: compare a shared secret set in Zoom with local env.
  const incomingSecret = req.headers["x-zoom-webhook-secret"];
  const verified = Boolean(incomingSecret && env.zoom.webhookSecret && incomingSecret === env.zoom.webhookSecret);

  if (event === "endpoint.url_validation") {
    const plainToken = req.body?.payload?.plainToken || "";
    const encryptedToken = crypto
      .createHmac("sha256", env.zoom.webhookSecret || "placeholder")
      .update(plainToken)
      .digest("hex");

    return res.json({
      plainToken,
      encryptedToken,
      verified
    });
  }

  return res.json({ message: "Zoom webhook received", event, verified });
}

module.exports = {
  verifyZoomWebhookPlaceholder
};
