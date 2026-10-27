const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        dialect: "mysql",
        logging: false,
    }
);

const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
    }
};

const connectMySQL = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL connected successfully");
    } catch (error) {
        console.error("MySQL connection failed:", error.message);
        throw error;
    }
};

const connectDB = async () => {
    await connectMongo();
    await connectMySQL();
};

module.exports = { connectDB, connectMongo, connectMySQL, sequelize };
