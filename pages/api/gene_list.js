import prisma from '../../prisma/prisma';

export default async function handler(req, res) {

    if (req.method === 'POST') {

        const { input } = req.body;

        let genes = await prisma.$queryRaw`SELECT gene FROM gene WHERE LOWER(gene) LIKE LOWER(CONCAT(${input}, '%')) ORDER BY gene ASC LIMIT 8;`

        genes = genes.map(x => x.gene);

        res.status(200).json(genes);

    }
}