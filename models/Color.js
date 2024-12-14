const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var colorSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
            default: '668658cb36bed84ad82c6ed1',
        },
        PostedByuserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true, 
        },
    },
    {
        timestamps: true,
    }
);

//Export the model
module.exports = mongoose.model("Color", colorSchema);