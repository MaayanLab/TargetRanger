import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/TCGA.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { Card, Autocomplete, TextField, Backdrop, CircularProgress, Box, FormControl, Select, MenuItem, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import {Tooltip, IconButton} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import datasets from '../public/files/tcga_datasets.json';
import coords from '../public/files/tcga_coordinates.json';
import cancer_map from '../public/files/cancer_type.json';
import TCGATable from '../components/tcgaTable';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import conversionDict from '../public/files/conversion_dict.json'
import { useRouter } from "next/router";
import { useRuntimeConfig } from '../components/runtimeConfig';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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


const Plot = dynamic(() => import('react-plotly.js'), {
    ssr: false,
});

const categories = Object.keys(datasets)



export default function Page() {
    const runtimeConfig = useRuntimeConfig()
    const [loading, setLoading] = React.useState(false);

    const [membraneGenes, setMembraneGenes] = React.useState(true);
    const [secretedGenes, setSecretedGenes] = React.useState(false);
    const [fileName, setFileName] = React.useState('')

    const [precomputedBackground, setPrecomputedBackground] = React.useState('ARCHS4');


    const router = useRouter();


    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const submitGeneStats = useCallback(async (fileStats, geneCounts) => {

        const bg = precomputedBackground

        var inputData = { 'inputData': fileStats, 'bg': bg }

        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/query_db_targets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData)
        })
        let json = await res.json();
        var targets = [];
        var included = [];
        targets = json.map(item => item.gene)
        included = Object.keys(fileStats['genes'])

        var targetStats = {}
        for (let i = 0; i < targets.length; i++) {
            if (included.includes(targets[i])) targetStats[targets[i]] = geneCounts[targets[i]]
        }
        setLoading(false)
        let href = {
            pathname: "/targetscreenerresults",
            query: {
                res: JSON.stringify(json),
                ogfile: JSON.stringify(targetStats),
                membraneGenes: membraneGenes,
                secretedGenes: secretedGenes,
                fileName: fileName,
                precomputedBackground: bg,
                transcript_level: false,
            }
        };
        router.push(href, '/targetscreenerresults').then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false)
        })
    }, [runtimeConfig, precomputedBackground, membraneGenes, secretedGenes, router, fileName])

    const calcFileStats = useCallback((rows) => {
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
                var convertedSymbol = conversionDict[gene] || gene;
                geneStats[convertedSymbol] = { 'std': stats[1], 'mean': stats[0] };
                geneCounts[convertedSymbol] = data.map(x => parseInt(x));
            }
        }
        submitGeneStats({ 'genes': geneStats, 'n': n }, geneCounts)
    }, [submitGeneStats])


    const onClickSubmit = (e) => {
        setLoading(true);
        fetch(runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'TCGA/' + fileName).then((r) => r.text())
            .then(text => {
                const rows = text.split('\n').map(row => row.split('\t'));
                calcFileStats(rows);
            });
        handleClose();
    }

    return (

        <div style={{ position: 'relative', minHeight: '100vh' }}>

            <Head />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10 }}
                open={loading}
            >
                <CircularProgress size="10rem" />
            </Backdrop>

            <div className={styles.mainDiv}>

                <div className={styles.upArrowButton}>
                    <Tooltip title="Return to Top" placement="left">
                        <IconButton onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }} color="secondary"> <ArrowUpwardIcon style={{ transform: 'scale(2)' }} /></IconButton>
                    </Tooltip>
                </div>

                <Header />
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle sx={{textAlign: 'center'}}>Submit to TargetRanger</DialogTitle>
                    <DialogContent>
                        <Box sx={{ width: 390, textAlign: 'center'}}>
                            <FormControl fullWidth>
                                <Select
                                    color="secondary"
                                    value={precomputedBackground}
                                    onChange={(event) => setPrecomputedBackground(event.target.value)}
                                >
                                    <MenuItem color="secondary" value={'ARCHS4'}>ARCHS4 (bulk RNA-seq)</MenuItem>
                                    <MenuItem color="secondary" value={'GTEx_transcriptomics'}>GTEx (bulk RNA-seq)</MenuItem>
                                    <MenuItem color="secondary" value={'Tabula_Sapiens'}>Tabula Sapiens (scRNA-seq)</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <div className={styles.horizontalFlexbox} style={{ justifyItems: 'center', margin: '3%' }}>
                            <ToggleButtonGroup
                                color="secondary"
                                value={membraneGenes}
                                exclusive
                                onChange={(event, newValue) => { if (newValue !== null) setMembraneGenes(newValue); if (newValue) setSecretedGenes(false) }}
                            >
                                <ToggleButton value={true}>Yes</ToggleButton>
                                <ToggleButton value={false}>No</ToggleButton>
                            </ToggleButtonGroup>
                            <div>Prioritize membrane genes</div>
                        </div>
                        <div className={styles.horizontalFlexbox} style={{ justifyContent: 'center', margin: '3%'}}>
                            <ToggleButtonGroup
                                color="secondary"
                                value={secretedGenes}
                                exclusive
                                onChange={(event, newValue) => { if (newValue !== null) setSecretedGenes(newValue); if (newValue) setMembraneGenes(false) }}
                            >
                                <ToggleButton value={true}>Yes</ToggleButton>
                                <ToggleButton value={false}>No</ToggleButton>
                            </ToggleButtonGroup>
                            <div>Prioritize secreted genes</div>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{justifyContent: 'center'}}>
                        <Button variant="contained" color="secondary" onClick={onClickSubmit}>Rank Targets with TargetRanger
                        </Button>

                    </DialogActions>
                </Dialog>
                <p>Explore clustered expression groupings from the pan-cancer RNA-seq data collected by the <a href='https://www.cancer.gov/ccg/research/genome-sequencing/tcga' target='_blank'>TCGA</a>. Seach for a specific cancer type below:</p>
                <Autocomplete
                    disablePortal
                    disableClearable
                    freeSolo={false}
                    value={''}
                    options={categories}
                    sx={{ width: 400 }}
                    color="secondary"
                    onChange={(event, value) => {
                        var elt = document.getElementById(value)
                        elt.scrollIntoView()

                    }}
                    renderInput={(params) => <TextField {...params} color="secondary" label="Type" />}
                />
                {categories.map((el) => {
                    const TCGA_link = 'https://portal.gdc.cancer.gov/projects/TCGA-' + el;
                    return (<> <div><h2>{cancer_map[el]} (<a href={TCGA_link} target="_blank" rel="noopener noreferrer">{el}</a>)</h2></div>
                        <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignItems: 'center', display: 'flex' }} id={el}>

                            <Card className={styles.card} key={el}>
                                <Plot
                                    data={coords[el]}
                                    layout={{
                                        title: '', yaxis: { automargin: true },
                                        showlegend: true,
                                    }}
                                    style={{ width: '50%', height: '100%' }}
                                    config={{ responsive: true }}
                                />
                                <TCGATable table={datasets[el]} fileName={fileName} setFileName={setFileName} handleClickOpen={handleClickOpen}/>
                                
                            </Card>
                        </div>
                    </>)
                })}

            </div>

            <Footer />

        </div>

    )
}

