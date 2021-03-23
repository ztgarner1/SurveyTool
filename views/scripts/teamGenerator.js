
//Ran like so
//gatherResults();  
//genTeams();
//Then send the teams to where they need to be shown

var teamsSelected = [];

var surveyResults = [];

function addStudentResults(studentName, studentID, studentEmail, studentsAnswers) {
	var temp = new Object();
	temp.name = studentName;
	temp.id = studentID;
	temp.email = studentEmail;
	temp.ans = studentsAnswers;
	surveyResults.push(temp);
}

function gatherResults() {
	
	//Loop through database of survey results
	//Or through a csv file
	
	//Adding each students results to array with
	//addStudentResults(name, id, email, [array of answers])
	
	addStudentResults("A", 111, "temp@email.com", []);
	addStudentResults("B", 222, "temp@email.com", []);
	addStudentResults("C", 333, "temp@email.com", []);
	addStudentResults("D", 444, "temp@email.com", []);
	addStudentResults("E", 555, "temp@email.com", []);
	addStudentResults("F", 666, "temp@email.com", []);
	addStudentResults("G", 777, "temp@email.com", []);
	addStudentResults("H", 888, "temp@email.com", []);
	addStudentResults("I", 999, "temp@email.com", []);
	addStudentResults("J", 100, "temp@email.com", []);
	addStudentResults("K", 110, "temp@email.com", []);
	addStudentResults("L", 120, "temp@email.com", []);
	addStudentResults("M", 130, "temp@email.com", []);
	addStudentResults("N", 140, "temp@email.com", []);
	
}

function genTeams() {
	
	//Grab first student in the surveyResults
	//Loop through the rest of the students to find the best match
	//Sort of like looping through numbers to find max
	//Loop through students and check all answers to find similarities
	//Place the n most similar (n being the team size - 1) 
	//in to temp variables to save them
	//Create a team out of these n students and
	//Remove each student from the surveyResults array
	//Repeat till all students are in a team
	
	var i;
	for (i = 0; i < 7; i++) {
		
		var tempArray = [];
		
		var x = Math.floor(Math.random() * surveyResults.length);
		var y = Math.floor(Math.random() * (surveyResults.length - 1));
		
		tempArray.push(surveyResults[x]);
		surveyResults.splice(x, 1);
		tempArray.push(surveyResults[y]);
		surveyResults.splice(y, 1);
		
		teamsSelected.push(tempArray);
		
	}
	
}