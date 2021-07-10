const express = require("express");
const router = new express.Router();
const multer = require("multer");
const StreamArray = require("stream-json/streamers/StreamArray");
const fs = require("fs");
const jsonStream = StreamArray.withParser();
const Thermometer = require("../models/thermometerModel");

//node --max-old-space-size=4096 app.js

//? Uploading the file to uploads folder using multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//? Filtering received files
const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.json$/)) {
      return cb(new Error("File should be an JSON file with json extension"));
    }
    cb(undefined, true);
  },
  // storage,
});

router.post(
  "/submitFile",
  upload.single("file"),
  async (req, res) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const template = [];

    const dbId = 1;
    const dbData = {
      thermId: dbId,
      yearTemp: template,
    };

    //Initialising DB Values
    try {
      const tempData = new Thermometer(dbData);
      await tempData.save();
      res.send({
        success: 1,
        result: tempData,
        message: "Data Inialized Successfully",
      });
    } catch (error) {
      throw new Error(error.message);
    }

    //internal Node readable stream option, pipe to stream-json to convert it for us
    fs.createReadStream(`uploads/${req.file.originalname}`).pipe(jsonStream.input);
    jsonStream.on("data", ({ key, value }) => {
      console.log("Executing", key);

      const d_month = new Date(value.ts).getMonth();

      const arrIndex = template.findIndex((oj) => oj.month === months[d_month]);

      if (arrIndex > -1) {
        template[arrIndex].temperature += value.val;
        template[arrIndex].count++;
      } else {
        const tempobj = {
          month: months[d_month],
          temperature: value.val,
          count: 1,
        };
        template.push(tempobj);
      }
    });

    jsonStream.on("end", async () => {
      console.log("== TEMPLATE ==", template);

      const dataToUpdate = [];

      for (const item of template) {
        const temperatureObj = {
          month: "",
          temperature: 0,
        };

        temperatureObj.month = item.month;

        temperatureObj.temperature = Number((item.temperature / item.count).toFixed(2));

        dataToUpdate.push(temperatureObj);
      }

      const dbFilter = {
        thermId: dbId,
      };

      const updatedData = {
        $set: {
          yearTemp: dataToUpdate,
        },
      };

      const updateThermometer = await Thermometer.findOneAndUpdate(dbFilter, updatedData);
      fs.unlinkSync(`uploads/${req.file.originalname}`); //Remove File after operation
      console.log("All Done");
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ success: 0, result: [], message: error.message });
  }
);

//retrieve Graph Data
router.get(
  "/temperature/:thermId",
  async(req, res) => {
    try {
      const thermId = Number(req.params.thermId);
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const graphData = await Thermometer.findOne({ thermId });
      const finalData = [];
      graphData.yearTemp.forEach((val) => {
        const index = months.indexOf(val.month);
        finalData[index] = val;
      });
      const responseToSend = {
        success:1,
        result:finalData,
        message:"Graph Data Found Successfully"
      }
      res.send(responseToSend);
    } catch (error) {
      console.log("🚀 ~ file: routes.js ~ line 140 ~ async ~ error", error);
    }
    
  },
  (error, req, res, next) => {
    res.status(400).send({ success: 0, result: [], message: error.message });
  }
);

module.exports = router;
