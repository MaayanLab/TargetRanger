
import conversionDict from '../../public/files/conversion_dict.json'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100mb' // Set desired value here
        }
    }
}

function stddev(arr) {
    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + parseFloat(curr)
    }, 0) / arr.length

    // Assigning (value - mean) ^ 2 to every array item
    arr = arr.map((k) => {
        return (k - mean) ** 2
    })

    // Calculating the sum of updated array
    let sum = arr.reduce((acc, curr) => acc + curr, 0);

    // Calculating the variance
    let variance = sum / arr.length

    let std = Math.sqrt(variance)
    // Returning the standard deviation
    return [mean, std]
}



export default async function handler(req, res) {
    var level = true;
    var result = {};

    const calcFileStats = (rows, level) => {
        var n = rows[0].length - 1
        var geneCounts = {}
        var geneStats = {}
        var gene;
        var data;
        var stats;
        for (let i = 1; i < rows.length; i++) {
            gene = rows[i].slice(0, 1)[0]
            data = rows[i].slice(1, rows.legnth)
            stats = stddev(data)
            if (stats[0] !== null && (stats[1] != 0 && stats[0] != 0) && gene != '') {
                if (gene.includes('.')) {
                    gene = gene.split('.')[0]
                }
                if (level) {
                    var convertedSymbol = conversionDict[gene] || gene;
                    geneStats[convertedSymbol] = { 'std': stats[1], 'mean': stats[0] };
                    geneCounts[convertedSymbol] = data.map(x => parseInt(x));
                } else {
                    geneStats[gene] = { 'std': stats[1], 'mean': stats[0] };
                    geneCounts[gene] = data.map(x => parseInt(x));
                }
            }
        }
        if (level) {
            result =  {stats: {'genes': geneStats, 'n': n }, counts: geneCounts}
        } else {
            result = {stats: { 'transcripts': geneStats, 'n': n }, counts: geneCounts}
        }
    }


    if (req.method === 'POST') {
        
        const text = req.body.text;
        if (req.body.level != null) {
            level = req.body.level;
        }

        if (text != null) {
            var rows = text.split(/\r?\n/)
            console.log('recieved text')
            if (text[1].includes(',')) {
                rows = rows.map(row => row.split(',').map(col => /^"?(.*?)"?$/.exec(col)[1]))
            } else {
                rows = rows.map(row => row.split('\t'))
            }
            console.log('sending to calcFileStats')
            calcFileStats(rows, level)
        }
        res.status(200).json(result);

    }
}