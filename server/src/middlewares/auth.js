const isLoggedIn = (message = 'Please log in') => {
    const isLoggedIn = (req, res, next) => {
        try {
            if (req.session.userId) {
                next();
            } else {
                return res.status(400).json({ message });
            }
        } catch (error) {
            console.log(error);
        }
    }
    return isLoggedIn;
}

const isLoggedOut = (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.status(400).json({ message: 'You\'re already logged in' });
        }
        next();
    } catch (error) {
        console.log(error);
    }
}

export { isLoggedIn, isLoggedOut };