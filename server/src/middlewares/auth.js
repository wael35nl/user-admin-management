const isLoggedIn = (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        }
        return res.status(400).json({ message: 'Please log in' });
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

export { isLoggedIn, isLoggedOut };