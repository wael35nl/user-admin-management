import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
        minlength: [2, 'Name is to short'],
        maxlength: [16, 'Name is to long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validatE: {
            validator: valid => {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(valid);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        min: 6
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    },
    is_admin: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        data: Buffer,
        contentType: String
    }
});

const User = model('users', userSchema);

export default User;