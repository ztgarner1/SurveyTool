//this file sets up a passport an allows you to get 
//the user(if logged in) from the request sent to server.js
const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
const User = require('./Mongoose Models/user');
var user;
function initialize(passport){
    const authenticateUser = async (email, password, done) =>{
        //console.log(email)
        //const user = getUserByEmail(email)
        User.findOne({email:email})
        .exec()
        .then(data =>{
            console.log(data)
            user = data;
            try {
                if(user == null){
                    return done(null, false, {message: "Email or password is incorrect"})
                }
                if(bcrypt.compareSync(password, user.password)){
                    //console.log(docs[i]);
                    console.log("comparing password")
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
    
    
    passport.use(new localStrategy({usernameField: "email"}, authenticateUser));
    passport.serializeUser((user,done) => {
        //console.log("serializing user")
        //console.log(arguments.callee.caller);
        done(null, user.id);
    })
    
    passport.deserializeUser((user,done) => {
        User.findById(user, (error,user)=>{
            done(error, user)
        })
        
    });

}

module.exports = initialize;