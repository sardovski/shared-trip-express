const { Schema, model } = require('mongoose');

const schema = new Schema({
    startPoint: { type: String, required: [true, 'Start Point is required'], minLength: [4, 'Start point must be at least 4 characters'] },
    endPoint: { type: String, required: [true, 'End Point is required'], minLength: [4, 'End point must be at least 4 characters'] },
    date: { type: String, required: [true, 'Date is required'] },
    time: { type: String, required: [true, 'Time is required'] },
    carImage: { type: String, required: [true, 'Car image is required'], match: [/^https?/, 'Car Image must be a valid URL'] },
    carBrand: { type: String, required: [true, 'Car brand is required'], minLength: [4, 'Car brand should be at least 4 characters long'] },
    seats: { type: Number, required: [true, 'Seats is required'], min: [0, 'Seats must be 0-4'], max: [4, 'Seats must be 0-4'] },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be from 1 to 50'], max: [50, 'Price must be from 1 to 50'] },
    description: { type: String, required: [true, 'Description is required'], minLength: [10, 'Description should be at least 10 characters long'] },
    creator: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    buddies: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }]
});

module.exports = model('Trip', schema);