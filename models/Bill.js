const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },

    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },

    year: {
        type: Number,
        required: true
    },

    previousReading: Number,

    currentReading: Number,

    unitsConsumed: Number,

    electricityRate: Number,

    electricityBill: Number,

    rent: Number,

    waterCharge: Number,

    previousBalance: {
        type: Number,
        default: 0
    },

    totalBill: Number,

    amountPaid: {
        type: Number,
        default: 0
    },

    balance: Number,

    status: {
        type: String,
        default: "Pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);