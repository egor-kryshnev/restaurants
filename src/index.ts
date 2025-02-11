import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { getDbConnectionString } from './configDB';
import { RestaurantRouter } from './routers/restaurants.router';
import { RestaurantChainRouter } from './routers/restaurantChain.router';


const port = process.env.PORT || 8080;
const app: express.Application = express();

mongoose.connect(getDbConnectionString, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

app.use(bodyParser.json());

app.use('/restaurant', RestaurantRouter);
app.use('/restaurantChain', RestaurantChainRouter);

app.listen(port, function () {
    console.log(`App is listening on port ${port}!`);
});