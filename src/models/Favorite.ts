import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IProduct } from './Product';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  productId: mongoose.Types.ObjectId | IProduct;
  addedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Составной индекс для предотвращения дублирования
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Индексы для оптимизации поиска
FavoriteSchema.index({ userId: 1 });
FavoriteSchema.index({ productId: 1 });
FavoriteSchema.index({ addedAt: -1 });

const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;