const Link = require("../models/Link");

exports.createShortDeepLink = async (req, res) => {
  try {
    const { longURL, userType } = req.body;
    if (!longURL) return res.status(400).json({ error: "URL is required" });

    let extractedPath = longURL.split("/").slice(3).join("/"); 
    let deepLink = "";

    switch (userType) {
      case "customer":
        deepLink = `rydeu://app/${extractedPath}`;
        break;
      case "supplier":
        deepLink = `rydeu-supplier://app/${extractedPath}`;
        break;
      case "organization":
        deepLink = `rydeu-org://app/${extractedPath}`;
        break;
      default:
        deepLink = `rydeu://default/${extractedPath}`;
    }

    const newLink = await Link.create({ longURL, deepLink, userType });

    res.json({ 
      shortURL: `${process.env.BASE_URL}/${newLink.shortId}`, 
      deepLink 
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.redirectShortLink = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userAgent = req.get("User-Agent") || ""; 

    const link = await Link.findOne({ shortId });
    if (!link) {
      return res.status(404).json({ error: "Short link not found" });
    }

    // Detect if the request is from a mobile browser or app
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isMobileApp = /RydeuApp|RydeuSupplier/i.test(userAgent); // Custom app identifiers

    if (isMobileApp) {
      // Redirect to deep link inside the app
      return res.redirect(link.deepLink);
    } else if (isAndroid || isIOS) {
      // Redirect to deep link with fallback to web
      const appLink = link.deepLink;
      const webFallback = link.longURL;

      res.send(`
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${appLink}">
          <script>
            setTimeout(function() {
              window.location.href = "${webFallback}";
            }, 2500);
          </script>
        </head>
        <body>
          If the app does not open, <a href="${webFallback}">click here</a>.
        </body>
        </html>
      `);
    } else {
      // Redirect to web version for desktop browsers
      return res.redirect(link.longURL);
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
