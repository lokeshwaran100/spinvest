import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/mongodb';
import { User, IUser } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const users: IUser[] = await User.find({});
                res.status(200).json({ success: true, data: users });
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        case 'POST':
            try {
                const user: IUser = await User.create(req.body);
                res.status(201).json({ success: true, data: user });
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
