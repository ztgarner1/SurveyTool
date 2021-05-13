
//getting all the ids that is needed
var allSurveys = document.getElementById("allsurveys");
var courseData = document.getElementById("courseInfo")
var groupButton = document.getElementById("groupButton")
var addGroups = document.getElementById("addGroups");
var calcButton = document.getElementById("calculateResults");
var groupSize = document.getElementById("groupSize");
var addStudent = document.getElementById("addStudent")
var addStudentDiv = document.getElementById("addStudentInfo");
var studentReset = document.getElementById("StudentAddition");
var submitStudent = document.getElementById("submitStudent");

//adding the html for adding a student
addStudent.addEventListener("click",()=>{
    console.log("Trying")
    //studentReset.innerHTML="";
    addStudentDiv.innerHTML = "<input placeHolder='Enter students Email' id='studentEmail'><br>"+
                    "<input placeHolder='Enter students first Name' id ='studentFirst'><br>"+
                    "<input placeHolder='Enter students last Name' id ='studentLast'><br>"+
                    "<input placeHolder='Enter students Id number' id ='studentId'><br>"+
                    "<button id = 'submitStudent' >Add Student</button>";
    submitStudent = document.getElementById("submitStudent");       
    submitStudent.addEventListener("click",()=>{
        studentReset.innerHTML="<button id='addStudent'>AddStudent</button>";
        let studentEmail=  document.getElementById("studentEmail")
        let studentFirst=  document.getElementById("studentFirst")
        let studentLast=  document.getElementById("studentLast")
        let studentId=  document.getElementById("studentId")
        let courseName = courseData.innerText.split(/ |-/)[1]
        let courseSection = courseData.innerText.split(/ |-/)[2]
        let data = {
            email:studentEmail.value,
            first:studentFirst.value,
            last:studentLast.value,
            id:studentId.value
        }
        let options = {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(data)
        }
        //then use a fetch to send data to the server
        fetch('/addStudent/'+courseName+"&"+courseSection,options)
        location.reload()
    })
    
    
})

calcButton.addEventListener("click",()=>{
    
    //checking to see that the user selected something
    if((allSurveys.value != null || allSurveys.value != undefined)&& (groupSize != "") ){
        fetch('/calculateResults/'+allSurveys.value+"&"+groupSize.value)
        .then(data=>{
            //reloading the webpage to see if the groups have been added
            location.reload();
        })
    }
    
    
})
groupButton.addEventListener("click",()=>{
    //this runs after the groupButton is clicked
    //console.log(courseData.innerText)
    //splitting the data up so we can send them to the server
    
    let courseName = courseData.innerText.split(/ |-/)[1]
    let courseSection = courseData.innerText.split(/ |-/)[2]
    //console.log(courseSection)
    
    //using fetch to get all the data from 
    fetch('/group/'+courseName+"&"+courseSection)
    .then(response => response.json())
    .then(data => {
        //populate here
        //goes through the arrays to get the names out of it
        //console.log(data)
        addGroups.innerHTML =""
        for(let i = 0; i < data.length; i++){
            //going into the inner arrays
            for(let j = 0; j < data[i].length; j++){
                if(j == 0){
                    //adding the html for the group number
                    addGroups.innerHTML += "<br><b>Group "+(i+1)+"</b><br>";
                }
                //adding the html for each name
                addGroups.innerHTML += data[i][j].first + " , " + data[i][j].last+"<br>"
                
            }
        }
    })
    .catch(error=>{
        console.log(error)
    })
})


