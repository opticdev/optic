import mongoose from 'mongoose'

const user = mongoose.model('user', new mongoose.Schema({
    'firstName': 'string',
    'lastName': 'string',
    'email': 'string',
}))