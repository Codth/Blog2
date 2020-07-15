const mongoose = require('mongoose');



// const uri = "mongodb+srv://dbUser:Fuckyou123%40@cluster0-uox64.mongodb.net/dbUser?retryWrites=true&w=majority";
// mongoose.connect(uri, {
//     useNewUrlParser: true
// });

 

mongoose.connect('mongodb://localhost:27017/BlogDB',{ useNewUrlParser: true,useUnifiedTopology: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});

require('./blog.model');
