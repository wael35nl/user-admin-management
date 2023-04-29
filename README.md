# user-admin-management

&nbsp;

## User registration => securing, verifying, storing

&nbsp;

### Process steps

&nbsp;

#### First step ( Developer )

1- create the model.

- packages:
  - mongoose ( Schema, model )

- folder/file:
  - src/models/users.js

```js
const userSchema = new Schema({
    name: {},
    email: {},
    password: {},
    image: {},
    ...
});

const User = model('users', userSchema);
```

2- create the routes.

- packages:
  - express ( Router )
  - formidable/or/multer -for files uploads-

- folder/file:
  - src/routes/users.js

```js
router.post('/register', formidable()/or/multer.uploadSingle('image'), registerUser);
router.post('/verify-email', verifyEmail);
```

&nbsp;

#### Second step ( User )

1- fill in the required information in the registration from, then click on register.

&nbsp;

#### Third step ( Developer )

3- secure the password.

- packages:
  - bcrypt

- folder/file:
  - create the securePassword function: src/helpers/securePassword.js ( securePassword )
  - call the securePassword function: src/controllers/users.js ( registerUser )

```js
const saltRounds = 10;
const securePassword = async (plainPassword) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error);
    }
}
```

4- create the token.

- packages:
  - jwt

- folder/file:
  - src/controllers/users.js ( registerUser )

```js
const token = jwt.sign({ userData }, jwtSecretKey, { expiresIn: '10m' });
```

5- prepare the email data.

- folder/file:
  - src/controllers/users.js ( registerUser )

```js
const emailData = {
    email,
    subject: 'Account activation email',
    html: `
        <h2>Hello ${name}!</h2>
        <p>Please click here to <a href='${clientUrl}/api/users/activate/${token}' target='_blank'>activate your account</a></p>
        `
}
```

6- send the verification email.

- packages:
  - nodemailer

- folder/file:
  - create the sendEmail function: src/helpers/email.js
  - call the sendEmail function: src/controllers/users.js ( registerUser )

```js
const sendEmailWithNodeMailer = async (emailData) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: smtpUserName,
                pass: smtpPassword,
            }
        });

        const mailOptions = {
            from: smtpUserName,
            to: emailData.email,
            subject: emailData.subject,
            html: emailData.html,
        }

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('----SMTP ERROR1----');
                console.log(error);
            } else {
                console.log('Message sent: %s', info.response);
            }
        })
    } catch (error) {
        console.log('----SMTP ERROR2----');
        console.log('Problem sending email: ', error);
    }
}
```

&nbsp;

#### Fourth step ( User )

2- click on the verification link received in the email.

&nbsp;

#### Fifth step ( Developer )

7- verify the email, and create the user without image, then conditionally add the image.

- packages:
  - jwt

- folder/file:
  - src/controllers/users.js ( verifyEmail )

```js
jwt.verify(token, jwtSecretKey, async (err, decoded) => {
    if (err) {
        return res.status(401).json({ message: 'token is expired' });
    }
    const { userData } = decoded;

    const newUser = new User({...userData});

    // if image =>
    // formidable
    if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
    }
    // multer
    if (image) {
        newUser.image = image.path;
    }

    const user = await newUser.save();
});
```

&nbsp;

## User log in/out

### log in/out Process steps

&nbsp;

#### First step ( User )

1- enter email and password, then click on (login / sign in).

&nbsp;

#### Second step ( Developer )

1- compare the givin password.

- packages:
  - bcrypt

- folder/file:
  - create the comparePassword function: src/helpers/securePassword.js ( comparePassword )
  - call the securePassword function: src/controllers/users.js ( loginUser )

```js
const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.log(error);
    }
}
```

2- create a session.

- packages:
  - express-session
  - cookie-parser => app.use(cookie-parser())

- folder/file:
  - use the session: src/routes/users.js

  ```js
  userRouter.use(session({
    name: 'user-session',
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 }
  }));

  userRouter.post('/login', isLoggedOut: 'to be used as validation, if user is already logged in', loginUser);
  ```

  - create the session: src/controllers/users.js ( loginUser )
  
  ```js
  req.session.userId = user._id;
  ```

  - login
    - authenticate the session: src/middlewares/auth.js ( isLoggedIn )

    ```js
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
    ```

  - logout
    - destroy the session and clear the cookie: src/controllers/users.js ( logOutUser )

    ```js
    req.session.destroy();
    res.clearCookie('user-session');
    res.redirect('/');
    ```
