var firebaseConfig = {
    apiKey: "AIzaSyAQbXXlpfHA4tsh1K1SpU34GrW89prPlVI",
    authDomain: "nancy-s-ta-project.firebaseapp.com",
    databaseURL: "https://nancy-s-ta-project.firebaseio.com",
    projectId: "nancy-s-ta-project",
    storageBucket: "nancy-s-ta-project.appspot.com",
    messagingSenderId: "299235891829",
    appId: "1:299235891829:web:bdeac7849f6604cd1e363c"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var database = firebase.database();

 var tMinutesTillTrain = 0;

 var randomDate = "02/23/1999";
    var randomFormat = "MM/DD/YYYY";
    var convertedDate = moment(randomDate, randomFormat);

//Show and update current time. Use setInterval method to update time.
function displayRealTime() {
setInterval(function(){
    $('#current-time').html(moment().format('hh:mm A'))
  }, 1000);
}
displayRealTime();


 var tRow = "";
 var getKey = "";

 //Click event for the submit button. When user clicks Submit button to add a train to the schedule...
 $("#submit-button").on("click", function() {

	// Prevent form from submitting
	event.preventDefault();

	//Grab the values that the user enters in the text boxes in the "Add train" section. Store the values in variables.
	var trainName = $("#train-name").val().trim();
	var destination = $("#destination").val().trim();
	var firstTrainTime = $("#first-train-time").val().trim();
	var trainFrequency = $("#frequency").val().trim();

	//Print the values that the user enters in the text boxes to the console for debugging purposes.
	console.log(trainName);
	console.log(destination);
	console.log(firstTrainTime);
	console.log(trainFrequency);

	//Form validation for user input values. To add a train, all fields are required.
	//Check that all fields are filled out.
	if (trainName === "" || destination === "" || firstTrainTime === "" || trainFrequency === ""){
		$("#not-military-time").empty();
		$("#missing-field").html("ALL fields are required to add a train to the schedule.");
		return false;		
	}

	//Check to make sure that there are no null values in the form.
	else if (trainName === null || destination === null || firstTrainTime === null || trainFrequency === null){
		$("#not-military-time").empty();
		$("#not-a-number").empty();
		$("#missing-field").html("ALL fields are required to add a train to the schedule.");
		return false;		
	}

	//Check that the user enters the first train time as military time.
	else if (firstTrainTime.length !== 5 || firstTrainTime.substring(2,3)!== ":") {
		$("#missing-field").empty();
		$("#not-a-number").empty();
		$("#not-military-time").html("Time must be in military format: HH:mm. For example, 15:00.");
		return false;
	}

	//Check that the user enters a number for the Frequency value.
	else if (isNaN(trainFrequency)) {
    	$("#missing-field").empty();
    	$("#not-military-time").empty();
    	$("#not-a-number").html("Not a number. Enter a number (in minutes).");
    	return false;
	}

	//If form is valid, perform time calculations and add train to the current schedule.
	else {
		$("#not-military-time").empty();
		$("#missing-field").empty();
		$("#not-a-number").empty();

		//Moment JS math caclulations to determine train next arrival time and the number of minutes away from destination.
		// First Time (pushed back 1 year to make sure it comes before current time)
	    var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
	    console.log(firstTimeConverted);

	    // Current Time
	    var currentTime = moment("2014 04 25", "YYYY MM DD");
	    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

	    // Difference between the times
	    var diffTime = moment("2014 04 25", "YYYY MM DD").diff(moment(firstTimeConverted), "minutes");
	    console.log("DIFFERENCE IN TIME: " + diffTime);

	    // Time apart (remainder)
	    var tRemainder = diffTime % trainFrequency;
	    console.log(tRemainder);

	    // Minute Until Train
	    var tMinutesTillTrain = trainFrequency - tRemainder;
	    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

	    // Next Train
	    var nextTrain = moment("2014 04 25", "YYYY MM DD").add(tMinutesTillTrain, "minutes").format("hh:mm A");
	    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));

		//Create local temporary object for holding train data
		var newTrain = {
			trainName: trainName,
			destination: destination,
			firstTrainTime: firstTrainTime,
			trainFrequency: trainFrequency,
			nextTrain: nextTrain,
			tMinutesTillTrain: tMinutesTillTrain,
			currentTime: currentTime.format("hh:mm A")
		};

		//Save/upload train data to the database.
		database.ref().push(newTrain);

		//Log everything to console for debugging purposes.
		console.log("train name in database: " + newTrain.trainName);
		console.log("destination in database: " + newTrain.destination);
		console.log("first train time in database: " + newTrain.firstTrainTime);
		console.log("train frequency in database: " + newTrain.trainFrequency);
		console.log("next train in database: " + newTrain.nextTrain);
		console.log("minutes away in database: " + newTrain.tMinutesTillTrain);
		console.log("current time in database: " + newTrain.currentTime);

		//Confirmation modal that appears when user submits form and train is added successfully to the schedule.
		$(".add-train-modal").html("<p>" + newTrain.trainName + " was successfully added to the current schedule.");
		$('#addTrain').modal();

		//Remove the text from the form boxes after user presses the add to schedule button.
		$("#train-name").val("");
		$("#destination").val("");
		$("#first-train-time").val("");
		$("#frequency").val("");
	}
});


// At the initial load and subsequent value changes, get a snapshot of the stored data.
// This function allows you to update the page in real-time when the firebase database changes.
database.ref().on("child_added", function(childSnapshot, prevChildKey) {
	console.log(childSnapshot.val());
	console.log(prevChildKey);

	//Set variables for form input field values equal to the stored values in firebase.
	var trainName = childSnapshot.val().trainName;
	var destination = childSnapshot.val().destination;
	var firstTrainTime = childSnapshot.val().firstTrainTime;
	var trainFrequency = childSnapshot.val().trainFrequency;
	var nextTrain = childSnapshot.val().nextTrain;
	var tMinutesTillTrain = childSnapshot.val().tMinutesTillTrain;
	var currentTime = childSnapshot.val().currentTime;

	//Train info
	console.log(trainName);
	console.log(destination);
	console.log(firstTrainTime);
	console.log(nextTrain);
	console.log(tMinutesTillTrain);
	console.log(trainFrequency);
	console.log(currentTime);

	//Moment JS math caclulations to determine train next arrival time and the number of minutes away from destination.
	// First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
    console.log(firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;
    console.log(tRemainder);

    // Minute Until Train
    var tMinutesTillTrain = trainFrequency - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    // Next Train
    var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm A");
    console.log("ARRIVAL TIME: " + moment(nextTrain).format("hh:mm"));


	//Update the HTML (schedule table) to reflect the latest stored values in the firebase database.
	var tRow = $("<tr>");
	var trainTd = $("<td>").text(trainName);
    var destTd = $("<td>").text(destination);
    var nextTrainTd = $("<td>").text(nextTrain);
    var trainFrequencyTd = $("<td>").text(trainFrequency);
    var tMinutesTillTrainTd = $("<td>").text(tMinutesTillTrain);

    // Append the newly created table data to the table row.
    //Append trash can icon to each row so that user can delete row if needed.
    tRow.append(trainTd, destTd, trainFrequencyTd, nextTrainTd, tMinutesTillTrainTd);
    // Append the table row to the table body
    $("#schedule-body").append(tRow);
});


//Click event for trash can icon/button. When user clicks trash can to remove a train from the schedule...
 $("body").on("click", ".trash-can", function(){
	// Prevent form from submitting
	event.preventDefault();

	//confirm with the user before he or she decides to actually delete the train data.
	var confirmDelete = confirm("Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?");
	//To do: Replace alert with modal... Confirmation modal that appears when user wants to remove train from schedule.
		//$(".remove-train-modal").html("<p>" + " Deleting a train permanently removes the train from the system. Are you sure you want to delete this train?" + "</p>");
		//$('#removeTrain').modal();
	//If user confirms...
	if (confirmDelete) {
		//Remove the closest table row.
		$(this).closest('tr').remove();
		//To do: Remove train info from db.
		// getKey = $(this).parent().attr('id');
		// console.log(getKey);
		//dataRef.child(key).remove();
		//database.ref().child(getKey).remove();
	}

	else {
		return;
	}
});

//One way to initialize all tooltips on a page would be to select them by their data-toggle attribute:
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})