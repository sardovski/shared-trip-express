const Trip = require('../models/Trip');
const User = require('../models/User');

async function getAllTrips() {
    return await Trip.find({}).lean();
}

async function getTripById(id) {
    return await Trip.findById(id).populate('buddies').populate('creator').lean();
}

async function createTrip(tripData) {
    const trip = new Trip(tripData);
    const user = await User.findById(trip.creator);

    user.history.push(trip)
    await Promise.all([user.save(), trip.save()]);
    return trip;
}

async function joinTrip(tripId, userId) {
    const trip = await Trip.findById(tripId);

    trip.buddies.push(userId);
    trip.seats = trip.seats - 1;
    await trip.save();
    return trip;
}

async function deleteTrip(id) {
    await Trip.findByIdAndDelete(id);
}

async function editTrip(id, tripData) {
    const trip = await Trip.findById(id);

    trip.startPoint = tripData.startPoint;
    trip.endPoint = tripData.endPoint;
    trip.date = tripData.date;
    trip.time = tripData.time;
    trip.carImage = tripData.carImage;
    trip.carBrand = tripData.carBrand;
    trip.seats = tripData.seats;
    trip.price = tripData.price;
    trip.description = tripData.description;

    await trip.save();
}


module.exports = {
    getAllTrips,
    getTripById,
    createTrip,
    joinTrip,
    deleteTrip,
    editTrip
}