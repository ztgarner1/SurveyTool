
var quesSec;

var surveyQues = [];

//Type is the type of question (text answer, multiple choice, selection, etc)
//Question is the question its asking
//Answers is an array of answers, depending on type will depend on how many answers
function addQuestion(questype, question, answers) {
	var temp = new Object();
	temp.type = questype;
	temp.ques = question;
	temp.ans = answers;
	surveyQues.push(temp);
}

//Generates a string to be written into the html page
function genHTML() {
	console.log(quesSec)
	var tempStr = "";
	
	var i;
	for (i = 0; i < surveyQues.length; i++) {
		
		var j = i + 1;
		//Check out what type it is
		if (surveyQues[i].type == "text") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			tempStr += "<input autocomplete=\"chrome-off\" type=\"text\" name=\"q" + j + "\" />";
		} else if (surveyQues[i].type == "checkbox") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			for (x = 0; x < surveyQues[i].ans.length; x++) {
				var temp = surveyQues[i].ans[x];
				tempStr += "<input autocomplete=\"chrome-off\" type=\"checkbox\" name=\"q" + j + "\" value=\"" + temp + "\">" + temp + "</input>";
				tempStr += "<br>"
			}
			
		} else if (surveyQues[i].type == "radio") {
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			var x;
			for (x = 0; x < surveyQues[i].ans.length; x++) {
				var temp = surveyQues[i].ans[x];
				tempStr += "<input autocomplete=\"chrome-off\" type=\"radio\" name=\"q" + j + "\" value=\"" + temp + "\">" + temp + "</input>";
				tempStr += "<br>"
			}
		}
		else if(surveyQues[i].type == "schedule"){
			tempStr += "<h4>" + j + ") " + surveyQues[i].ques + "</h4>";
			tempStr += "<table>"+
			"<tr>"+ 
				"<th>Time</th>"+
				"<th>Sunday</th>"+
				"<th>Monday</th>"+
				"<th>Tuesday</th>"+
				"<th>Wednesday</th>"+
				"<th>Thursday</th>"+
				"<th>Friday</th>"+
				"<th>Saturday</th>"+
			"</tr>"+
			"<tr>"+
				"<td>8am</td>" +
				"<td><input type='checkbox' name='schedulesun1' /></td>" +
				"<td><input type='checkbox' name='schedulemon1' /></td>" +
				"<td><input type='checkbox' name='scheduletue1' /></td>" +
				"<td><input type='checkbox' name='schedulewed1' /></td>" +
				"<td><input type='checkbox' name='schedulethr1' /></td>" +
				"<td><input type='checkbox' name='schedulefri1' /></td>" +
				"<td><input type='checkbox' name='schedulesat1' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>9am</td>" +
				"<td><input type='checkbox' name='schedulesun2' /></td>" +
				"<td><input type='checkbox' name='schedulemon2' /></td>" +
				"<td><input type='checkbox' name='scheduletue2' /></td>" +
				"<td><input type='checkbox' name='schedulewed2' /></td>" +
				"<td><input type='checkbox' name='schedulethr2' /></td>" +
				"<td><input type='checkbox' name='schedulefri2' /></td>" +
				"<td><input type='checkbox' name='schedulesat2' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>10am</td>" +
				"<td><input type='checkbox' name='schedulesun3' /></td>" +
				"<td><input type='checkbox' name='schedulemon3' /></td>" +
				"<td><input type='checkbox' name='scheduletue3' /></td>" +
				"<td><input type='checkbox' name='schedulewed3' /></td>" +
				"<td><input type='checkbox' name='schedulethr3' /></td>" +
				"<td><input type='checkbox' name='schedulefri3' /></td>" +
				"<td><input type='checkbox' name='schedulesat3' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>11am</td>" +
				"<td><input type='checkbox' name='schedulesun4' /></td>" +
				"<td><input type='checkbox' name='schedulemon4' /></td>" +
				"<td><input type='checkbox' name='scheduletue4' /></td>" +
				"<td><input type='checkbox' name='schedulewed4' /></td>" +
				"<td><input type='checkbox' name='schedulethr4' /></td>" +
				"<td><input type='checkbox' name='schedulefri4' /></td>" +
				"<td><input type='checkbox' name='schedulesat4' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>12pm</td>" +
				"<td><input type='checkbox' name='schedulesun5' /></td>" +
				"<td><input type='checkbox' name='schedulemon5' /></td>" +
				"<td><input type='checkbox' name='scheduletue5' /></td>" +
				"<td><input type='checkbox' name='schedulewed5' /></td>" +
				"<td><input type='checkbox' name='schedulethr5' /></td>" +
				"<td><input type='checkbox' name='schedulefri5' /></td>" +
				"<td><input type='checkbox' name='schedulesat5' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>1pm</td>" +
				"<td><input type='checkbox' name='schedulesun6' /></td>" +
				"<td><input type='checkbox' name='schedulemon6' /></td>" +
				"<td><input type='checkbox' name='scheduletue6' /></td>" +
				"<td><input type='checkbox' name='schedulewed6' /></td>" +
				"<td><input type='checkbox' name='schedulethr6' /></td>" +
				"<td><input type='checkbox' name='schedulefri6' /></td>" +
				"<td><input type='checkbox' name='schedulesat6' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>2pm</td>" +
				"<td><input type='checkbox' name='schedulesun7' /></td>" +
				"<td><input type='checkbox' name='schedulemon7' /></td>" +
				"<td><input type='checkbox' name='scheduletue7' /></td>" +
				"<td><input type='checkbox' name='schedulewed7' /></td>" +
				"<td><input type='checkbox' name='schedulethr7' /></td>" +
				"<td><input type='checkbox' name='schedulefri7' /></td>" +
				"<td><input type='checkbox' name='schedulesat7' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>3pm</td>" +
				"<td><input type='checkbox' name='schedulesun8' /></td>" +
				"<td><input type='checkbox' name='schedulemon8' /></td>" +
				"<td><input type='checkbox' name='scheduletue8' /></td>" +
				"<td><input type='checkbox' name='schedulewed8' /></td>" +
				"<td><input type='checkbox' name='schedulethr8' /></td>" +
				"<td><input type='checkbox' name='schedulefri8' /></td>" +
				"<td><input type='checkbox' name='schedulesat8' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>4pm</td>" +
				"<td><input type='checkbox' name='schedulesun9' /></td>" +
				"<td><input type='checkbox' name='schedulemon9' /></td>" +
				"<td><input type='checkbox' name='scheduletue9' /></td>" +
				"<td><input type='checkbox' name='schedulewed9' /></td>" +
				"<td><input type='checkbox' name='schedulethr9' /></td>" +
				"<td><input type='checkbox' name='schedulefri9' /></td>" +
				"<td><input type='checkbox' name='schedulesat9' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>5pm</td>" +
				"<td><input type='checkbox' name='schedulesun10' /></td>" +
				"<td><input type='checkbox' name='schedulemon10' /></td>" +
				"<td><input type='checkbox' name='scheduletue10' /></td>" +
				"<td><input type='checkbox' name='schedulewed10' /></td>" +
				"<td><input type='checkbox' name='schedulethr10' /></td>" +
				"<td><input type='checkbox' name='schedulefri10' /></td>" +
				"<td><input type='checkbox' name='schedulesat10' /></td>" +
			"</tr>"+
			"<tr>"+
				"<td>6pm</td>" +
				"<td><input type='checkbox' name='schedulesun11'/></td>" +
				"<td><input type='checkbox' name='schedulemon11'/></td>" +
				"<td><input type='checkbox' name='scheduletue11'/></td>" +
				"<td><input type='checkbox' name='schedulewed11'/></td>" +
				"<td><input type='checkbox' name='schedulethr11'/></td>" +
				"<td><input type='checkbox' name='schedulefri11'/></td>" +
				"<td><input type='checkbox' name='schedulesat11'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>7pm</td>" +
				"<td><input type='checkbox' name='schedulesun12'/></td>" +
				"<td><input type='checkbox' name='schedulemon12'/></td>" +
				"<td><input type='checkbox' name='scheduletue12'/></td>" +
				"<td><input type='checkbox' name='schedulewed12'/></td>" +
				"<td><input type='checkbox' name='schedulethr12'/></td>" +
				"<td><input type='checkbox' name='schedulefri12'/></td>" +
				"<td><input type='checkbox' name='schedulesat12'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>8pm</td>" +
				"<td><input type='checkbox' name='schedulesun13'/></td>" +
				"<td><input type='checkbox' name='schedulemon13'/></td>" +
				"<td><input type='checkbox' name='scheduletue13'/></td>" +
				"<td><input type='checkbox' name='schedulewed13'/></td>" +
				"<td><input type='checkbox' name='schedulethr13'/></td>" +
				"<td><input type='checkbox' name='schedulefri13'/></td>" +
				"<td><input type='checkbox' name='schedulesat13'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>9pm</td>" +
				"<td><input type='checkbox' name='schedulesun14' /></td>" +
				"<td><input type='checkbox' name='schedulemon14' /></td>" +
				"<td><input type='checkbox' name='scheduletue14' /></td>" +
				"<td><input type='checkbox' name='schedulewed14' /></td>" +
				"<td><input type='checkbox' name='schedulethr14' /></td>" +
				"<td><input type='checkbox' name='schedulefri14' /></td>" +
				"<td><input type='checkbox' name='schedulesat14' /></td>" +
			"</tr>"+
		"<table>";
		}
		
	}
	quesSec.innerHTML = tempStr;
}
//Print the questions onto the site
function generateQuestion(ask,type, answers ){
	console.log("adding a question")
	addQuestion(type, ask, answers.split(/[ ]*,[ ]*/));
	genHTML();
}
//Set the div to print to
function setDiv(){
	quesSec = document.getElementById("questionsSections");
}

