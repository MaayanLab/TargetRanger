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

        const transcript = input['transcript']

        var result = [];

        if (transcript) {

            result = await prisma.$queryRaw
            `
                with cte as (
                    select
                        row_number() over (order by t desc) as index,
                        transcript, gene, t, p, adj_p, log2fc
                    from screen_targets_transcript_vectorized(
                        ${input_data}::jsonb,
                        (
                            select database.id
                            from database
                            where database.dbname = ${bg}
                            limit 1
                        )
                    )
                    order by t desc
                ) select transcript, gene, t, p, adj_p, log2fc from cte
                where index < 100 or p < 0.05;
            `

        } else {
        
            result = await prisma.$queryRaw
            `
                with cte as (
                    select
                        row_number() over (order by t desc) as index,
                        gene, t, p, adj_p, log2fc
                    from screen_targets_vectorized(
                        ${input_data}::jsonb,
                        (
                            select database.id
                            from database
                            where database.dbname = ${bg}
                            limit 1
                        )
                    )
                    order by t desc
                ) select gene, t, p, adj_p, log2fc from cte
                where index < 100 or p < 0.05;
            `
        }

        res.status(200).json(result);
    }
}



