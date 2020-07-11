import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { RestaurantChain, IRestaurantChain } from '../models/restaurantChain.model'
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
export const RestaurantRouter: Router = Router();


RestaurantRouter.post('/',  [ body('restaurant_name').notEmpty(), body('owner_name').notEmpty(), body('timestamp').notEmpty(), body('rating').notEmpty(), body('address').notEmpty(), body('is_deleted').notEmpty() , body('rating').isFloat({ min: 1, max: 5 }) ], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(500).json({ action: "error", errors: errors.array()});
    }
    const restaurantExist = await Restaurant.exists({ restaurant_name: req.body.restaurant_name });
    if(!restaurantExist){
        try{
            let newRestaurant = new Restaurant(req.body);
            newRestaurant._id = req.body.restaurant_name;
            
            const result = await newRestaurant.save();
            let restaurantChain = await setRestaurantChain(result);
            if(restaurantChain) {
                res.status(200).send({ action: "create" });
            } else {
                res.status(200).send({ action: "error", errors: "error with create"});
            }
        } catch (error) {
            console.log('error' + error);
            res.status(500).send(error);
        }
    } else {
        try {
            const restaurant = await Restaurant.findOne({ restaurant_name: req.body.restaurant_name });
            if(restaurant){
                restaurant.restaurant_name = req.body.restaurant_name;
                restaurant.timestamp = req.body.timestamp;
                restaurant.rating = req.body.rating;
                restaurant.address = req.body.address;
                restaurant.is_deleted = req.body.is_deleted;
                if(restaurant.owner_name != req.body.owner_name){
                    let updatedRestaurantChain = updateNewRestaurantChain(restaurant, req.body.owner_name);
                    if(updatedRestaurantChain) {
                        restaurant.owner_name = req.body.owner_name;
                        let updatedRestaurant = await restaurant.save();
                        res.status(200).send({ action: "update" });
                    } else {
                        res.status(200).send({ action: "error", errors: "error with update"});
                    }
                    
                } else {
                    let updatedRestaurant = await restaurant.save();
                    let updatedRestaurantChain = updateSameRestaurantChain(updatedRestaurant);
                    if(updatedRestaurantChain) {
                        res.status(200).send({ action: "update" });
                    } else {
                        res.status(200).send({ action: "error", errors: "error with update"});
                    }
                }
            } else {
                res.status(500).send({ error: 'error' });
            }
        } catch (error) {
            console.log('err' + error);
            res.status(500).send(error);
        }
        
    }
    

});

async function setRestaurantChain(restaurant: IRestaurant): Promise<boolean> {
    try {
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
            if(newRestaurantChain) {
                return true;
            } else {
                return false;
            }
        } else {
            restaurantChain.timestamp = restaurant.timestamp;
            const oldRating = restaurantChain.rating;
            let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
            let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
            restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
            restaurantChain.restaurants.push(restaurant._id);
            let updatedRestaurantChain = await restaurantChain.save();
            if(updatedRestaurantChain) {
                return true;
            } else {
                return false;
            }
        }
    } catch (error) {
        console.log('error' + error);
        return false;
    }
}

async function updateSameRestaurantChain(restaurant: IRestaurant): Promise<boolean> {
    try{
        const restaurantChain = await RestaurantChain.findOne({ owner: restaurant.owner_name }).exec();
        if(restaurantChain) {
            restaurantChain.timestamp = restaurant.timestamp;
            let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
            let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
            restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
            let updatedRestaurantChain = await restaurantChain.save();
            if(updatedRestaurantChain) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        console.log('error' + error);
        return false;
    }
    
}

async function updateNewRestaurantChain(restaurant: IRestaurant, newOwnerName: string): Promise<boolean> {
    try {
        const restaurantChain = await RestaurantChain.findOne({ owner: restaurant.owner_name }).exec();
        if(restaurantChain) {
            if(restaurantChain.restaurants.length < 2){
                const deletee = await RestaurantChain.deleteOne({ _id: restaurantChain._id });
            } else {
                let index = restaurantChain.restaurants.indexOf(restaurant._id);
                restaurantChain.restaurants.splice(index, 1);
                restaurantChain.timestamp = restaurant.timestamp;
                let ratingsOfRestaurants = await Restaurant.find({ owner_name: restaurantChain.owner }, 'rating -_id');
                let sumOfRatings = ratingsOfRestaurants.reduce((a: number, b) => { return a + b.rating; }, 0);
                restaurantChain.rating = Number((sumOfRatings / ratingsOfRestaurants.length).toFixed(1));
                await restaurantChain.save();
            }
            //CHECK
            restaurant.owner_name = newOwnerName;
            let newRestaurantChain = await setRestaurantChain(restaurant);
            if (newRestaurantChain) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

