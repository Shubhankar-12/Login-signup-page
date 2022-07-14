require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportLocacalMongoose = require('passport-local-mongoose');
const ejs = require('ejs')
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view-engine', 'ejs');

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/userDB')

const userSchema = mongoose.Schema({
    fullname: String,
    username: String,
    usrNum: String,
    pasword: String,
    image: String
});

userSchema.plugin(passportLocacalMongoose);


const Storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({
    storage: Storage
}).single('file');


const User = mongoose.model('User', userSchema);

// passport.use(User.createStrategy());
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.verifyPassword(password)) { return done(null, false); }
            return done(null, user);
        });
    }
));
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})
app.get('/home', (req, res) => {
    console.log(req.isAuthenticated());
    res.send('home');
})

app.post('/', (req, res) => {
    const user = new User({
        username: req.body.username_in,
        pasword: req.body.password_in
    })
    req.logIn(user, (err) => {
        if (err)
            console.log(err);
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/home');
            })
        }
    })
})

const validate = (pass, cnfPass) => {
    if (pass === cnfPass)
        return true;
    return false;
}

app.post('/register', upload, (req, res) => {
    const userName = req.body.username_reg;
    const userID = req.body.mail_reg;
    const userNum = req.body.mobile_reg;
    const userPass = req.body.password_reg;
    const cnfPass = req.body.CnfrmPass;
    // const img = req.file.filename;
    if (validate(userPass, cnfPass)) {
        User.register({ fullname: userName, username: userID, usrNum: userNum }, userPass, (err, user) => {
            if (err)
                console.log(err);
            else {
                User.authenticate('local', { failureRedirect: '/verify', failureMessage: true })(req, res, () => {

                    res.redirect('/');
                })
                // .then(res.redirect('/home'));
            }
        })
    }
    else {
        res.send("Incorrect details.please try again")
    }
});

app.get('/verify', (req, res) => {
    res.sendFile(__dirname + '/otp.html')
});

// app.get('/home/:uID', (req, res) => {
//     const uniqId = req.params.uID;
//     User.findOne({ usrName: uniqId }, (err, foundUser) => {
//         if (!err) {
//             res.render('home.ejs', { userName: foundUser.usrName, userID: foundUser.usrID, userNum: foundUser.usrNum });
//         }
//         else
//             res.send('No user found!');
//     })
// })

app.listen('3000', () => {
    console.log("Server has been started successfully");
})