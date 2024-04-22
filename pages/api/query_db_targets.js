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
        const cellLineTarget = input['cellLineTarget']
        const cellLineName = input['cellLineName']

        console.log(cellLineName, cellLineTarget)

        var result = [];

        
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
        var cellLineRes = null;
        const dbName = 'CCLE_transcriptomics'
        if (cellLineTarget) {
            cellLineRes = await prisma.$queryRaw `
                select 
                    s.*, 
                    d.depmap_id
                from 
                    screen_cell_lines_vectorized(${input_data}::jsonb, ${dbName}, ${cellLineName}) as s
                left join 
                    depmap_cell_line_mapping as d
                on 
                split_part(s.cell_line, ' - ', 2) = d.cell_line;
            `
            console.log(cellLineName)
            if (cellLineName != 'All') {
                cellLineRes = cellLineRes.filter(x => x.cell_line.split(' - ')[0] === cellLineName).slice(0, 20)
            } else {
                cellLineRes = cellLineRes.slice(0, 20)
            }
        }

        console.log(cellLineRes)

        res.status(200).json({result, cellLineRes});
    }
}



