require('./models/db');

const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyparser = require('body-parser');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

var app = express();




require('./config/passport')(passport);



app.use(bodyparser.urlencoded({
    extended: true
}));


// Add static media to the express
app.use(express.static(__dirname + '/views/'));

app.use(bodyparser.json());

app.use(fileUpload({
    limits: {
        fileSize: 1000000 //1mb
    },
    abortOnLimit: true
}));


// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge : 3600000 }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Connect flash
app.use(flash());



app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/',handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'hbs');

app.listen( process.env.PORT, () => {
    console.log('Express server started at port : 3000');
});

app.use('/', require('./controllers/index-controller'));
app.use('/users', require('./controllers/login-controller'));




//----------------------
