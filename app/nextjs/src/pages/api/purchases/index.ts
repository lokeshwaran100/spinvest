import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/mongodb';
import { Purchase, IPurchase } from '../../../models/Purchase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const purchases: IPurchase[] = await Purchase.find({});
                res.status(200).json({ success: true, data: purchases });
            } catch (error) {
                res.status(400).json({ success: false });
            }
            break;
        case 'POST':
            try {
                const purchase: IPurchase = await Purchase.create(req.body);
                res.status(201).json({ success: true, data: purchase });
            } catch (error) {
                console.log("req.body", req.body)
                console.log("error", error)
                res.status(400).json({ success: false });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}
