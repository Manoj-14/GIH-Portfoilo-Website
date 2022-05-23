const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cons = require("consolidate");
var bodyParser = require("body-parser");
const schema = mongoose.Schema;
const twilio = require("twilio");

const app = express();

const port = process.env.PORT || 9000;
app.set("port", port);
app.set("views", __dirname + "/views");
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.use(express.static(path.join(__dirname + "/public")));
app.use(express.static("images"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// client.messages
//   .create({
//     body: "Hello from Node",
//     to: "+919741626527", // Text this number
//     from: "+12673234936", // From a valid Twilio number
//   })
//   .then((message) => console.log(message.sid))
//   .catch((err) => {
//     console.log(err);
//   });

const dbUrl =
  "mongodb://manoj:zaH0iLF5y26k2dbgaVA4uaJPk1FpHxH9GCcjBY0qdWYf5XZZu043JXLz1GQDFVgyN0mlDT7lGC7gRveRdFrHqA==@manoj.mongo.cosmos.azure.com:10255/donations?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@manoj@";

mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port);
    console.log("Connected to database and listening at", port);
  })
  .catch((err) => {
    console.log("Not connect to Database");
  });

const donateDet = new schema(
  {
    donar: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const contactUs = new schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
});
var sum;

const Item = new mongoose.model("Item", donateDet);
const conData = new mongoose.model("conData", contactUs);

app.all("/", (req, res) => {
  console.log(req.body);
  Item.aggregate(
    [{ $group: { _id: null, Total_amount: { $sum: "$amount" } } }],
    function (err, user) {
      if (err) console.log(err);
      else {
        sum = user[0].Total_amount;
        // console.log(sum);
        res.render("index.html", { name: sum });
      }
    }
  );
  // res.render("index.html");
});

app.all("/donateDet", (req, res) => {
  const userdata = new Item({
    donar: req.body.name,
    amount: req.body.amount,
    email: req.body.email,
  });
  userdata
    .save()
    .then((rest) => {
      Item.aggregate(
        [{ $group: { _id: null, Total_amount: { $sum: "$amount" } } }],
        function (err, user) {
          if (err) console.log(err);
          else {
            sum = user[0].Total_amount;
            res.render("index.html", { name: sum });
            console.log(sum);
            // res.send(rest);
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
});
app.all("/contact-us", (req, res) => {
  const usrData = new conData({
    name: req.body.name,
    email: req.body.email,
    feedback: req.body.feedback,
  });
  usrData
    .save()
    .then((rest) => {
      res.render("index.html");
    })
    .catch((err) => {
      console.log(err);
    });
  // res.render("index.html");
});

// console.log(sum);
// app.listen(port, () => {
//   console.log(`Listening to Port ${port}`);
// });
