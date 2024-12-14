const mongoose = require('mongoose');

const connectDB = async () => {

    try {
        await mongoose.connect('mongodb+srv://wibfashion-phase-3-master:1472580@cluster0.zokgk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
