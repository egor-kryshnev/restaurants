import { Restaurant } from '../models/restaurants';
import { Router, Request, Response } from 'express';
import { IRestaurant } from './restaurant.interface';
import { Error } from 'mongoose';

export const RestaurantRouter: Router = Router();

RestaurantRouter.get('/', async (req: Request, res: Response) => {
    const restaurants = await Restaurant.find(req.query).exec();
    res.status(200).send(restaurants);
});

RestaurantRouter.post('/', (req: Request, res: Response) => {
    const newRestaurant = new Restaurant(req.body);
    newRestaurant.save((err: any, product: any) => {
        if (err) {
            res.status(400).send({ action: "error", erorr: err });
        } else {
            res.status(200).send({ action: "create" });
        }
    })
});

