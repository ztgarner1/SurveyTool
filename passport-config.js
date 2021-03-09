//this file sets up a passport an allows you to get 
//the user(if logged in) from the request sent to server.js
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const Student = require('./Mongoose Models/student');
const Teacher = require('./Mongoose Models/teacher');
var user;
function initialize(passport){
    const authenticateUser = async (email, password, done) =>{
        //console.log(email)
        //const user = getUserByEmail(email)
        Teacher.findOne({email:email})
        .exec()
        .then(data=>{
            user = data;
            try {
                if(user == null){
                    console.log("checked here");
                    Student.findOne({email:email})
                    .exec()
                    .then(result =>{
                        user = result;
                        try {
                            if(user == null){
                                //console.log("Not in either");
                                return done(null, false, {message: "Email or password is incorrect"})
                            }
                            if(bcrypt.compareSync(password, user.password)){
                                //console.log(docs[i]);
                                //console.log("comparing password")
                                return done(null, user)
                            }
                            else{
                                return done(null, false, {message: "Email or password is incorrect"})
                            }
                        } catch (error) {
                            return done(error);
                        }
                    })
                    .catch(error=>{
                        return done(null, false, {message: "Email or password is incorrect"})
                    })
                }
                else{
                    if(bcrypt.compareSync(password, user.password)){
                    //console.log(docs[i]);
                        //console.log("comparing password")
                        return done(null, user)
                    }
                    else{
                        return done(null, false, {message: "Email or password is incorrect"})
                    }
                }
                
            } catch (error) {
                return done(error);
            }
        })
        .catch(error=>{
            return done(null, false, {message: "Email or password is incorrect"})
        })
     
    }
    //return done(null, false, {message: "Email or password is incorrect"})
    
    passport.use(new localStrategy({usernameField: "email"}, authenticateUser));
    passport.serializeUser((user,done) => {
        
        //console.log(user);
        done(null, user);
    })
    
    passport.deserializeUser((user,done) => {
        //console.log(user)
        if(user.isTeacher){
            Teacher.findById(user, (error,user)=>{
                done(error, user)
            })
        }
        else{
            Student.findById(user, (error,user)=>{
                done(error, user)
            })
        }
        
    });

}

module.exports = initialize;
