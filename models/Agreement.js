const mongoose = require("mongoose");

const agreementSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },

    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true
    },

    startDate: Date,

    endDate: Date,

    agreementAmount: Number,

    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model("Agreement", agreementSchema);