/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const moment = require('moment');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');

moment.locale('es')

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');
const config = require('./config/user');

const app = express();

app.locals.moment = moment;


/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
	console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
	process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
	src: path.join(__dirname, 'public'),
	dest: path.join(__dirname, 'public'),
	outputStyle: 'compressed'
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({
		url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
		autoReconnect: true
	})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
// 	if (req.path === '/api/upload') {
// 		next();
// 	} else {
// 		lusca.csrf()(req, res, next);
// 	}
// });
// app.use(lusca.xframe('SAMEORIGIN'));
// app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
	res.locals.user = req.user;
	next();
});
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (!req.user &&
			req.path !== '/usuario/ingreso' &&
			req.path !== '/usuario/registro' &&
			!req.path.match(/^\/auth/) &&
			!req.path.match(/\./)) {
		req.session.returnTo = req.path;
	} else if (req.user &&
			req.path == '/account') {
		req.session.returnTo = req.path;
	}
	next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.use('/', homeRoutes);
app.use('/usuario', userRoutes);
app.use('/perfil', passportConfig.isAuthenticated,profileRoutes);
app.use('/alumno', passportConfig.isAuthenticated, config.isStudent, studentRoutes);
app.use('/admin', passportConfig.isAuthenticated, config.isAdmin, adminRoutes);
app.use('/profesor', passportConfig.isAuthenticated, config.isTeacher, teacherRoutes);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;
