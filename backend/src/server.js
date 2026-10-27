require("dotenv").config();

const app = require("./app");
const { connectDB, sequelize } = require("./config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    await sequelize.sync({ alter: true });
    console.log("MySQL models synchronized");


    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
