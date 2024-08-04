import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchase extends Document {
    userId: string;
    amount: number;
    timestamp: Date;
}

const PurchaseSchema: Schema = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
});

export const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
