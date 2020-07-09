import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { getDbConnectionString } from './configDB';
import { RestaurantRouter } from './restaurants/restaurants';

// Create a new express app instance
const port = process.env.PORT || 3000;
const app: express.Application = express();

mongoose.connect(getDbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

app.use(bodyParser.json());

app.get("/", function (req: express.Request, res: express.Response) {
    res.send("Hello World!");
});

app.use('/restaurant', RestaurantRouter);

app.listen(port, function () {
    console.log(`App is listening on port ${port}!`);
});