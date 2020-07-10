import mongoose, { Schema, Document } from 'mongoose';
import { IRestaurant } from './restaurant.model'

export interface IRestaurantChain extends Document {
    timestamp: string,
    owner: string,
    rating: number,
    is_deleted: boolean,
    restaurants: IRestaurant['_id'][]
}

const RestaurantChainSchema = new Schema({
    timestamp: String,
    owner: { type: String, unique: true },
    rating: Number,
    is_deleted: Boolean,
    restaurants: [
        { type: String, ref: "restaurant" }
    ]

}
// , {
//     timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// });
);
RestaurantChainSchema.set("versionKey", false);

export const RestaurantChain = mongoose.model<IRestaurantChain>('restaurantChain', RestaurantChainSchema);