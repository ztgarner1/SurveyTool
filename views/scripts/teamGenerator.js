
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

function createTeam(arrayOfStudents) {
	
	var tempTeam = new Object();
	
	var i;
	for (i = 0; i < arrayOfStudents.length; i++) {
		
		//TODO
		
	}
	
}

function gatherResults() {
	
	//Loop through database of survey results
	//Or through a csv file
	
	//Adding each students results to array with
	//addStudentResults(name, id, email, [array of answers])
	
}

function createTeams() {
	
	//Grab first student in the surveyResults
	//Loop through the rest of the students to find the best match
	//Sort of like looping through numbers to find max
	//Loop through students and check all answers to find similarities
	//Place the n most similar (n being the team size - 1) 
	//in to temp variables to save them
	//Create a team out of these n students and
	//Remove each student from the surveyResults array
	//Repeat till all students are in a team
	
}