const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { isGuest, isUser } = require('../middlewares/guards');

router.get('/register', isGuest(), (req, res) => {
    res.render('register');
});

router.post(
    '/register',
    isGuest(),
    body('email')
        .isEmail()
        .withMessage('Enter valid email')
        .bail(),
    body('password')
        .isLength({ min: 4 })
        .withMessage('Password must be at least 4 characters long')
        .bail(),
    body('rePass').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('Passwords don\'t match');
        }
        return true;
    }),
    async (req, res) => {
        const { errors } = validationResult(req);
        try {
            if (errors.length > 0) {
           
                throw new Error(errors.map(e => e.msg).join('\n'));
            }

            await req.auth.register(req.body.email, req.body.password, req.body.gender);

            res.redirect('/trips/shared'); 
        } catch (err) {
            let isMale = false;
            let isFemale = false;
            if (req.body.gender == 'male') {
                isMale = true;
            } else {
                isFemale = true;
            }
            const ctx = {
                errors: err.message.split('\n'),
                userData: {
                    email: req.body.email,
                    isMale,
                    isFemale
                }
            }
            res.render('register', ctx)
        }

    }
);

router.get('/login', isGuest(), (req, res) => {
    res.render('login');
});

router.post('/login', isGuest(), async (req, res) => {
    try {
        await req.auth.login(req.body.email, req.body.password);
        res.redirect('/trips/shared'); 
    } catch (err) {
        let errors = [err.message];
        if (err.type == 'credential') {
            errors = ['Incorrect email or password!']
        }
        const ctx = {
            errors,
            userData: {
                email: req.body.email
            }
        }

        res.render('login', ctx);
    };
});

router.get('/logout', isUser(), (req, res) => {
    req.auth.logout();
    res.redirect('/');
});

router.get('/user', isUser(), async (req, res) => {
    const userRefreshed = await req.auth.refresh(req.user.email);
    console.log(userRefreshed.history);

    const ctx = {
        user: req.user,
        userRefreshed
    }
    res.render('profile', ctx);
});

module.exports = router;