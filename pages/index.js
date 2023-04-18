import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import SideBar from '../components/sideBar';
import conversionDict from '../public/files/conversion_dict.json'
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRouter } from 'next/router';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import MenuIcon from '@mui/icons-material/Menu';
import { Alert } from '@mui/material';
import { Drawer, Link } from '@mui/material';
import { useRuntimeConfig } from '../components/runtimeConfig';
import { useCallback } from 'react';
import { IconButton, LinearProgress } from '@mui/material';


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

const databases = new Map([
    [0, 'ARCHS4'],
    [1, 'GTEx_transcriptomics'],
    [2, 'Tabula_Sapiens'],
    [3, 'ARCHS4_transcript'],
    [4, 'GTEx_transcript'],
]);



export default function Page() {
    const runtimeConfig = useRuntimeConfig()
    var fileReader = useRef(null);

    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);
    const [file, setFile] = React.useState(null);
    const [useDefaultFile, setUseDefaultFile] = React.useState(false);
    const [alert, setAlert] = React.useState('')
    const [fileName, setFileName] = React.useState('')
    const [level, setLevel] = React.useState(true)
    const [fileLoading, setFileLoading] = React.useState(false)

    const [membraneGenes, setMembraneGenes] = React.useState(true);
    const [secretedGenes, setSecretedGenes] = React.useState(false);

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

    const [drawerState, setDrawerState] = useState(false);

    const toggleDrawer = (open) => (event) => {
        setDrawerState(open);
    };

    const router = useRouter();

    const submitGeneStats = useCallback(async (fileStats, geneCounts) => {

        const bg = databases.get(precomputedBackground)

        var inputData = { 'inputData': fileStats, 'bg': bg }
        if (!level) {
            inputData['transcript'] = true;
        }
        console.log(inputData)
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
        if (level) {
            targets = json.map(item => item.gene)
            included = Object.keys(fileStats['genes'])
        } else {
            targets = json.map(item => item.transcript)
            included = Object.keys(fileStats['transcripts'])
        }
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
                transcript_level: !level,
            }
        };
        router.push(href, '/targetscreenerresults').then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false)
            alert('Error with returned data')
        })
    }, [runtimeConfig, precomputedBackground, membraneGenes, secretedGenes, alert, router, fileName, level])

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
            submitGeneStats({ 'genes': geneStats, 'n': n }, geneCounts)
        } else {
            submitGeneStats({ 'transcripts': geneStats, 'n': n }, geneCounts)
        }
    }, [submitGeneStats, level])


    const handleFileRead = useCallback((e) => {

        const content = fileReader.current.result;

        var rows = content.split(/\r?\n/)
        if (rows[1].includes(',')) {
            rows = rows.map(row => row.split(',').map(col => /^"?(.*?)"?$/.exec(col)[1]))
        } else {
            rows = rows.map(row => row.split('\t'))
        }
        calcFileStats(rows);
    }, [fileReader, calcFileStats]);


    const handleFileChosen = useCallback((file) => {
        fileReader.current = new FileReader();
        fileReader.current.onloadend = handleFileRead;
        fileReader.current.readAsText(file);
    }, [handleFileRead, fileReader]);


    const submitFile = useCallback(() => {
        if (useDefaultFile != false || file != null) {
            if (useDefaultFile) {
                setLoading(true);
                if (level) {
                    fetch(runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'Cancer/GSE49155-patient.tsv').then((r) => r.text())
                    .then(text => {
                        const rows = text.split('\n').map(row => row.split('\t'));
                        calcFileStats(rows);
                    });
                } else {
                    fetch(runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'Cancer/GSE49155-patient-transcript.tsv').then((r) => r.text())
                    .then(text => {
                        const rows = text.split('\n').map(row => row.split('\t'));
                        calcFileStats(rows);
                    });
                }
            } else {
                setLoading(true);
                handleFileChosen(file)
            }
        } else {
            setAlert(<Alert variant="outlined" severity="error">Please select a file to submit</Alert>)
            setTimeout(() => {
                setAlert('');
            }, 3000);
        }
    }, [file, handleFileChosen, submitGeneStats, useDefaultFile, level]);

    // For input file example table
    const rows = [
        { name: 'Gene Symbol/Ensembl ID', rep1: 0, rep2: 200, rep3: '...' },
        { name: 'Gene Symbol/Ensembl ID', rep1: 50, rep2: 89, rep3: '...' },
        { name: 'Gene Symbol/Ensembl ID', rep1: '...', rep2: '...', rep3: '...' },
    ];

    useEffect(() => {
        if (useDefaultFile) {
            setTimeout(() => {
                setFileLoading(false)
            }, 2500)
        }
        if (file) {
            setTimeout(() => {
                setFileLoading(false)
            }, 3000)
        }
    }, [fileLoading, file, useDefaultFile])

    // For MUI Popover

    const [anchorEl, setAnchorEl] = React.useState(null);

    return (

        <div style={{ position: 'relative', minHeight: '100vh' }}>
            <Head />

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress size="10rem" />
            </Backdrop>

            <div className={styles.mainDiv}>
                <Header />
                <Box className={styles.rowFlexbox}>
                    <div className={styles.sidePanel}>
                        <Box
                            sx={{ width: '375px', height: '100%' }}
                            className={styles.panel}
                        >
                            <SideBar database={precomputedBackground} setdatabase={setPrecomputedBackground} level={level} />
                        </Box>
                    </div>
                    <div className={styles.drawerButton}>
                        <Button onClick={toggleDrawer(!drawerState)}><MenuIcon color="secondary" style={{ transform: 'scale(2)', alignItems: 'start' }} /></Button>
                        <Drawer
                            anchor={'left'}
                            open={drawerState}
                            onClose={toggleDrawer(false)}
                        >
                            <Box
                                sx={{ width: '375px', height: '100%' }}
                                className={styles.drawer}
                            >
                                <SideBar database={precomputedBackground} setdatabase={setPrecomputedBackground} level={level} />
                            </Box>
                        </Drawer>
                    </div>
                    <div className={styles.verticalFlexbox}>
                        <Card >
                            <CardContent>
                                <div style={{ flexWrap: 'wrap', gap: '50px' }} className={styles.horizontalFlexbox}>

                                    <div className={styles.verticalFlexbox}>

                                        <div className={styles.horizontalFlexbox}>

                                            <div className={styles.verticalFlexbox}>
                                                <div>Upload RNA-seq profiles from the cells that you wish to target and remove</div>
                                                <div className={styles.verticalFlexboxNoGap}>
                                                    <div className={styles.verticalFlexboxNoGap}>
                                                        <div className={styles.horizontalFlexboxNoGap}>
                                                            <input
                                                                style={{ display: "none" }}
                                                                id="fileUpload"
                                                                type="file"
                                                                onChange={(e) => { setFileLoading(true); setUseDefaultFile(false); setFile(e.target.files[0]); setFileName((e.target.files[0].name).replace('.csv', '').replace('.tsv', '').replace('.txt', '')) }}
                                                            />
                                                            <label htmlFor="fileUpload">
                                                                <Button sx={{ backgroundColor: "#DCDCDC", borderRadius: '0%', height: '42px', color: '#666666', borderColor: 'lightgrey', width: '140px' }} variant="outlined" color="secondary" component="span">
                                                                    Choose File
                                                                </Button>
                                                            </label>
                                                            <Card variant="outlined" sx={{ backgroundColor: "#FAF9F6", borderRadius: '0%', height: '40px' }}>
                                                                <div style={{ margin: '10px' }} >
                                                                    <p style={{ textDecoration: 'none', fontSize: '16px', margin: '0px', marginTop: '5px', minWidth: '150px' }}>{file == null && useDefaultFile == false ? "" : useDefaultFile == true ? level ? "GSE49155-patient.tsv" : "GSE49155-patient-transcript.tsv" : file.name}</p>
                                                                </div>
                                                            </Card>
                                                        </div>
                                                        {fileLoading ? (<LinearProgress sx={{ margin: "2px" }} color='secondary'></LinearProgress>) : (<></>)}
                                                    </div>

                                                    <Button className={styles.darkOnHover} onClick={() => { setUseDefaultFile(true); setFileName('GSE49155-P4T'); setFileLoading(true) }} variant="text" color="secondary" endIcon={<UploadIcon />}>
                                                        Example
                                                    </Button>
                                                </div>
                                                <div className={styles.horizontalFlexbox}>
                                                    <Button variant="contained" color="secondary" onClick={submitFile}>
                                                        Rank Targets
                                                    </Button>
                                                    <Button onClick={() => { setUseDefaultFile(false); setFile(null); setFileName('') }} variant="outlined" component="span" color="secondary">
                                                        Clear
                                                    </Button>
                                                </div>
                                                <div className={styles.horizontalFlexboxNoGap}>

                                                    <a style={{ textDecoration: 'none', gap: '0px' }} href={level ? runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'Cancer/GSE49155-patient.tsv' : runtimeConfig.NEXT_PUBLIC_DOWNLOADS + 'Cancer/GSE49155-patient-transcript.tsv'} download={level ? "GSE49155-patient.tsv" : "GSE49155-patient-transcript.tsv"}>
                                                        <Button className={styles.darkOnHover} variant="text" color="secondary" endIcon={<DownloadIcon />}>
                                                            Example
                                                        </Button>
                                                    </a>
                                                    <IconButton className={styles.darkOnHover} onClick={(event) => { setAnchorEl(event.currentTarget) }} variant="text" color="secondary" size="small">
                                                        <HelpOutlineIcon />
                                                    </IconButton>

                                                    <Popover
                                                        open={Boolean(anchorEl)}
                                                        anchorEl={anchorEl}
                                                        onClose={() => { setAnchorEl(null) }}
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'center',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'center',
                                                        }}
                                                    >
                                                        <TableContainer component={Paper}>
                                                            <Typography
                                                                sx={{ textAlign: 'center' }}
                                                                variant="h6"
                                                            >
                                                                File should be a tsv/csv of the following form:
                                                            </Typography>
                                                            <Table sx={{ width: 500 }} size="small">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell></TableCell>
                                                                        <TableCell align="right"><b>Replicate 1</b></TableCell>
                                                                        <TableCell align="right"><b>Replicate 2</b></TableCell>
                                                                        <TableCell align="right"><b>...</b></TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {rows.map((row) => (
                                                                        <TableRow key={row.name}>
                                                                            <TableCell><b>{row.name}</b></TableCell>
                                                                            <TableCell align="right">{row.rep1}</TableCell>
                                                                            <TableCell align="right">{row.rep2}</TableCell>
                                                                            <TableCell align="right">{row.rep3}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Popover>
                                                </div>




                                            </div>
                                        </div>




                                    </div>

                                    <div style={{ alignItems: 'flex-start' }} className={styles.verticalFlexbox}>

                                    </div>

                                    <div className={styles.verticalFlexbox}>


                                        <div className={styles.verticalFlexbox}>
                                            <div>Normal tissue background:</div>
                                            <ToggleButtonGroup
                                                color="secondary"
                                                value={level}
                                                exclusive
                                                onChange={(event, newValue) => {
                                                    if (newValue !== null)
                                                        setLevel(newValue)
                                                    if (newValue)
                                                        setPrecomputedBackground(0)
                                                    else setPrecomputedBackground(3)
                                                }
                                                }
                                            >
                                                <ToggleButton value={true}>Gene</ToggleButton>
                                                <ToggleButton value={false}>Transcript</ToggleButton>
                                            </ToggleButtonGroup>

                                            <div className={styles.horizontalFlexbox}>
                                                {level ?
                                                    <Box sx={{ width: 390 }}>
                                                        <FormControl fullWidth>
                                                            <Select
                                                                color="secondary"
                                                                value={precomputedBackground}
                                                                onChange={(event) => setPrecomputedBackground(event.target.value)}
                                                            >
                                                                <MenuItem color="secondary" value={0}>ARCHS4 (bulk RNA-seq) - Gene</MenuItem>
                                                                <MenuItem color="secondary" value={1}>GTEx (bulk RNA-seq) - Gene</MenuItem>
                                                                <MenuItem color="secondary" value={2}>Tabula Sapiens (scRNA-seq) - Gene</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Box> :
                                                    <Box sx={{ width: 390 }}>
                                                        <FormControl fullWidth>
                                                            <Select
                                                                color="secondary"
                                                                value={precomputedBackground}
                                                                onChange={(event) => setPrecomputedBackground(event.target.value)}
                                                            >
                                                                <MenuItem color="secondary" value={3}>ARCHS4 (bulk RNA-seq) - Transcript</MenuItem>
                                                                <MenuItem color="secondary" value={4}>GTEx (bulk RNA-seq) - Transcript</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                }
                                            </div>
                                        </div>
                                        <div className={styles.horizontalFlexbox} style={{ justifyItems: 'left' }}>
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
                                        <div className={styles.horizontalFlexbox} style={{ justifyContent: 'left' }}>
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
                                    </div>
                                </div>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'center' }}>
                            </CardActions>
                            <>
                                {alert}
                            </>
                        </Card>

                        <Card sx={{ width: '100%' }}>
                            <CardContent>
                                Systematic target prioritization for TCGA subtypes with TargetRanger: <Link href='/tcga' sx={{ textDecoration: 'none', margin: '2%' }}><Button variant='outlined' color="secondary">Explore Subtypes</Button></Link>
                            </CardContent>

                        </Card>
                    </div>
                </Box>
                <Footer />
            </div >
        </div>
    )
}
