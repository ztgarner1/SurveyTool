var allSurveys = document.getElementById("allsurveys");
var parentDiv = document.getElementById("replace");
var courseData = document.getElementById("courseInfo")
var courseName = courseData.innerText.split(/ |-/)[1]
var courseSection = courseData.innerText.split(/ |-/)[2]

//fetch('http://localhost:3000/getSurveys/'+courseName+"&"+courseSection)
fetch('https://wcu-surveytool.herokuapp.com/'+courseName+"&"+courseSection)
.then(response => response.json())
.then(data =>{
    //console.log(data);
    if(data.length ==0){
        parentDiv.innerHTML = "<h4>Surveys</h4><br>You have not made any surveys"
    }
    else{
        allSurveys.innerHTML = ""
        for(let i=0; i < data.length;i++){
            //console.log(i)
            allSurveys.innerHTML += "<option value = "+data[i]._id +"> "+data[i].title+", Question Count :  "+data[i].questions.length+"</option>"
        }
    }

})