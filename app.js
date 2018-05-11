var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs')
var db = mongojs('testapp',['users']);
var ObjectId = mongojs.ObjectId;
var app = express();
const PORT = process.env.PORT || 3000

/*
var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);
*/

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname,'public')));

// global vars
app.use(function(req,res,next){
	res.locals.errors = null;
	next();
});

// Express validator middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param: formParam,
			msg: msg,
			value: value
		}
	}
}));

var users = [
	{
		id:1,
		first_name: 'John',
		last_name: 'Doe',
		email: 'johndoe@gmail.com'
	},
	{
		id:2,
		first_name: 'Bob',
		last_name: 'Simth',
		email: 'bobsmith@gmail.com'
	},
	{
		id:3,
		first_name: 'Jill',
		last_name: 'Jackson',
		email: 'jjackson@gmail.com'
	}
]

app.get('/', function(req, res){
	db.users.find(function(err,docs){
		res.render('index',{
			title: 'Customers',
			users: docs
		});
	});
});

app.post('/users/add', function(req, res){
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('last_name', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();

	var errors = req.validationErrors();
	
	if(errors){
		res.render('index',{
			title: 'Customers',
			users: users,
			errors: errors
		});
	} else{
		var newUser = {
			first_name:req.body.first_name,
			last_name:req.body.last_name,
			email:req.body.email,
		}
		db.users.insert(newUser,function(err, result){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});
	}
});

app.delete('/users/delete/:id', function(req,res){
	db.users.remove({_id: ObjectId(req.params.id)}, function(err,result){
		if(err){
			console.log(err);
		}
		res.redirect('/');
	});
});

app.listen(PORT, function(){
	console.log('Server started on port '+PORT);
})