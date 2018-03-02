import mongoose from 'mongoose'

const model = mongoose.model('user', new mongoose.Schema({
    'firstName': 'string',
    'lastName': 'string',
    'email': 'string',
}))