const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
       
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    resource: {
        type: String,
        required: true,
 
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: { type: Object ,
        default: "",
    },
    Isread:{
        type:Boolean,
        default: false,
    }
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
