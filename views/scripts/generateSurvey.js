
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
			tempStr += "<table>"+
			"<tr>"+ 
				"<th>Time<th>"+
				"<th>Sunday<th>"+
				"<th>Monday<th>"+
				"<th>Tuesday<th>"+
				"<th>Wednesday<th>"+
				"<th>Thursday<th>"+
				"<th>Friday<th>"+
				"<th>Saturday<th>"+
			"</tr>"+
			"<tr>"+
				"<td>8am</td>" +
				"<td><input type='checkbox' id='q2sun1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri1' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat1' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>9am</td>" +
				"<td><input type='checkbox' id='q2sun2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri2' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat2' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>10am</td>" +
				"<td><input type='checkbox' id='q2sun3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri3' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat3' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>11am</td>" +
				"<td><input type='checkbox' id='q2sun4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri4' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat4' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>12pm</td>" +
				"<td><input type='checkbox' id='q2sun5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri5' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat5' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>1pm</td>" +
				"<td><input type='checkbox' id='q2sun6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri6' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat6' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>2pm</td>" +
				"<td><input type='checkbox' id='q2sun7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri7' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat7' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>3pm</td>" +
				"<td><input type='checkbox' id='q2sun8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri8' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat8' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>4pm</td>" +
				"<td><input type='checkbox' id='q2sun9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri9' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat9' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>5pm</td>" +
				"<td><input type='checkbox' id='q2sun10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri10' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat10' name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>6pm</td>" +
				"<td><input type='checkbox' id='q2sun11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri11'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat11'name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>7pm</td>" +
				"<td><input type='checkbox' id='q2sun12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri12'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat12'name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>8pm</td>" +
				"<td><input type='checkbox' id='q2sun13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri13'name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat13'name='schedule'/></td>" +
			"</tr>"+
			"<tr>"+
				"<td>9pm</td>" +
				"<td><input type='checkbox' id='q2sun14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2mon14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2tue14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2wed14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2thr14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2fri14' name='schedule'/></td>" +
				"<td><input type='checkbox' id='q2sat14' name='schedule'/></td>" +
			"</tr>"+
		"<table>";
		}
		
	}
	quesSec.innerHTML = tempStr;
}

function generateQuestion(ask,type, answers ){
	console.log("adding a question")
	addQuestion(type, ask, answers.split(/[ ]*,[ ]*/));
	genHTML();
}
function setDiv(){
	quesSec = document.getElementById("questionsSections");
}

