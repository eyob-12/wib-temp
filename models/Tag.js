const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var tagSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
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
module.exports = mongoose.model("Tag", tagSchema);