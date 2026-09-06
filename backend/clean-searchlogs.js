const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");

async function cleanLogs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await mongoose.connection
      .collection("searchlogs")
      .deleteMany({});
    console.log("Deleted SearchLogs:", result.deletedCount);
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

cleanLogs();

// Bên trong thao tác của XPhat về việc đo độ bao phủ blackbox
