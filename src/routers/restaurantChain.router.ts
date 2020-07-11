import { Router, Request, Response } from 'express';
import { RestaurantChain } from '../models/restaurantChain.model'

export const RestaurantChainRouter: Router = Router();

RestaurantChainRouter.get('/', async (req: Request, res: Response) => {
    try{
        let findJson = {};
        
        if(req.query.restaurantName)
        {
            findJson = { restaurants: req.query.restaurantName };
        } else if (Object.keys(req.query).length > 0){
            res.status(500).send({ error: "Doesn't right parameters" });
            return;
        } 
        const restaurantChain = await RestaurantChain.find(findJson).exec();
        if(restaurantChain && restaurantChain.length != 0){
            // console.log(restaurantChain);
            res.send({ restaurantsChains: restaurantChain });
            return;
        } else {
            res.status(500).send({ error: "Restaurant is doesn't exist" });
            return;
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
        return;
    }
});