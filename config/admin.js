const User = require('../models/User');
//Middleware para admin
exports.isAdmin = (req, res, next) => {
	if(req.user) {
		User
		.findById(req.user.id)
		.exec((err, foundUser) => {
			if (err) return res.status(500).send(err)
			if (foundUser.type == 1){
				return next()
			} else {
				return res.redirect('/')
			}
		})
	} else {
	  return res.redirect('/login');
	}
}