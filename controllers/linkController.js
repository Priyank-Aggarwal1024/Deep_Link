const linkModel = require("../models/Link");

exports.createShortDeepLink = async (req, res) => {
  try {
    const { longURL, userType } = req.body;
    if (!longURL) return res.status(400).json({ error: "URL is required" });

    let extractedPath = longURL.split("/").slice(3).join("/"); 
    let deepLink = "";
    let iosLink = ""; 

    switch (userType) {
      case "customer":
        deepLink = `rydeu://app/${extractedPath}`;
        iosLink = `rydeu://app/${extractedPath}`;
        break;
      case "supplier":
        deepLink = `rydeu-supplier://app/${extractedPath}`;
        iosLink = `rydeu-supplier://app/${extractedPath}`; // Keeping iOS consistent
        break;
      case "organization":
        deepLink = `rydeu-org://app/${extractedPath}`;
        iosLink = `rydeu://app/${extractedPath}`;
        break;
      default:
        deepLink = `rydeu://default/${extractedPath}`;
        iosLink = `rydeu://app/${extractedPath}`;
    }

    const newLink = await linkModel.create({ longURL, deepLink, iosLink, userType });

    res.json({ 
      shortURL: `${process.env.BASE_URL}/${newLink.shortId}`, 
      deepLink,
      iosLink
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.redirectShortLink = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userAgent = req.get("User-Agent") || ""; 

    const link = await Lin.findOne({ shortId });
    if (!link) {
      return res.status(404).json({ error: "Short link not found" });
    }

    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isMobileApp = /RydeuApp|RydeuSupplier/i.test(userAgent); 

    let deepLink = link.deepLink;
    let iosLink = link.iosLink;
    let webFallback = link.longURL;

    if (isMobileApp) {
      return res.redirect(deepLink);
    } else if (isAndroid) {
      res.send(`
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${deepLink}">
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
    } else if (isIOS) {
      res.send(`
        <html>
        <head>
          <meta http-equiv="refresh" content="0; url=${iosLink}">
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
      return res.redirect(webFallback);
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
