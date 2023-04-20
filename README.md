# user-admin-management

User registration => securing, verifying, storing

&nbsp;

## Process steps

### First step (Developer)

1- create the model  

- packages:
  - mongoose ( Schema, model )

- folder/file:
  - src/models/users.js

```js
const userSchema = new Schema({
    name: {},
    email: {},
    password: {},
    phone: {},
    is_admin: {},
    is_verified: {},
    createdAt: {},
    image: {}
    ...
});

const User = model('users', userSchema);
```

2- create the routes  

- packages:
  - express ( Router )
  - formidable -for files uploads-

- folder/file:
  - src/routes/users.js

```js
router.post('/register', formidable(), registerUser);
router.post('/verify-email', verifyEmail);
```

&nbsp;

### Second step (User)

1- fill in the required information in the registration from, and click register.

&nbsp;

### Third step (Developer)

3- secure the password  

- packages:
  - bcrypt

- folder/file:
  - create the securePassword function: src/helpers/securePassword.js
  - call the securePassword function: src/controllers/users.js ( registerUser )

```js
const securePassword = async (plainPassword) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error);
    }
}
```

4- create the token  

- packages:
  - jwt

- folder/file:
  - src/controllers/users.js ( registerUser )

```js
const token = jwt.sign({ userData }, jwtSecretKey, { expiresIn: '10m' });
```

5- prepare the email data

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

6- send the verification email  

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

### Fourth step (User)

2- click on the verification link received in the email.

&nbsp;

### Fifth step (Developer)

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

    if (image) {
        newUser.image.data = fs.readFileSync(image.path);
        newUser.image.contentType = image.type;
    }

    const user = await newUser.save();
});
```
