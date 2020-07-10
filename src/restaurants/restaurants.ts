import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { RestaurantChain, IRestaurantChain } from '../models/restaurantChain.model'
import { Router, Request, Response } from 'express';
// import { IRestaurant } from './restaurant.interface';
// import { IRestaurantChain } from './restaurantChain.interface';
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
        res.status(200).send({ action: "update" });
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
        // console.log(json);
        let newRestaurantChain = new RestaurantChain(json);
        newRestaurantChain = await newRestaurantChain.save();
        console.log(newRestaurantChain);
        return newRestaurantChain;
    } else {
        console.log("exist");
        restaurantChain.timestamp = restaurant.timestamp;
        const oldRating = restaurantChain.rating;
        restaurantChain.rating = (oldRating * restaurantChain.restaurants.length + restaurant.rating) / (restaurantChain.restaurants.length + 1);
        restaurantChain.restaurants.push(restaurant._id);
        // console.log(restaurantChain);
        let updatedRestaurantChain = await restaurantChain.save();
        console.log(updatedRestaurantChain);
        return updatedRestaurantChain;
    }
}

// RestaurantRouter.put('/', (req: Request, res: Response) => {
    // await Restaurant.updateOne().exec();
// });

