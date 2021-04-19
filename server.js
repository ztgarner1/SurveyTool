//requiring everything thats needed and setting up app.
const dotenv = require('dotenv');
dotenv.config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const csv = require('csv-parser')
const fs = require('fs');
app.use(fileUpload());

var courses;
//this helps log a user out
const methodOverride = require('method-override')
//sendgrid for the mail.
//setting up the database
const mongoose = require("mongoose");
mongoose.connect("" +process.env.MONGO_ATLAS_PW+"",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });
//initializing Passport
const initializePassport = require('./passport-config');
//getting Student and Teacher Schema

const User = require('./Mongoose Models/user');
//getting the courses 
const Course = require('./Mongoose Models/course');
const SurveyResults = require('./Mongoose Models/surveyResults');
const SurveyTemplates = require('./Mongoose Models/surveyTemplate');
//calling the initializePassport function;
initializePassport(
  passport,
);
//changing the view engine to ejs so it can read my new files
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: ""+process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
//telling the server which files to look at
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/Mongoose Models"));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//this is the home screen
app.get('/', (req, res) => {
  
  if(req.user == undefined){
      res.render('index.ejs',{user:null});
  }
  else{
      res.render('index.ejs', { user: req.user})
  }
})

app.get('/survey', (req, res) => {
  
  if(req.user == undefined){
      res.render('questions.ejs',{user:null});
  }
  else{
      res.render('questions.ejs', { user: req.user})
  }
})

app.get('/template', (req, res) => {
  
  if(req.user == undefined){
      res.render('templateQuestions.ejs',{user:null});
  }
  else{
      res.render('templateQuestions.ejs', { user: req.user})
  }
})

app.get('/createSurvey', (req, res) => {
  
  if(req.user == undefined){
      res.render('createSurvey.ejs',{user:null});
  }
  else{
      res.render('createSurvey.ejs', { user: req.user})
  }
})

//server serving the login page where user cant be logged in
app.get("/login", checkNotAuthenticated, (req,res)=>{
    res.render("login.ejs");
})

//this authenticates the user if the email and password are correct.
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get("/contactImport",checkAuthenticated,(req,res)=>{
  res.render('contactImport.ejs',{ user: req.user});
})

//server serving the register page where the user cant be logged in
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs',{error: null})
})
//server getting a post request to register a new account.
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
      //initializing a boolean 
      let emailExists = false;
      //getting all the users from the database
      if(req.body.question.toLowerCase == "no"){
        User.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            //if there isnt a student with that email
            let code = sendMail(req.body.email, null, null);

            var student = new User({
              _id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              courses:[],
              confirmCode:code,
              isTeacher:false,
            })

            student.save()
            .then( () => {
             //if no error occured then the user will be taken to the login page
              res.redirect('/login');
            })
            .catch(err =>{
              //if an error occured then they stay on the page but given an error message for the user to see
              res.render("register.ejs",{error: "User not added"})
            })
            
          }
          else{
            res.render("register.ejs",{error: "Email already in use"});
          
          }
        })
      }
      else{
        User.findOne({email:req.body.email})
        .exec()
        .then(data=>{
          if(data==null){
            let code = sendMail(req.body.email, null, null);
            var teacher = new User({
              _id: new mongoose.Types.ObjectId(),
              username:req.body.name,
              first: "",
              last:"",
              email:req.body.email,
              password:bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(9)),
              locked:false,
              verified:false,
              courses:[],
              confirmCode:code,
              isTeacher:true,
            })

            teacher.save()
            .then( () => {
              
             //if no error occured then the user will be taken to the login page
              res.redirect('/login');
            })
            .catch(err =>{
              //if an error occured then they stay on the page but given an error message for the user to see
              res.render("register.ejs",{error: "User not added"})
            })
          }
        })
      }
  } catch(error) {
      console.log(error);
  }
})

//getting the post request from the profile page which means the user is updating their profile
app.post("/profile",checkAuthenticated, (req,res)=>{
  //console.log(req.user)
  //if there is a button on the page called SaveProfile which means they are in edit mode currently.
  if(req.body.SaveProfile != null){
    //console.log("In edit mode");
    //updating the user in the database
    User.updateOne({_id: req.user._id},{ first:req.body.first,last:req.body.last})
    .exec()
    .then(docs =>{
      //updating the current user logged in so the data displays right away after saving.
      req.user.first = req.body.first;
      req.user.last = req.body.last;
      res.render('profile.ejs', {user:req.user, edit: false});
    })
  }
  else{
    //the profile is not in edit mode. So they are just viewing everything they have to their account. 
    res.render('profile.ejs', {user:req.user, edit: true,language:req.body.language});
  }
})
//server serving the profile page
app.get("/profile" ,checkAuthenticated,(req,res)=>{
  
  res.render("profile.ejs",{user:req.user, edit:false})
})

//server responding to the myCourses post
app.get('/myClasses',checkAuthenticated,(req,res)=>{
  if(req.user.isTeacher){
    res.redirect('/classesInfo');
  }
  else{
    res.render('myClasses.ejs',{user:req.user})
  }
  
})
app.post('/myClasses', checkAuthenticated,(req,res)=>{
  if(req.user.verified == false){
    sendMail(req.user.email,req.user, null);
  }
})


app.post('/createSurvey',(req,res)=>{
	
	var tempArray = [];
	var weight = 0;
	var count = 0;
	
	var tempObj = {
		ask: "",
		type: "",
		answers: ""
	};
	
	for (c in req.body) {
		
		if (count == 0) {
			count++;
			continue;
		}
		console.log(req.body[c]);
		if ((count % 4) == 1) {
			tempObj.ask = req.body[c];
		} else if ((count % 4) == 2) {
			tempObj.type = req.body[c];
		} else if ((count % 4) == 3) {
			tempObj.answers = req.body[c];
			tempArray.push(tempObj);
			tempObj = {
				ask: "",
				type: "",
				answers: ""
			};
		} else if ((count % 4) == 0) {
			weight = req.body[c];
		}
		count++;
	}
	
	SurveyTemplates.findOne({title:req.body.surveyTitle})
		.then(data=>{
			if (data == null) {
				var template = new SurveyTemplates({
					_id: new mongoose.Types.ObjectId(),
					title: req.body.surveyTitle,
					questions: tempArray,
					weight: weight,
				})
				template.save()
					.then(check=>{
						res.redirect('/createSurvey');
					}).catch(()=>{
						res.redirect('/createSurvey');
					})
			}
		})
	
})

//renders the addClasses.ejs page
app.get('/addClasses',checkAuthenticated,(req,res)=>{
  res.render('addClasses.ejs',{user: req.user})
})

/**
 * this will be called whenever a post method is made to /addClasses
 */
app.post('/addClasses',(req,res)=>{

  if(req.files){
    var file = req.files.fileName,
     filename = file.name
    var results = [];
  
    var moveAndParse = function(callback){
      file.mv(__dirname + "/views/uploads/"+filename, err =>{
        console.log(err)
        if(err){
          console.log(err);
          //res.send("error occured" + err);
        }
      })
      callback()
    }
    moveAndParse( function(){
      fs.createReadStream(__dirname +'/views/uploads/'+filename)
      .pipe(csv({}))
      .on("data", (data) => {
        User.findOne({email:data.email})
        .then(tempStudent=>{
          if(tempStudent== null){
            //send student email
            const slash = /\//gi;
            const period =/\./gi
            var randomString = bcrypt.hashSync(""+data.first[0]+data.last+"", bcrypt.genSaltSync(9));
            randomString = randomString.replace(slash,"");
            randomString = randomString.replace(period,"");
            var password = bcrypt.hashSync(""+data.first[0]+data.last+"", bcrypt.genSaltSync(6));
            //var confirmCode = sendMail(data.email,null,password) 
            //create temp password for student
            var student = new User({
              _id: mongoose.Types.ObjectId(),
              username: ""+data.first[0]+data.last+"",
              first: data.first,
              last: data.last,
              email: data.email,
              password: password,
              locked: false,
              verified:false,
              courses: [],
              confirmCode: randomString,
              isTeacher:false,
              studentId: data.id,
            })
            student.save()
            .then(check=>{
              if(check != null){
                console.log("Added to database")
                results.push(student._id);
              }
            })
            .catch(error =>{
              console.log("Did not add to database")
            })
          }
          else{
            console.log("adding student that already exists in database")
            results.push(tempStudent._id);
          }
        })
        //console.log("test is >> \n" + test);
      })
      .on("end",() =>{
          //console.log(results);
      })
    })
    Course.findOne({course_id:req.body.courseId,section:req.body.courseSection})
    .then(data=>{
      if(data == null){
        var course = new Course({
          _id: new mongoose.Types.ObjectId(),
          intructor : req.user._id,
          section: req.body.courseSection,
          course_id: req.body.courseId,
          description:req.body.courseDesc,
          students:results,
          groups:[],
        })
        course.save()
        .then(check =>{
          Course.updateOne({_id:course._id},{students:results})
          .then(check=>{
            updateStudentsCourses(course._id);
            res.redirect('/classesInfo');
          })
          
          //res.render('classesInfo.ejs',{user:req.user,courses:courses, error: null})
        })
        //console.log("__id " + course.__id);
        
        //
        req.user.courses.push(course._id);
        User.updateOne({_id:req.user._id},{$push:{courses:course.id}})
        .then(()=>{
          //console.log("successful")
          res.redirect('/classesInfo');
        })
        .catch(()=>{
          res.redirect('/classesInfo');
        })
      }
      else{
        res.redirect('/classesInfo');
        //res.render('classesInfo.ejs',{user:req.user,courses:[], error:"Course name and section already exist"})
      }
    })
  }
  else{
    console.log("did not work")
  }
  
})

var updateStudentsCourses = function(id){
  Course.findOne({_id:id})
  .exec()
  .then(classes =>{
    if(classes != null){
     
      for(let i= 0; i < classes.students.length;i++){
        var temp;
        var check = true;
        console.log()
        User.findOne({_id:classes.students[i]})
        .exec()
        .then(result=>{
          for(let j = 0; j< result.courses.length;j++){
            temp = result.courses;
            
            if(temp[j] == id){
              check = false;
              break;
            }

          }
          if(check){
            User.updateOne({_id:classes.students[i]._id},{$push :{courses:id}})
            .then(result=>{
              //console.log("updated User")
            })
            .catch(error=>{
              //console.log("Error updating all the students");
            })
            
          }
          else{
            
          }
        })
      }
    }
    else{
      console.log("Classes was null?")
    }
    
  })
}
/**
 * This will call when a user goes to classesInfo page. This page is only for teachers
 * if the user is not a teacher they get redirected to /myClasses
 */
app.get("/classesInfo",checkAuthenticated,(req,res)=>{
  if(req.user.isTeacher){
    var courses = [];
    
    Course.find({intructor:req.user.id})
    .then(data=>{
      if(data != null){
        res.render('classesInfo.ejs', {user: req.user,courses:data, error: null});
      }
    })
    .catch(error=>{
      console.log(error);
    })
    
    
  }
  else{
    res.redirect('/myClasses');
  }
})
/**
 * this post method gets what class is chosen to edit 
 */
app.post('/classesInfo',checkAuthenticated,(req,res)=>{
  //console.log(req.body.classes);
  if(req.body.classes == undefined){
    Course.find({intructor:req.user.id})
    .then(data=>{
      if(data != null){
        
        res.render('classesInfo.ejs', {user: req.user,courses:data, error: null});
      }
    })
    .catch(error=>{
      console.log(error);
    })

    res.redirect('/classesInfo');
  }
  else{
    var result = req.body.classes.split(",");
    
    Course.findOne({course_id:result[0],section:result[1]})
    .exec()
    .then(data=>{
      //console.log(data);
      var students = [];
      for(let i= 0; i < data.students.length;i++){
        User.findOne({_id:data.students[i]})
        .exec()
        .then(student=>{

          students.push(student);

        })
      }
      
      console.log(students.length);
      res.render('editCourse.ejs', {user: req.user, students:students,course: data, error: null});
      
    })
    
  }
  
  
})


/**
 * 
 */
app.post("/editCourse",(req,res)=>{
  
  
  if(req.files){
    var file = req.files.fileName,
     filename = file.name
    var results = [];
    
    var moveAndParse = function(callback){
      file.mv(__dirname + "/views/uploads/"+filename, err =>{
        //console.log(err)
        if(err){
          console.log("ERROR moving " + err);
          //res.send("error occured" + err);
        }
      })
      callback()
    }
    //making sure that the file matches the current students in the class
    
    moveAndParse( function(){
      //console.log(req.body.myCheck);
      fs.createReadStream(__dirname +'/views/uploads/'+filename)
      .pipe(csv({}))
      .on("data", (data) => {
       
        //need to check here if the students information is the same
        //if the checkbox is not clicked
        //console.log(data);
        
        data["Prev Course"] =  "" +data["Prev Course"]+"";
        //console.log(data["Prev Course"]);
        results.push(data);
        //console.log(results.length);
      }) 
      .on("end",() =>{
        
      })
      var spiltText = req.body.courseName.split(",");
      var courseId;
      //console.log(results);

      //console.log(spiltText[0]);
      //console.log(spiltText[1]);
      Course.findOne({course_id:spiltText[0],section:spiltText[1]})
      .then(dataCourse=>{
          courseId = dataCourse.id;
          //console.log(data.id);
          //console.log(courseId)
          //console.log(results.length);
          var survey = new SurveyResults({
            _id: new mongoose.Types.ObjectId(),
            results:results,
            course_id:courseId,
          })
          survey.save()
          .then(dataN =>{
          
            res.render('editCourse.ejs', {user: req.user, course:dataCourse, error: "Successfully uploaded CSV file"});
          
          })
          .catch(error=>{
            console.log(error)
            res.render('editCourse.ejs', {user: req.user, course:dataCourse, error: error});
          })
        
      })
      //res.render('classesInfo.ejs', {user: req.user, error: null});
        //console.log(results);
    })
    
    
  }
  else{
    res.render("classesInfo.ejs",{user:req.user,error:"There was no file Submitted"});
  }

})

//this is the confirmation the email sent to the user gets sent to. 
//checking to see if the code passed through as :variable is the same verification code
//on the users account. if it is the same then the users verified boolean turns to true.
app.get('/confirm/:variable',(req,res)=>{
  //console.log("Made it here");
  const confirmCode = req.params.variable;
  User.updateOne({confirmCode:confirmCode},{verified:true})
  .exec()
  .then(docs =>{
    if(req.user!=null){
      req.user.verified = true;
    }
    res.redirect("/");
  })
        
})

//logs the user out and redirects them to the home page
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/')
})
//checks to see if the user is Authenticated or not
function checkAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/");
  
}
//checks to see if the user is not authenitcated 
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

//mailing info
const sgMail = require("@sendgrid/mail");
const user = require('./Mongoose Models/user')
sgMail.setApiKey(''+process.env.SENDGRID_PW+'');


//a function that sends a email the a checks to see if this is from register or resending an email
//in order to see if we need to go to the Users account to get the confirmation code to resend
// or create a new one(if user == null)
function sendMail(to,user,tempPassword){
  let randomString;
  if(user == null){
    const slash = /\//gi;
    const period =/\./gi
    randomString = bcrypt.hashSync(to, bcrypt.genSaltSync(9));
    randomString = randomString.replace(slash,"");
    randomString = randomString.replace(period,"");
  }
  else{
    //console.log("getting from user")
    randomString = user.confirmCode;
  }
  let link = "https://wcu-surveytool.herokuapp.com/confirm/" + randomString;
  //let link = "http://localhost:3000/confirm/" + randomString;
  //console.log(link);
  
  const msg = {
    to: to,
    from:"wcu.SurveyTool@gmail.com",
    subject: "Confirmation",
    text: "Hello,\nYou are recieving this email because you have been registered " + 
    "for wcu-surveytool website.\n\n" +
    "Please verify your email address using this link below "+ link +
    "\n\n--WCU-SurveyTool"
  }
  if(tempPassword != null){
    msg = {
      to: to,
      from: "wcu.SurveyTool@gmail.com",
      subject: "Confirmtion",
      text: "Hello,\nYou are recieving this email because you have been registered " + 
      "for wcu-surveytool website.\n\n" +
      "You tempary password has been set to: "+ tempPassword + "\n" + 
      "Please verify your email address using this link below "+ link +
      "\n\n--WCU-SurveyTool"
    }
  }
  sgMail.send(msg);
  if(user == null){
    return randomString;
  }
  
  
}
var deleteAllClasses = function(){
  Course.find()
  .then(data=>{
    for(let i = 0; i < data.length; i++){
      Course.deleteOne({course_id:data[i].course_id})
      .then(data1=>{
        if(data1 != null){
          console.log("deleted")
        }
        
      })
    }
    
  })
}
var deleteEveryonesCourses = function(){
  User.find()
  .then(data=>{
    for(let i = 0; i < data.length; i++){
      User.updateOne({_id:data[i]._id},{courses:[]})
      .then(result=>{
        console.log("deleted >> "+ i);
      })
    }
  })
}
//deleteAllClasses();
//updateStudentsCourses("60729871cb153b3a249b2f5d");
//deleteEveryonesCourses()

//makes sure the server is listening on a specified port number. 
app.listen(process.env.PORT || 3000)
