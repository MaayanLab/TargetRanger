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

        const databases = new Map([
            [0, 'ARCHS4_cell_lines'],
            [1, 'CCLE_transcriptomics']
        ]);

        const input_data = input['inputData']

        const bgNum = input['bg']
        const bg = databases.get(1)
        
        let result = await prisma.$queryRaw
        `
            select *
            from screen_cell_lines_vectorized(
            ${input_data}::jsonb, ${bg}
            )
            order by pcc desc;
        `

        res.status(200).json(result);
    }
}



