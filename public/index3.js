const medicineNames = [];
function uploadImage() {
    // Get the input element for the image
    const imageInput = document.getElementById("imageInput");

    // Get the container for image preview
    const imagePreview = document.getElementById("imagePreview");

    // Check if a file is selected
    if (imageInput.files.length > 0) {
        const selectedImage = imageInput.files[0];

        // Create a FileReader to read the selected image
        const reader = new FileReader();

        reader.onload = function (e) {
            // Create an image element to display the preview
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "300px"; // Adjust the preview size as needed

            // Clear any previous previews and display the new one
            imagePreview.innerHTML = "";
            imagePreview.appendChild(img);
        };

        // Read the selected image as a data URL
        reader.readAsDataURL(selectedImage);
    } else {
        alert("Please select an image.");
    }
}

async function processImage() {
    // Get the input element for the image
    const imageInput = document.getElementById("imageInput");

    // Check if a file is selected
    if (imageInput.files.length > 0) {
        const selectedImage = await imageInput.files[0];

        // Create a FormData object to send the image to the server
        const formData = new FormData();
        formData.append("image", selectedImage);

        // Send the image to the server using a fetch request
        await fetch("/process-image", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.text())
            .then((data) => {
                // Display the processing result
                const processingResult = document.getElementById("processingResult");
                processingResult.innerHTML = `<p>${JSON.parse(data)}</p>`;

                // Extract medicine names from the response
                // Parse the response as JSON
                const medicineNamesArray = JSON.parse(data);
                console.log(medicineNamesArray);

                // Remove '[' and ']' and split the string by ','
                const cleanedString = medicineNamesArray.slice(1, -3).split(', ').map(item => item.replace(/'/g, ''));

                // Create an array with the cleaned values
                const resultArray = cleanedString.map(item => item.trim());

                console.log(resultArray);
                // Check if it's an array and not empt


                // Loop through medicine names
                for (let i = 0; i < resultArray.length; i++) {
                    console.log(resultArray[i]);
                    fetch("/contact", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: resultArray[i] }),
                    })
                        .then(function (response) {
                            if (response.status === 200) {
                                // Request was successful, handle it here
                                console.log("Request succeeded");
                            } else {
                                // Handle non-successful responses here
                                console.error("Request failed with status:", response.status);
                            }
                        })
                        .catch(function (err) {
                            console.error(err);
                        });
                }
            })
            .catch((error) => {
                console.error("Error processing the image:", error);
            });
    } else {
        alert("Please select an image.");
    }
}

$(document).ready(function () {
    $(".hello").click(function () {
        console.log("1");
        $(".in-2").css("visibility", "visible");
        // Make an AJAX POST request to /submit
        fetch('/submit')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Access the HTML element where you want to display the JSON data
                if (data.interactions.length > 0) {
                    // Display interactions on your web page
                    data.interactions.forEach(function (interaction) {
                        var color;
                        var text;
                        if (interaction.severity === "high") {
                            color = "color:red";
                            text = "unsafe";
                        }
                        else if (interaction.severity === "medium") {
                            color = "color:yellow";
                            text = "yellow";
                        }
                        else {
                            color = "color:green";
                            text = "mild";
                        }
                        $(".list").append(
                            "<li>" +
                            "<p>Name1:" + interaction.name1 + "</p>" +
                            "<p>Name2: " + interaction.name2 + "</p>" +
                            "<p>Description: " + interaction.description + "</p>" +
                            "Safety Level: <span style=" +
                            `${color};>${text}</span>` +
                            `<button class="getMoreInfo" onclick="document.getElementsByClassName('down')[0].style.visibility = 'visible'; " style="background-color:#c9c9c94d; border:none; border-radius:10px; margin-left:10px; color: white; padding:4px;"
                            >Get More Info</button>` +
                            "</li>"
                        );
                    });
                } else {
                    $('.list').append(
                        `<li>"No interactions found"</li>`
                    )
                }
                // Set the content of the result container with the HTML string
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });

    });
});

$(document).on("click", ".getMoreInfo", function () {
    // Store a reference to the clicked button
    const clickedButton = $(this);

    console.log(4);
    // Find the parent div of the clicked button
    const dataDiv = clickedButton.closest('.upR');
    console.log(dataDiv);

    // Extract data from the div using jQuery
    const name1 = dataDiv.find('p:nth-child(1)').text();
    const name2 = dataDiv.find('p:nth-child(2)').text();
    const name3 = name1 + "," + name2;
    console.log(name3);

    // Make an AJAX POST request using jQuery
    $.ajax({
        url: "/drug-interaction",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ name: name3 }),
        success: function (data) {
            console.log(data);

            // Access the drugInteractionDetail from the response data
            const druginteractionDetail = data.drugInteractionDetail;



            $(".down").css("visibility", "visible");



            // Append the drugInteractionDetail to the clicked button's parent div
            // dataDiv.append("<li>" + druginteractionDetail + "</li>");
            $(".det").append("<li>" + druginteractionDetail + "</li>");
        },
        error: function () {
            console.error("Network response was not ok");
        }
    });
});