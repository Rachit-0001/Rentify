const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["Owner", "Tenant"],
        required: true
    },

    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant"
    }
});

module.exports = mongoose.model("User", userSchema);