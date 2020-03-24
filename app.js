var express = require('express');
var app = express();

var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

const io = require('socket.io')();

const port = process.env.PORT || 3030;
let connected = [];


//Connection our db for Log in functionality
// Username: user1
//Password: 123
var connection = mysql.createConnection({
    host     : 'localhost',
    port: 8889,
	user     : 'root',
	password : 'root',
	database : 'db_chatapp'
});

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

//LOG OUT
app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
	});
});
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/login.html'));
});
//Checking authorization
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter your Username and Password!');
		response.end();
	}
});


// if user logs in succssesfylly, redner chat page
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
        response.sendFile(__dirname + '/views/home.html');
		//response.send('Welcome back, ' + request.session.username + '!');
		console.log('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to see this page!');
	}
    //response.end();
});

// tell express where our static files are (js, images, css etc)
app.use(express.static('public'));
//App is running on post 3030
const server = app.listen(port, () => {
    console.log(`ChatApp is running on port ${port}`);
});




//attach our chat server to our app
io.attach(server);

io.on('connection', function(socket){   //socket is your connection
    console.log('a user has connected');
    connected.push(socket);
    // referance for counting connected users
    //https://stackoverflow.com/questions/44794459/how-to-display-connected-clients-using-node-js-and-socket-oi-js-on-html
    console.log('Connected: %s users in chat', connected.length);

    socket.emit('connected', { sID: socket.id, name: socket.nickname, message: "new connection", connected: connected.length});

    socket.on('chat_message', function(msg){
        console.log(msg);

        io.emit('new_message', {id: socket.id, message: msg})
    })

    socket.on('disconnect', function() {
        console.log('a user disconnected');
        connected.splice(connected.indexOf(socket), 1);
        console.log('Connected: %s users in chat', connected.length);
    })
})