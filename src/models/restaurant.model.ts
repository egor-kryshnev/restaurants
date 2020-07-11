import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
    restaurant_name: string,
    owner_name: string,
    timestamp: string,
    rating: number,
    address: string,
    is_deleted: boolean
}

const RestaurantSchema = new Schema({
    _id: String,
    restaurant_name: { type: String, required: true, unique: true },
    owner_name: { type: String, required: true },
    timestamp: { type: String, required: true },
    rating: { type: Number, required: true },
    address: { type: String, required: true },
    is_deleted: { type: Boolean, required: true }
});
RestaurantSchema.set("versionKey", false);

export const Restaurant = mongoose.model<IRestaurant>('restaurant', RestaurantSchema);