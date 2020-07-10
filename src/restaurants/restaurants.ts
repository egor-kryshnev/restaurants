import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { RestaurantChain, IRestaurantChain } from '../models/restaurantChain.model'
import { Router, Request, Response } from 'express';
import { Error } from 'mongoose';
import { body, validationResult } from 'express-validator';
import moment from 'moment';
export const RestaurantRouter: Router = Router();

RestaurantRouter.get('/', async (req: Request, res: Response) => {
    const restaurants = await Restaurant.find(req.query).exec();
    res.send(restaurants);
});

RestaurantRouter.post('/',  [ body('rating').isFloat({ min: 1, max: 5 }) ], async (req: Request, res: Response) => {
    // const validationTimestamp = moment("qwewqe").isValid();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ action: "error", errors: errors.array() });
    }
    const restaurantExist = await Restaurant.exists({ restaurant_name: req.body.restaurant_name });
    if(!restaurantExist){
        try{
            let newRestaurant = new Restaurant(req.body);
            newRestaurant._id = req.body.restaurant_name;
            console.log(newRestaurant);
            
            const result = await newRestaurant.save();
            // console.log(result);     
            let restaurantChain = await setRestaurantChain(result);
            // console.log(await setRestaurantChain(result));
            res.status(200).send({ action: "create" });
        } catch (err) {
            //TODO: CHANGING STATUS CODE ERRORS AND JSON*****
            console.log('err' + err);
            res.status(500).send(err);
        }
    } else {
        //TODO: UPDATE*****
        const restaurant = await Restaurant.findOne({ restaurant_name: req.body.restaurant_name });
        if(restaurant){
            restaurant.restaurant_name = req.body.restaurant_name;
            restaurant.timestamp = req.body.timestamp;
            restaurant.rating = req.body.rating;
            restaurant.address = req.body.address;
            restaurant.is_deleted = req.body.is_deleted;
            if(restaurant.owner_name != req.body.owner_name){
                console.log(updateNewRestaurantChain(restaurant, req.body.owner_name));
                restaurant.owner_name = req.body.owner_name;
                let updatedRestaurant = await restaurant.save();
            } else {
                let updatedRestaurant = await restaurant.save();
                console.log(updateSameRestaurantChain(updatedRestaurant));
            }
            res.status(200).send({ action: "update" });
        }
        res.status(500).send({ error: 'error' });
    }
    

});

async function setRestaurantChain(restaurant: IRestaurant): Promise<IRestaurantChain> {
    const restaurantChain = await RestaurantChain.findOne({ owner: restaurant.owner_name }).exec();
    if(!restaurantChain) {
        let json = {
            timestamp: restaurant.timestamp,
            owner: restaurant.owner_name,
            rating: restaurant.rating,
            is_deleted: false,
            restaurants: [
                restaurant._id
            ]
        } as IRestaurantChain;
        let newRestaurantChain = new RestaurantChain(json);
        newRestaurantChain = await newRestaurantChain.save();
        console.log(newRestaurantChain);
        return newRestaurantChain;
    } else {
        console.log("exist");
        restaurantChain.timestamp = restaurant.timestamp;
        const oldRating = restaurantChain.rating;
        let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
        let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
        restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
        restaurantChain.restaurants.push(restaurant._id);
        let updatedRestaurantChain = await restaurantChain.save();
        console.log(updatedRestaurantChain);
        return updatedRestaurantChain;
    }
}

// async function updateRestaurantChain(restaurant: IRestaurant): Promise<IRestaurantChain> {
async function updateSameRestaurantChain(restaurant: IRestaurant): Promise<boolean> {
    const restaurantChain = await RestaurantChain.findOne({ owner: restaurant.owner_name }).exec();
    if(restaurantChain) {
        // if()
        restaurantChain.timestamp = restaurant.timestamp;
        let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
        let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
        restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
        let updatedRestaurantChain = await restaurantChain.save();
        console.log(updatedRestaurantChain);
        // return updatedRestaurantChain;
    } else {
       
    }
    return true;
}

async function updateNewRestaurantChain(restaurant: IRestaurant, newOwnerName: string): Promise<boolean> {
    const restaurantChain = await RestaurantChain.findOne({ owner: restaurant.owner_name }).exec();
    if(restaurantChain) {
        if(restaurantChain.restaurants.length < 2 || restaurantChain.restaurants.length == 1){
            console.log(await RestaurantChain.deleteOne({ owner: restaurant.owner_name }).exec());
        } else {
            let index = restaurantChain.restaurants.indexOf(restaurant._id);
            restaurantChain.restaurants.splice(index, 1);
            restaurantChain.timestamp = restaurant.timestamp;
            let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
            let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
            restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
            await restaurantChain.save();
        }
        restaurant.owner_name = newOwnerName;
        setRestaurantChain(restaurant);
        return true;
    }
    return false;
    // return new IRestaurantChain({});
}

