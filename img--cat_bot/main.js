const TelegramBot = require("node-telegram-bot-api");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Replace with your Telegram bot token
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Handle /help command
  if (msg.text && msg.text.toLowerCase() === "/help") {
    bot.sendMessage(
      chatId,
      'Please send an image with the caption "/selfie" to get selfie with kefir!'
    );
    return;
  }

  // Handle images with /cat caption
  if (msg.photo && msg.caption && msg.caption.includes("/selfie")) {
    try {
      // Get the file ID of the highest resolution photo
      const fileId = msg.photo[msg.photo.length - 1].file_id;

      // Get the file path
      const file = await bot.getFile(fileId);
      const filePath = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

      // Download the image
      const image = await Jimp.read(filePath);

      // Load the cat overlay image
      const cat = await Jimp.read("cat.png"); // Ensure you have a cat.png in the same directory

      // Resize the cat image to be larger
      const catWidth = image.bitmap.width; // Change this fraction to make the cat larger
      const catHeight = Jimp.AUTO;
      cat.resize(catWidth, catHeight);

      // Calculate position to place the cat image (bottom right corner)
      const x = image.bitmap.width - cat.bitmap.width;
      const y = image.bitmap.height - cat.bitmap.height;

      // Composite the cat image onto the original image
      image.composite(cat, x, y);

      // Save the final image
      const outputFilePath = path.join(__dirname, `output_${chatId}.png`);
      await image.writeAsync(outputFilePath);

      // Send the final image back to the user
      await bot.sendPhoto(chatId, outputFilePath, {
        caption: "Here is your selfie with kefir!",
      });

      // Clean up the saved image file
      fs.unlinkSync(outputFilePath);
    } catch (error) {
      console.error("Error processing image:", error);
      // Only log the error, don't send any message to the user
    }
  }
  // No else condition, the bot will remain silent for other messages
});
