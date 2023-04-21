const isLoggedIn = (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            return res.status(400).json({ message: 'Please log in' });
        }
    } catch (error) {
        console.log(error);
    }
}

const loggedIn = (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            return res.status(400).json({ message: 'You\'re already logged out' });
        }
    } catch (error) {
        console.log(error);
    }
}

const isLoggedOut = (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.status(400).json({ message: 'already logged in' });
        }
        next();
    } catch (error) {
        console.log(error);
    }
}

export { isLoggedIn, loggedIn, isLoggedOut };