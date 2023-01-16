import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    verify: {
        type: Boolean,
        default: false
    },
    text: {
        type: [String],
    },
    token: {
        type: String
    },
},
{
    timestamps: true
})

export default mongoose.model('User', userSchema)
