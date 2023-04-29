const express = require("express");
const session = require("express-session");
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const flash = require('connect-flash')
const app = express();
const User = require('./models/user');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
require('dotenv').config();
const helpers = require('handlebars-helpers')();
const router = require('./routes/start');

//Реалізація routes, щоб забезпечити місцеположення файлів js
const indexRouter = require('./routes/start');

//const authenticationRouter = require('./routes/auth');


//Активізація нашої реалізації Routes

//app.use('/authentication', authenticationRouter);




//run our server and dtabase
const PORT = process.env.PORT || 3000;

async function connectToDatabase() {
    try {
        const connection = await mongoose.connect(process.env.MONGO_DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Database MongoDB connect successful");
        return connection;
    } catch (err) {
        console.log(`Something wrong with MongoDB ${err}`);
        return null;
    }
}



//middleware OS


async function startServer() {
    try {
        const connection = await connectToDatabase();
        if (!connection) {
            console.log("Unable to connect to MongoDB. Exiting...");
            process.exit(1);
        }
        await app.listen(PORT);
        console.log(`Server has been started ${PORT}`);
    } catch (err) {
        console.log(`Error starting server: ${err}`);
        process.exit(1);
    }
}



//public = folder public with this directory who have name "__dirname"
app.engine('hbs', expressHandlebars.engine({ extname: '.hbs', handlebars: allowInsecurePrototypeAccess(Handlebars), helpers: {
    // Реєстрація хелпера ifCond
    ifCond: helpers.ifCond,
    ifEqual: function(arg1, arg2, options) {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
      }
  }}))


app.set('view engine', 'hbs')
app.set('views', 'views')



//Для Css файлів
app.use(express.static('public'));

app.use(session({
    secret:'verygoodsecret',
    resave: false,
    saveUninitialized: false
}))

//Для зчитування даних з бази даних
app.use(express.urlencoded({extended: true}));

app.use(express.json());


app.use(flash());

//Якщо будете користуватися флеш повідомленнями накшталт error, чи success обов'язково налаштуйте app.use для flash
app.use((req, res, next) => {
    res.locals.flash = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

//Passport.js


passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser(async (id, done)=>{
    try{
    //Setup user model across mongoose Schema!
        const user = await User.findById(id);
        done(null, user);
    }
    catch(err){
        done(err, null)
    }
});

passport.use(new localStrategy(
    async (username, password, done) =>{
        try{
            const user = await User.findOne({username: username})
            if(!user) return done(null, false, {messege: 'Incorrect username.'});
        
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return done(null, false, {message: "Incorrect password"});
            return done(null, user);
        }
        catch(err){
            return done(err);
        }
    }
))



app.use(passport.initialize());
app.use(passport.session());


//Routes

app.use('/', indexRouter);









/*
//Setup our admin user

app.get('/setup', async (req, res) => {
	const exists = await User.exists({ username: "admin" });

	if (exists) {
        console.log("Exist");
		res.redirect('/login');
		return;
	};

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("pass", salt, (err, hash) => {
			if (err) return next(err);
			
			const newUser = new User({
				username: "admin",
				password: hash
			});

			newUser.save();

			res.redirect('/login');
		});
	});
});


*/
//connect our port


startServer();


module.exports = {app, startServer};















