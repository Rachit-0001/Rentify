const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    propertyNumber: {
        type: String,
        required: true,
        unique: true
    },

    type: {
        type: String,
        enum: ["Room", "Shop"],
        required: true
    },

    rent: {
        type: Number,
        required: true
    },

    defaultWaterCharge: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["Vacant", "Occupied"],
        default: "Vacant"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Property", propertySchema);