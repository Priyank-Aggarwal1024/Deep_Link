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
console.log(shortId);
      // Find non-deleted link
      const link = await linkModel.findOne({ shortId });
      if (!link) {
        return res.status(404).json({ error: "Short link not found" });
      }

      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(userAgent);
      const isMobileApp = /RydeuApp|RydeuSupplier/i.test(userAgent);

      let redirectURL = link.longURL;

      // Redirect to deep links only for customer and supplier
      if ((link.userType === "customer" || link.userType === "supplier") && link.deepLink) {
        if (isMobileApp) {
          return res.redirect(link.deepLink);
        } else if (isIOS && link.iosLink) {
          redirectURL = link.iosLink;
        } else if (isAndroid && link.deepLink) {
          redirectURL = link.deepLink;
        }
      }

      return res.redirect(redirectURL);
    } catch (error) {
      console.error("Error in handleRedirect": ${error});
      return res.status(500).json({ error: "Server error" });
    }
  }
};
