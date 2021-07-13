const express = require("express");
const router = new express.Router();
const multer = require("multer");
const StreamArray = require("stream-json/streamers/StreamArray");
const fs = require("fs");
const jsonStream = StreamArray.withParser();
const Thermometer = require("../models/thermometerModel");

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
  storage,
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

    res.send({
      success: 1,
      result: template,
      message: "Data Inialized Successfully",
    });
    //internal Node readable stream option, pipe to stream-json to convert it
    fs.createReadStream(`uploads/${req.file.originalname}`).pipe(jsonStream.input);
    jsonStream.on("data", ({ key, value }) => {
      console.log("Executing", key);

      const d_month = new Date(value.ts).getMonth();
      const d_week = new Date(value.ts).getDate();

      // Date 1 - 7 = week_1
      // Date 8 - 14 = week_2
      // Date 15 - 21 = week_3
      // Date 22+ = week_4
      let weekName = "";
      if (d_week >= 1 && d_week <= 7) {
        weekName = "week_1";
      } else if (d_week >= 8 && d_week <= 14) {
        weekName = "week_2";
      } else if (d_week >= 15 && d_week <= 21) {
        weekName = "week_3";
      } else {
        weekName = "week_4";
      }

      //To Find if Month is available in Template Variable
      const currentMonthIndex = template.findIndex((oj) => oj.month === months[d_month]);

      if (currentMonthIndex > -1) {
        //check if week is present in the current Month
        const weekIndex = template[currentMonthIndex].weeklyTemp.findIndex(
          (check) => check.week === weekName
        );

        //if week is available then increase its temperature by the "val" and the counter count by 1
        // if week is not available then add the month object containing the weekly Temperature array
        if (weekIndex > -1) {
          template[currentMonthIndex].weeklyTemp[weekIndex].temperature += value.val;
          template[currentMonthIndex].weeklyTemp[weekIndex].count++;
        } else {
          const weekObj = {
            week: weekName,
            temperature: value.val,
            count: 1,
          };

          template[currentMonthIndex].weeklyTemp.push(weekObj);
        }
      } else {
        const tempObj = {
          month: months[d_month],
          year: 2015,
          weeklyTemp: [
            {
              week: weekName,
              temperature: value.val,
              count: 1,
            },
          ],
        };
        template.push(tempObj);
      }
    });

    jsonStream.on("end", async () => {
      console.log("== TEMPLATE ==", template);

      const dataToUpdate = [];

      for (const item of template) {
        const monthlyTempObj = {
          month: "",
          year: 2015,
          weeklyTemp: [],
        };

        monthlyTempObj.month = item.month;
        item.weeklyTemp.forEach((value) => {
          const weeklyTempObj = {};
          weeklyTempObj["week"] = value.week;
          weeklyTempObj["temperature"] = Number((value.temperature / value.count).toFixed(2));
          monthlyTempObj.weeklyTemp.push(weeklyTempObj);
        });

        dataToUpdate.push(monthlyTempObj);
      }

       await Thermometer.insertMany(dataToUpdate);

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
  "/temperature/:year",
  async (req, res) => {
    try {
      const year = Number(req.params.year);
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
      const graphData = await Thermometer.find({ year }).lean();

      if (graphData.length === 0) {
        return res.status(404).send({ success: 0, result: [], message: "Data not Found" });
      }

      const finalData = [];

      for (const val of graphData) {
        const graphPlot = {};

        graphPlot["x"] = val.month;
        val.weeklyTemp.forEach((pg) => (graphPlot[pg.week] = pg.temperature));

        const index = months.indexOf(val.month);
        finalData[index] = graphPlot;
      }

      // //? if yearTemp array is not zero then arrange the months chronologically
      // if (graphData.yearTemp.length !== 0) {
      //   graphData.yearTemp.forEach((val) => {
      //     const index = months.indexOf(val.month);
      //     finalData[index] = val;
      //   });
      // }

      const responseToSend = {
        success: 1,
        result: finalData,
        message: "Graph Data Found Successfully",
      };
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
