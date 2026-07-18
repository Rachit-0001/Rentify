const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
require("dotenv").config();
const Property = require("./models/Property");
const Tenant = require("./models/Tenant");
const Bill = require("./models/Bill");
const Payment = require("./models/Payment");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((err) => {
        console.log("❌ MongoDB Error:", err.message);
    });


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
      console.log("Connected DB:", mongoose.connection.name);
  });

app.get("/check-users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});






// Routes
app.get("/", (req, res) => {
    res.render("login");
});

//teanant dashboard
app.get("/tenant-dashboard", async (req, res) => {

    const user = await User.findById(
        req.session.userId
    );

    const tenant = await Tenant.findById(
        user.tenant
    ).populate("property");

    const bills = await Bill.find({
        tenant: tenant._id
    });

    res.render("tenantDashboard", {
        tenant,
        bills
    });
});

app.get(
"/tenant-dashboard/:id",
async (req, res) => {

    const tenant =
        await Tenant.findById(
            req.params.id
        ).populate("property");

    const bills =
        await Bill.find({
            tenant: tenant._id
        });

    res.render(
        "tenantDashboard",
        {
            tenant,
            bills
        }
    );
});
app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/");

    });

});
app.post("/login", async (req, res) => {

    try {

        const user = await User.findOne({
            username: req.body.username
        });

        if (!user) {
            return res.send("User not found");
        }

        const isMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!isMatch) {
            return res.send("Invalid Password");
        }

        req.session.userId = user._id;
        req.session.role = user.role;

        if (user.role === "Owner") {
            return res.redirect("/dashboard");
        }

        if (user.role === "Tenant") {
            return res.redirect(`/tenant-dashboard/${user.tenant}`);
        }

        return res.send("Invalid User Role");

    } catch (err) {
        console.log(err);
        res.send("Login Error");
    }

});
app.get("/create-owner", async (req, res) => {

    const bcrypt = require("bcryptjs");

    const hashedPassword =
        await bcrypt.hash("admin123", 10);

    await User.create({
        username: "admin",
        password: hashedPassword,
        role: "Owner"
    });

    res.send("Owner Created");

});



app.get("/dashboard", async (req, res) => {

    const totalProperties = await Property.countDocuments();

    const occupiedProperties = await Property.countDocuments({
        status: "Occupied"
    });

    const vacantProperties = await Property.countDocuments({
        status: "Vacant"
    });

    const totalTenants = await Tenant.countDocuments();

    const totalBills = await Bill.countDocuments();

    const totalPayments = await Payment.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ]);

    const pendingBills = await Bill.aggregate([
        {
            $group: {
                _id: null,
                totalPending: { $sum: "$balance" }
            }
        }
    ]);

    res.render("dashboard", {
        totalProperties,
        occupiedProperties,
        vacantProperties,
        totalTenants,
        totalBills,
        totalCollection: totalPayments[0]?.total || 0,
        pendingAmount: pendingBills[0]?.totalPending || 0
    });

});

//property
app.get("/property/add", (req, res) => {
    res.render("addProperty");
});

app.post("/property/add", async (req, res) => {
    try {

        await Property.create({
            propertyNumber: req.body.propertyNumber,
            type: req.body.type,
            rent: req.body.rent,
            defaultWaterCharge: req.body.defaultWaterCharge
        });

        res.redirect("/properties");

    } catch (err) {
    console.error(err);
    res.send(err.message);


    }
});

app.get("/properties", async (req, res) => {

    const properties = await Property.find();

    res.render("properties", {
        properties
    });

});

app.get("/property/delete/:id", async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.redirect("/properties");
    } catch (err) {
        console.log(err);
        res.send("Error deleting property");
    }
});


//property
app.get("/tenant/add", async (req, res) => {

    const properties = await Property.find({
        status: "Vacant"
    });

    res.render("addTenant", {
        properties
    });

});

app.post("/tenant/add", async (req, res) => {

    try {

        const tenant = await Tenant.create({
            name: req.body.name,
            phone: req.body.phone,
            property: req.body.property
        });

        await Property.findByIdAndUpdate(
            req.body.property,
            {
                status: "Occupied"
            }
        );

        const hashedPassword =
            await bcrypt.hash("123456", 10);

        await User.create({
            username: req.body.phone,
            password: hashedPassword,
            role: "Tenant",
            tenant: tenant._id
        });

        res.redirect("/tenants");

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }

});

app.get("/tenants", async (req, res) => {

    const tenants = await Tenant.find()
        .populate("property");

    res.render("tenants", {
        tenants
    });

});

app.get("/tenant/:id", async (req, res) => {

    const tenant = await Tenant.findById(req.params.id)
        .populate("property");

    const bills = await Bill.find({
        tenant: tenant._id
    }).sort({ createdAt: -1 });

    const payments = await Payment.find()
        .populate({
            path: "bill",
            match: {
                tenant: tenant._id
            }
        });

    const filteredPayments = payments.filter(
        p => p.bill
    );

    const pendingDue =
        bills.length > 0
            ? bills[bills.length - 1].balance
            : 0;

    res.render("tenantDetails", {
        tenant,
        bills,
        payments: filteredPayments,
        pendingDue
    });

});


//bill
app.get("/bill/add", async (req, res) => {

    const tenants = await Tenant.find()
        .populate("property");

    res.render("addBill", {
        tenants
    });

});

app.post("/bill/add", async (req, res) => {

    const tenant = await Tenant.findById(req.body.tenantId)
        .populate("property");

    const previousBill = await Bill.findOne({
        tenant: tenant._id
    }).sort({ createdAt: -1 });

    if (!req.body.month || !req.body.year) {
    return res.send("Month and Year are required");
}

    const previousBalance =
        previousBill ? previousBill.balance : 0;

    const unitsConsumed =
        req.body.currentReading -
        req.body.previousReading;

    const electricityBill =
        unitsConsumed *
        req.body.electricityRate;

    const totalBill =
        tenant.property.rent +
        tenant.property.defaultWaterCharge +
        electricityBill +
        previousBalance;

    await Bill.create({

        tenant: tenant._id,

        month: req.body.month,

        year: req.body.year,

        previousReading: req.body.previousReading,

        currentReading: req.body.currentReading,

        unitsConsumed,

        electricityRate: req.body.electricityRate,

        electricityBill,

        rent: tenant.property.rent,

        waterCharge:
            tenant.property.defaultWaterCharge,

        previousBalance,

        totalBill,

        balance: totalBill

    });

    res.redirect("/bills");

});

app.get("/bills", async (req, res) => {

    const bills = await Bill.find()
        .populate("tenant");

    res.render("bills", {
        bills
    });

});


//payments
app.get("/payment/:id", async (req, res) => {

    const bill = await Bill.findById(req.params.id)
        .populate("tenant");

    res.render("payment", { bill });

});
app.post("/payment/:id", async (req, res) => {

    const bill = await Bill.findById(req.params.id);

    const amountPaid = Number(req.body.amount);

    const newBalance = bill.balance - amountPaid;

    let status = "Partial";

    if (newBalance === 0) {
        status = "Paid";
    }

    if (newBalance < 0) {
        status = "Advance";
    }

    const receiptNumber =
        "REC-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000);

    const payment = await Payment.create({
        bill: bill._id,
        amount: amountPaid,
        paymentMode: req.body.paymentMode,
        receiptNumber
    });

    bill.amountPaid += amountPaid;
    bill.balance = newBalance;
    bill.status = status;

    await bill.save();

    res.redirect(`/receipt/${payment._id}`);
});


//receipt
app.get("/receipt/:paymentId", async (req, res) => {

    const payment = await Payment.findById(req.params.paymentId)
        .populate({
            path: "bill",
            populate: {
                path: "tenant"
            }
        });

    res.render("receipt", { payment });

});


//agreement
const today = new Date();
const next30Days = new Date();

next30Days.setDate(today.getDate() + 30);




// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});