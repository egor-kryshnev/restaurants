import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    restaurant_name: String,
    owner_name: String,
    timestamp: String,
    rating: Number,
    address: String,
    is_deleted: Boolean
}
// , {
//     timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
// });
);

export const Restaurant = mongoose.model('restaurant', RestaurantSchema);