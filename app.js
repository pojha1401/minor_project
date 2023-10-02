import express from "express";
import { spawn } from "child_process";
import axios from "axios";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __dirname = dirname(fileURLToPath(import.meta.url));

const port = 3000;
const app = express();
app.use(fileUpload());
let medicine_list = [];
let rxcui = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

const medicineData = JSON.parse(fs.readFileSync(("public/medicine_data.json"), "utf-8"));
const drugdata = JSON.parse(fs.readFileSync(("public/drug_data.json"), "utf-8"));


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/main.html");
});
app.get("/index.html", (req, res) => {
    res.sendFile(__dirname + "/test.html");
});
app.get("/index2.html", (req, res) => {
    res.sendFile(__dirname + "/index2.html");
});

app.get("/index3.html", (req, res) => {
    res.sendFile(__dirname + "/index3.html");
});

app.post("/contact", async function (req, res) {
    try {
        if (req.body.name) {
            const medicineName = req.body.name;
            console.log(medicineName);
            // Handle the medicineName as needed
            const matchingMedicine = medicineData.find(medicine => medicine.drug === medicineName);
            medicine_list.push(matchingMedicine);

            if (matchingMedicine) {
                const saltName = matchingMedicine.salt;
                const drugArray = saltName.split(" + ");
                for (var j = 0; j < drugArray.length; j++) {
                    const singleName = drugArray[j];
                    console.log(singleName);
                    const myarray = singleName.split(" ");
                    let s = "";
                    for (var i = 0; i < myarray.length - 1; i++) {
                        if (myarray.length > 1) {
                            s = s + myarray[i] + "+";
                        }
                    }
                    console.log(s);
                    const response0 = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${s}&search=1`)
                    const result = await response0.data;
                    const toInt = await result.idGroup.rxnormId[0];
                    rxcui.push(toInt);
                    console.log(toInt);

                    // const severity = result2.interactionTypeGroup[0].interactionType[0].severity;
                    // const minConceptName = result2.interactionTypeGroup[0].interactionType[0].minConceptItem.name;
                    // console.log(severity, minConceptName);
                    res.status(200);
                }
            }
        } // Send a simple success message
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});

app.post("/contact2", async function (req, res) {
    try {
        if (req.body.name) {
            const medicineName = req.body.name;
            // // Handle the medicineName as needed
            // console.log(medicineName);
            // const matchingMedicine = medicineData.find(medicine => medicine.drug === medicineName);
            medicine_list.push(medicineName);

            // if (matchingMedicine) {
            // const saltName = matchingMedicine.salt;
            // console.log(saltName);
            const myarray = medicineName.split(" ");
            let s = "";
            for (var i = 0; i < myarray.length - 1; i++) {
                if (myarray.length > 1) {
                    s = s + myarray[i] + "+";
                }
            }
            if (myarray.length == 1) {
                s = s + medicineName;
            }
            console.log(s);
            const response0 = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${s}&search=1`)
            const result = await response0.data;
            const toInt = await result.idGroup.rxnormId[0];
            rxcui.push(toInt);
            console.log(toInt);
            // const severity = result2.interactionTypeGroup[0].interactionType[0].severity;
            // const minConceptName = result2.interactionTypeGroup[0].interactionType[0].minConceptItem.name;
            // console.log(severity, minConceptName);
            res.status(200).send("OK");
            // }
        } // Send a simple success message
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle errors
    }
});

app.get("/submit", async (req, res) => {
    // ... Your existing code to fetch and process data ...
    console.log("1");
    var t = "";
    for (var i = 0; i < rxcui.length - 1; i++) {
        t = t + rxcui[i] + "+";
    }
    t = t + rxcui[rxcui.length - 1];
    console.log(t);
    // Instead of console.log, store the data in an object
    var interactionData = {
        interactions: []  // Store the interaction data here
    };
    if (rxcui.length == 1) {
        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${t}&sources=ONCHigh`);
        rxcui = [];
        console.log(response.data);
        if (response.data.interactionTypeGroup) {
            const result2 = response.data.interactionTypeGroup[0].interactionType[0].interactionPair;

            if (result2.length > 0) {
                for (var i = 0; i < result2.length; i++) {
                    const interaction = {
                        name: result2[i].interactionConcept[1].minConceptItem.name,
                        severity: result2[i].severity,
                        description: result2[i].description
                    };

                    interactionData.interactions.push(interaction);
                    console.log(interactionData);
                }
            }
        } else {
            console.log("not found");
        }
    } else {

        const response = await axios.get(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${t}`);
        rxcui = [];
        // Initialize an empty array to store interactions

        if (response.data.fullInteractionTypeGroup) {
            const result2 = response.data.fullInteractionTypeGroup.forEach(group => {
                // Loop through fullInteractionType
                group.fullInteractionType.forEach(interactionType => {
                    // Loop through interactionPair
                    interactionType.interactionPair.forEach(pair => {
                        // Access the desired information
                        const interaction = {
                            name1: pair.interactionConcept[0].minConceptItem.name,
                            name2: pair.interactionConcept[1].minConceptItem.name,
                            severity: pair.severity,
                            description: pair.description,
                        };

                        interactionData.interactions.push(interaction);
                    });
                });
            });

            // Log the complete interaction data after accumulating it
            console.log(interactionData);


        } else {
            console.log("not found");
        }
        rxcui = [];
    }

    // Send the interactionData object as a JSON response to the client
    res.json(interactionData);
    interactionData = {
        interactions: []  // Store the interaction data here
    };

});

app.post("/process-image", async (req, res) => {
    // Get the uploaded image file
    const image = req.files.image;

    // Save the image to a temporary file
    const tempImagePath = path.join(__dirname, "temp_image.jpg");

    await image.mv(tempImagePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error uploading the image" });
        }
        const childPython = spawn('python', ['OCR.py', `${tempImagePath}`]);

        childPython.stdout.on('data', (data) => {
            const result = data;
            console.log(result.toString());
            res.json(result.toString());
        });

        childPython.stderr.on('data', (data) => {
            console.log(`stdout:${data}`);
        });

        childPython.on('close', (code) => {
            console.log(`child process excited with code:${code}`);
        });
    });
});


app.listen(port, () => {
    console.log(`listening to port ${port}`);
});