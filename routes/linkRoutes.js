const express = require("express");
const { createShortDeepLink, redirectShortLink } = require("../controllers/linkController");
const router = express.Router();

router.post("/shorten", createShortDeepLink);
router.get("/:shortId", redirectShortLink);

module.exports = router;
