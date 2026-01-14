const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not set');
        }

        const globalCache = global.mongooseConnectionCache || (global.mongooseConnectionCache = { conn: null, promise: null });

        if (globalCache.conn) {
            return globalCache.conn;
        }

        if (!globalCache.promise) {
            globalCache.promise = mongoose.connect(process.env.MONGO_URI);
        }

        globalCache.conn = await globalCache.promise;
        console.log("MongoDB Connected..");
        return globalCache.conn;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

module.exports = connectDB;
