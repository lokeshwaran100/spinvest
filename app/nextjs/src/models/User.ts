import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    walletAddress: string;
    usdcStaked: number;
}

const UserSchema: Schema = new Schema({
    walletAddress: { type: String, required: true, unique: true },
    usdcStaked: { type: Number, required: true, default: 0 },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model('User', UserSchema);
