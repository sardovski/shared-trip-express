const router = require('express').Router();
const { isUser } = require('../middlewares/guards');
const { errorParser } = require('../util/errorParser');

router.get('/shared', async (req, res) => {
    const trips = await req.storage.getAllTrips();

    res.render('shared-trips', { trips });
});

router.get('/create', isUser(), async (req, res) => {
    res.render('create');
});

router.post('/create', isUser(), async (req, res) => {
    try {
        const tripData = {
            startPoint: req.body.startPoint,
            endPoint: req.body.endPoint,
            date: req.body.date,
            time: req.body.time,
            carImage: req.body.carImage,
            carBrand: req.body.carBrand,
            seats: Number(req.body.seats),
            price: Number(req.body.price),
            description: req.body.description,
            creator: req.user._id
        }

        await req.storage.createTrip(tripData);
        res.redirect('/trips/shared');
    } catch (err) {
        console.log(err);
        const ctx = {
            errors: errorParser(err), 
            tripData: {
                startPoint: req.body.startPoint,
                endPoint: req.body.endPoint,
                date: req.body.date,
                time: req.body.time,
                carImage: req.body.carImage,
                carBrand: req.body.carBrand,
                seats: Number(req.body.seats),
                price: Number(req.body.price),
                description: req.body.description,
            }
        }
        res.render('create', ctx);
    }
});

router.get('/details/:id', async (req, res) => {
    try {
        const trip = await req.storage.getTripById(req.params.id);
        trip.printBuddies = Object.values(trip.buddies).map(b => ` ${b.email}`);
        trip.driver = trip.creator.map(d => d.email);
        console.log(trip.creator);
        trip.isCreator = req.user && req.user._id == trip.creator.map(d => d._id);
        trip.hasJoined = req.user && trip.buddies.find(u => u._id == req.user._id);
        if (trip.seats > 0 && !trip.isCreator && !trip.hasJoined) {
            trip.hasSeats = true;
        } else {
            trip.hasSeats = false;
        }
        trip.hasUser = Boolean(req.user);
        console.log(trip);
        const ctx = {
            trip,
            user: req.user
        }

        res.render('details', { ctx });
    } catch (error) {
        console.log(error.message);
        res.redirect('/404');
    }
});

router.get('/join/:id', isUser(), async (req, res) => {
    try {
        const trip = await req.storage.getTripById(req.params.id);

        if (trip.creator.map(d => d._id) == req.user._id) {
            throw new Error('Cannot join your own trip!');
        }
        console.log(req.user._id);
        await req.storage.joinTrip(req.params.id, req.user._id);
        res.redirect('/trips/details/' + req.params.id);
    } catch (err) {
        console.log(err.message);
        res.redirect('/trips/details/' + req.params.id);
    }
});

router.get('/delete/:id', isUser(), async (req, res) => {

    try {
        const trip = await req.storage.getTripById(req.params.id);

        if (trip.creator.map(d => d._id) != req.user._id) {
            throw new Error('Cannot delete trip you have not created!');
        }

        await req.storage.deleteTrip(req.params.id);
        res.redirect('/trips/shared');
    } catch (err) {
        console.log(err.message);
        if (err) {
            res.redirect('/');
        } else {
            res.redirect('/trips/details/' + req.params.id);
        }
    }
});

router.get('/edit/:id', isUser(), async (req, res) => {
    try {
        const trip = await req.storage.getTripById(req.params.id);

        if (trip.creator.map(d => d._id) != req.user._id) {

            throw new Error('Cannot edit trip you have not created!');
        }

        res.render('edit', { trip })
    } catch (err) {
        console.log(err.message);
        if (err) {
            res.redirect('/');

        } else {
            res.redirect('/trips/details/' + req.params.id);
        }
    }
});

router.post('/edit/:id', isUser(), async (req, res) => {
    try {
        const trip = await req.storage.getTripById(req.params.id);

        if (trip.creator.map(d => d._id) != req.user._id) {

            throw new Error('Cannot edit trip you have not created!');
        }

        const tripData = {
            startPoint: req.body.startPoint,
            endPoint: req.body.endPoint,
            date: req.body.date,
            time: req.body.time,
            carImage: req.body.carImage,
            carBrand: req.body.carBrand,
            seats: req.body.seats,
            price: req.body.price,
            description: req.body.description
        }

        await req.storage.editTrip(req.params.id, tripData);
        res.redirect('/trips/details/' + req.params.id);
    } catch (err) {
        const ctx = {
            errors: errorParser(err),
            trip: {
                _id: req.params.id,
                startPoint: req.body.startPoint,
                endPoint: req.body.endPoint,
                date: req.body.date,
                time: req.body.time,
                carImage: req.body.carImage,
                carBrand: req.body.carBrand,
                seats: Number(req.body.seats),
                price: Number(req.body.price),
                description: req.body.description,
            }
        }
        res.render('edit', ctx);

    }
});

module.exports = router;