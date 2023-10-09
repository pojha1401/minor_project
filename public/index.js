const search = document.getElementById('search');
const matchList = document.getElementById('medicineList');

// Function to set up autocomplete for a specific input element
const setupAutocomplete = (inputElement) => {
    inputElement.addEventListener("input", function () {
        searchMedicines(this.value, inputElement);
    });
};

// Function to search for medicines and update autofill
const searchMedicines = async (searchText, inputElement) => {
    let matches = [];
    if (searchText.length >= 3) {
        const res = await fetch('./medicine_data.json');
        const medicines = await res.json();

        matches = medicines.filter(medicine => {
            const regex = new RegExp(`^${searchText}`, 'gi');
            return regex.test(medicine.drug) || regex.test(medicine.abbr);
        });
    } else {
        matches = []; // Clear the autocomplete list when input is less than 3 characters
    }

    outputHtml(matches, inputElement);
};

// Function to update the autocomplete list for a specific input element
const outputHtml = (matches, inputElement) => {
    const matchList = inputElement.nextElementSibling;
    console.log(inputElement.nextElementSibling);
    const html = matches.map(match => `
    <li>
      <button type="button"><h4>${match.drug}</h4></button>
    </li>`
    ).join('');

    matchList.innerHTML = html;

    const buttons = matchList.querySelectorAll('li');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const medicineName = this.querySelector('h4').textContent;
            inputElement.value = medicineName; // Set the selected suggestion to the input
            matchList.innerHTML = '';
            fetch("/contact", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: medicineName }),
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
        });
    });
}; // Clear the autocomplete

// Add an event listener to the search input field to trigger the autocomplete
setupAutocomplete(search);

// Add an event listener to the button to trigger the addition of a new input
document.getElementById("add").addEventListener("click", function () {
    const inputContainer = document.getElementById("input-container");

    // Create a new input element
    const newInput = document.createElement("input");
    newInput.placeholder = "e.g crocin";
    newInput.type = "text";
    newInput.className = "validate drop-down";

    // Create a div to hold the autocomplete list for the new input
    const autoCompleteList = document.createElement("ul");
    autoCompleteList.className = "autocomplete-list";

    // Insert the new input element and autocomplete list before the button's parent node
    inputContainer.insertBefore(newInput, this.parentElement);
    inputContainer.insertBefore(autoCompleteList, this.parentElement);

    // Set up autocomplete for the new input element
    setupAutocomplete(newInput);
});

$(document).ready(function () {

    $(".submit").click(function () {
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
            $(".det").append("<li>" + druginteractionDetail + "</li>"); 
        },
        error: function () {
            console.error("Network response was not ok");
        }
    });
});



