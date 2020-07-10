import { Restaurant, IRestaurant } from '../models/restaurant.model';
import { RestaurantChain, IRestaurantChain } from '../models/restaurantChain.model'
import { Router, Request, Response } from 'express';
// import { IRestaurant } from '../restaurants/restaurant.interface';
import { Error } from 'mongoose';
import { body, validationResult } from 'express-validator';
import moment from 'moment';

export const RestaurantChainRouter: Router = Router();

RestaurantChainRouter.get('/', async (req: Request, res: Response) => {
    try{
        const restaurantChain = await RestaurantChain.find({ restaurants:  req.query.restaurantName }).exec();
        if(restaurantChain && restaurantChain.length != 0){
            console.log(restaurantChain);
            res.send(restaurantChain);
        } else {
            res.status(500).send({ error: "Restaurant is doesn't exist" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

RestaurantChainRouter.get('/check', async (req, res) => {
    try{
        let numberr: number = Number(req.query.number);
        console.log(numberr);
        var tryy: String = numberr.toFixed(1);
        
        let objArr: { number: number }[] = [ { number: 1.2 }, { number: 1.3 }, { number: 1.4 } ];
        let check = objArr.reduce((a: number, b) => { return a + b.number; }, 0);
        console.log(check);


        res.status(200).send({ number: Number(tryy) });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// function round(value, decimals) {
//     return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
// }