import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const session = await getSession();
    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}
