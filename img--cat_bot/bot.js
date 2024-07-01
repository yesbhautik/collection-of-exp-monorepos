const TelegramBot = require("node-telegram-bot-api");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

// Replace with your Telegram bot token
const token = "YOUR_TELEGRAM_BOT_TOKEN";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message. There are different kinds of messages.
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.photo && msg.caption && msg.caption.includes("/cat")) {
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
      const catWidth = image.bitmap.width / 1.8;
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
        contentType: "image/png", // Specify the content type
      });

      // Clean up the saved image file
      fs.unlinkSync(outputFilePath);
    } catch (error) {
      console.error("Error processing image:", error);
      bot.sendMessage(
        chatId,
        "There was an error processing your image. Please try again."
      );
    }
  } else if (msg.photo) {
    bot.sendMessage(
      chatId,
      'Please add the caption "/cat" to overlay a cat on your image.'
    );
  } else {
    bot.sendMessage(chatId, 'Please send an image with the caption "/cat".');
  }
});
