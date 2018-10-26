const User = require('../models/User');
//Middleware para admin
exports.isAdmin = (req, res, next) => {
	if(req.user) {
		User
		.findById(req.user._id)
		.exec((err, foundUser) => {
			if (err) return res.status(500).send(err)
			if (foundUser.type == 1){
				return next()
			} else {
				return res.redirect('/')
			}
		})
	} else {
	  return res.redirect('/usuario/ingreso');
	}
}

exports.isStudent = (req, res, next) => {
	if(req.user) {
		User
		.findById(req.user._id)
		.exec((err, foundUser) => {
			if (err) return res.status(500).send(err)
			if (foundUser.type == 2){
				return next()
			} else {
				return res.redirect('/')
			}
		})
	} else {
	  return res.redirect('/usuario/ingreso');
	}
}

exports.isTeacher = (req, res, next) => {
	if(req.user) {
		User
		.findById(req.user._id)
		.exec((err, foundUser) => {
			if (err) return res.status(500).send(err)
			if (foundUser.type == 3){
				return next()
			} else {
				return res.redirect('/')
			}
		})
	} else {
	  return res.redirect('/usuario/ingreso');
	}
}