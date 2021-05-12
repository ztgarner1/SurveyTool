//getting all the ids that is needed
var allSurveys = document.getElementById("allsurveys");
var courseData = document.getElementById("courseInfo")
var groupButton = document.getElementById("groupButton")
var addGroups = document.getElementById("addGroups");

groupButton.addEventListener("click",()=>{
    //this runs after the groupButton is clicked
    //console.log(courseData.innerText)
    //splitting the data up so we can send them to the server
    let courseName = courseData.innerText.split(/ |-/)[1]
    let courseSection = courseData.innerText.split(/ |-/)[2]
    //console.log(courseSection)
    
    //using fetch to get all the data from 
    //will need to change this line here for whatever your application is called
    //replace http://localhost:300 with something else.
    //fetch('http://localhost:3000/group/'+courseName+"&"+courseSection)
    fetch('http://localhost:3000/group/'+courseName+"&"+courseSection)
    .then(response => response.json())
    .then(data => {
        //populate here
        //goes through the arrays to get the names out of it
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

