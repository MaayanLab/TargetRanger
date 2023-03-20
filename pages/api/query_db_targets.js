const { Prisma } = require("@prisma/client");
import prisma from '../../prisma/prisma';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb' // Set desired value here
        }
    }
}

export default async function handler(req, res) {

    if (req.method === 'POST') {
        
        const input = req.body;

        const input_data = input['inputData']

        const bg = input['bg']
        
        let result = await prisma.$queryRaw
        `
            select gene, t, p, adj_p, log2fc
            from screen_targets_vectorized(
            ${input_data}::jsonb,
            (
                select database.id
                from database
                where database.dbname = ${bg}
                limit 1
            )
            )
            where p < 0.05
            order by t desc;
        `

        res.status(200).json(result);
    }
}



