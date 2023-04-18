import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

export default function PlotOrientation({ data, labels_x, labels_y, title, text, horizontal, genedata, transcript_level }) {

    const labels_length = (labels_x['x'].length * 25).toString() + 'px'
    const val_names = ['lowerfence', 'upperfence', 'mean', 'median', 'q1', 'q3', 'sd']
    var data_reverse = {}
    if  ('q1' in data) {
        data_reverse['type'] = 'box'
    } else {
        data_reverse['type'] = 'scatter'
        data_reverse['marker'] = {color: '#1f77b4'}
        data_reverse["mode"]= 'markers'
    }
    
    val_names.forEach((attr) => {
        if (attr in data) {
            data_reverse[attr] = data[attr].slice().reverse();
        }
    });

    var data_traces_reverse = [{
        ...data_reverse,
        ...labels_x,
        marker: {
            color: 'rgb(8,81,156)'
        }
    }];
    var data_traces = [
        {...data, 
        ...labels_y}
    ];

    

    if (!transcript_level && genedata) {
        if (horizontal) {
            data_traces_reverse.unshift({
                ...genedata,
                y: genedata.values.slice().reverse(),
                marker: {color: '#FF851B'},
            })
        } else {
            data_traces.push({
                ...genedata,
                x: genedata.values.slice().reverse()
            })
        }
    }

    

    console.log(data_traces_reverse)
    return (<>
    {horizontal ? 
    <>
        <div style={{ height: '750px', overflowX: 'scroll'}}>
        <Plot
            data={data_traces_reverse}
            layout={{
                title: {text: title, xanchor: 'left', yanchor: 'top', x: 0}, 
                xaxis: { automargin: true,
                        range: [-0.5, labels_x['x'].length + 1],
                        tickangle: 45 },
                yaxis: {
                    title: {
                        text: text
                    },
                    automargin: true,
                },
                showlegend: false

            }}
            style={{ width: labels_length, height: '100%' }}
            config={{ responsive: true }}
        />
    </div>
    </>: <> 
    <div style={{ height: labels_length }}>
        <Plot
            data={data_traces}
            layout={{
                title: title,
                yaxis: {
                    automargin: true,
                    range: [-0.5, labels_y['y'].length + 1]
                },
                xaxis: {
                    title: {
                        text: text
                    }
                },
                showlegend: false
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true }}
        />
    </div></>}
    </>
    )
}
