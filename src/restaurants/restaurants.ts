import { Restaurant } from '../models/restaurants';
import { Router, Request, Response } from 'express';
import { IRestaurant } from './restaurant.interface';
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
        const newRestaurant = new Restaurant(req.body);
        newRestaurant.save((err: any, product: any) => {
            if (err) {
                res.status(422).send({ action: "error", erorrs: err });
            } else {
                res.status(200).send({ action: "create" });
            }
        })
    } else {
        res.status(200).send({ action: "update" });
    }
    

});

RestaurantRouter.put('/', (req: Request, res: Response) => {
    // await Restaurant.updateOne().exec();
});

