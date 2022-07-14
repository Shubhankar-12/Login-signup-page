require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const ejs = require('ejs')
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view-engine', 'ejs');


mongoose.connect('mongodb://localhost:27017/userDB')

const userSchema = mongoose.Schema({
    fullname: String,
    username: String,
    usrNum: String,
    pasword: String,
    image: String
});

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})
// app.get('/home', (req, res) => {

//     res.render('home.ejs');

// })

app.post('/', (req, res) => {
    const userName = req.body.username_in;
    const userPass = req.body.password_in;
    User.findOne({ username: userName }, (err, foundUser) => {
        if (!err) {
            bcrypt.compare(userPass, foundUser.pasword, (err, result) => {
                if (result)
                    res.render('home.ejs', { user: foundUser });
                else
                    res.send('No such user found!');
            })
        }
        else {
            console.log(err);
            res.redirect('/');
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
    const img = req.file.filename;
    if (validate(userPass, cnfPass)) {
        bcrypt.hash(userPass, saltRounds, (err, hash) => {
            if (err)
                console.log(err);
            else {
                const newUser = new User({
                    fullname: userName,
                    username: userID,
                    usrNum: userNum,
                    pasword: hash,
                    image: img
                })
                newUser.save();
                res.render('home.ejs', { user: newUser });
            }
        });
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