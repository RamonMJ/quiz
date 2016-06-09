var userController = require('./user_controller');
var logoutTime = 120000;

// GET /session   -- Formulario de login
exports.new = function(req, res, next) {
     res.render('session/new', { redir: req.query.redir || '/' });
};


// POST /session   -- Crear la sesion si usuario se autentica
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/'
    var login     = req.body.login;
    var password  = req.body.password;

    userController.autenticar(login, password)
        .then(function(user) {

	        // Crear req.session.user y guardar campos id y username// La sesión se define por la existencia de: req.session.user
	 var logoutDate = Date.now() + logoutTime;	       
	 req.session.user = {id:user.id, username:user.username,
isAdmin: user.isAdmin, logoutDate:logoutDate};

	        res.redirect(redir); // redirección a la raiz
		})
		.catch(function(error) {
            req.flash('error', 'Se ha producido un error: ' + error);
            res.redirect("/session?redir="+redir);  ;        
    });
};


// DELETE /session   -- Destruir sesion 
exports.destroy = function(req, res, next) {

    delete req.session.user;
    
    res.redirect("/session"); // redirect a login
};

// Caduda/ Middleware que cierra sesion al cabo de dos minutos
exports.caduca = function(req, res, next) {
	if(req.session.user){
		if(req.session.user.logoutDate < Date.now()){
			delete req.session.user;
		}
		else{
			req.session.user.logoutDate = Date.now() + logoutTime;}
	}
	next();
};

//Middleware: Se requiere hacer login
exports.loginRequired = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/session?redir=' + (req.param('redir') || req.url));
    }
};
