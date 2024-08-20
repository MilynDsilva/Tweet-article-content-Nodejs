const axios = require("axios");
const {
  TwitterApi,
  EUploadMimeType,
  TwitterApiV2Settings,
} = require("twitter-api-v2");
const fileType = require("file-type"); // To detect file type automatically
require("dotenv").config();

// Disable deprecation warnings (optional)
TwitterApiV2Settings.deprecationWarnings = false;

// Initialize Twitter client with your credentials
const client = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

async function postTweetWithImage() {
  try {
    // Step 1: Fetch the article details from the first API
    const articleResponse = await axios.get(
      "http://localhost:5000/api/articles/slug/google-pixel-9-series-launching-today-full-specifications-live-stream-details-and-what-to-expect-2024-08-13",
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          Origin: "http://localhost:3000",
          Pragma: "no-cache",
          Referer: "http://localhost:3000/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
      }
    );

    const { title, imageId } = articleResponse.data.data;

    // Step 2: Fetch the image using the image ID from the article
    const imageResponse = await axios.get(
      `http://localhost:5000/api/images/${imageId}/preview`,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          Origin: "http://localhost:3000",
          Pragma: "no-cache",
          Referer: "http://localhost:3000/",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-site",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
          Authorization: "", // Add your auth if needed
        },
        responseType: "arraybuffer", // Ensures that the image is fetched as binary data
      }
    );

    // Convert image data to a buffer
    const imageBuffer = Buffer.from(imageResponse.data);

    // Step 3: Detect the image type
    const type = await fileType.fromBuffer(imageBuffer);
    if (!type) {
      throw new Error("Could not determine the image type.");
    }

    // Log detected MIME type
    console.log("Detected MIME type:", type.mime);

    // Step 4: Upload the image to Twitter with the detected MIME type
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
      mimeType: type.mime,
    });

    // Log media ID and title for debugging
    console.log("Media ID:", mediaId);
    console.log("Title:", title);

    // Step 5: Create tweet text with a new line and URL
    const tweetText = `${title}\nRead More: www.techbytesinsight.com`;

    // Step 6: Post the tweet with the title, image, and URL
    const tweet = await client.v2.tweet({
      text: tweetText,
      media: {
        media_ids: [mediaId],
      },
    });

    console.log("Tweet posted:", tweet);
  } catch (error) {
    console.error("Error posting tweet:", error);
    if (error.data && error.data.errors) {
      console.error("Twitter API Error Details:", error.data.errors);
    }
  }
}

postTweetWithImage();
