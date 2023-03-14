import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import SideBar from '../components/sideBar';
import SideBarCellLine from '../components/sideBarCellLine';
import exampleData from '../public/files/GSE49155.json';
import exampleCounts from '../public/files/GSE49155-counts.json';
import conversionDict from '../public/files/conversion_dict.json'
import datasets from '../public/files/datasets.json'
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
import Popover from '@mui/material/Popover';
import Card from '@mui/material/Card';
import ListSubheader from '@mui/material/ListSubheader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import MenuIcon from '@mui/icons-material/Menu';
import { Alert } from '@mui/material';
import { Drawer } from '@mui/material';
import { useRuntimeConfig } from '../components/runtimeConfig';
import { useCallback } from 'react';


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`fullwidth-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}


TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `fullwidth-tabpanel-${index}`,
    };
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

const databases = new Map([
    [0, 'ARCHS4'],
    [1, 'GTEx_transcriptomics'],
    [2, 'Tabula_Sapiens'],
    [4, 'ARCHS4_cell_lines'],
    [5, 'CCLE_transcriptomics'],
]);



export default function Page() {
    const runtimeConfig = useRuntimeConfig()
    var fileReader = useRef(null);
    const [value, setValue] = React.useState(0);



    // For MUI loading icon

    const [loading, setLoading] = React.useState(false);
    const [file, setFile] = React.useState(null);
    const [useDefaultFile, setUseDefaultFile] = React.useState(false);
    const [useCannedFile, setuseCannedFile] = React.useState(false);
    const [alert, setAlert] = React.useState('')
    const [fileName, setFileName] = React.useState('')

    const [membraneGenes, setMembraneGenes] = React.useState(true);
    const [secretedGenes, setSecretedGenes] = React.useState(false);

    const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

    const handleChange = (event, newValue) => {
        if (newValue == 0) {
            setPrecomputedBackground(0);
        }
        if (newValue == 1) {
            setPrecomputedBackground(4);
        }

        setValue(newValue);
    };

    const [drawerState, setDrawerState] = useState(false);

    const toggleDrawer = (open) => (event) => {
        setDrawerState(open);
    };

    const router = useRouter();

    const submitGeneStats = useCallback(async (fileStats, geneCounts) => {



        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/query_db_targets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'inputData': fileStats, 'bg': precomputedBackground })
        })
        let json = await res.json();
        const genes = json.map(item => item.gene)
        const genesIncluded = Object.keys(fileStats['genes'])
        var targetStats = {}
        for (let i = 0; i < genes.length; i++) {
            if (genesIncluded.includes(genes[i])) targetStats[genes[i]] = geneCounts[genes[i]]
        }
        let href = {
            pathname: "/targetscreenerresults",
            query: {
                res: JSON.stringify(json),
                ogfile: JSON.stringify(targetStats),
                membraneGenes: membraneGenes,
                secretedGenes: secretedGenes,
                fileName: fileName,
                precomputedBackground: databases.get(precomputedBackground),
            }
        };
        router.push(href, '/targetscreenerresults').then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false)
            alert('Error with returned data')
        })
    }, [runtimeConfig, precomputedBackground, membraneGenes, secretedGenes, alert, router, fileName])

    const submitGeneStatsCellLine = useCallback(async (fileStats) => {



        var items = Object.keys(fileStats['genes']).map(
            (key) => { return [key, fileStats['genes'][key]['std']] });

        items.sort(
            (first, second) => { return first[1] - second[1] }
        );

        var keys = items.map(
            (e) => { return e[0] });

        var genes_to_include = keys.slice(-250, -1)

        var final_dict = { "genes": {} }

        for (let i = 0; i < genes_to_include.length; i++) {
            final_dict["genes"][genes_to_include[i]] = fileStats["genes"][genes_to_include[i]]
        }

        let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/query_cell_lines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'inputData': final_dict, 'bg': precomputedBackground })
        })
        let json = await res.json();
        let href = {
            pathname: "/celllineresults",
            query: {
                res: JSON.stringify(json),
                fileName: fileName,
                precomputedBackground: databases.get(precomputedBackground),
            }
        };
        
        router.push(href, '/celllineresults').then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false)
            alert('Error with returned data')
        })
    }, [runtimeConfig, alert, router, fileName, precomputedBackground])

    const calcFileStats = useCallback((rows) => {
        var n = rows[0].length - 1
        var geneCounts = {}
        var geneStats = {}
        var gene;
        var data;
        var stats;
        for (let i = 1; i < rows.length; i++) {
            gene = rows[i].slice(0, 1)
            data = rows[i].slice(1, rows.legnth)
            stats = stddev(data)
            if (stats[0] !== null && (stats[1] != 0 && stats[0] != 0) && gene != '') {
                if (gene.includes('.')) {
                    gene = gene.split('.')[0]
                }
                var convertedSymbol = conversionDict[gene];
                geneStats[convertedSymbol] = { 'std': stats[1], 'mean': stats[0] };
                geneCounts[convertedSymbol] = data.map(x => parseInt(x));
            }
        }
        if (precomputedBackground < 4) {
            submitGeneStats({ 'genes': geneStats, 'n': n }, geneCounts)
        } else {
            submitGeneStatsCellLine({ 'genes': geneStats, 'n': n })
        }
    }, [submitGeneStats, submitGeneStatsCellLine, precomputedBackground])

    const handleFileRead = useCallback((e) => {

        const content = fileReader.current.result;

        var rows = content.split('\n')
        if (rows[1].includes(',')) {
            rows = rows.map(row => row.split(','))
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


    const submitFile = useCallback(async () => {
        if (useDefaultFile != false || file != null) {
            if (useDefaultFile) {
                setLoading(true);
                submitGeneStats(exampleData, exampleCounts)
            } else if (useCannedFile) {
                setLoading(true);
                fetch(runtimeConfig.NEXT_PUBLIC_DOWNLOADS + file.cat + '/' + file.filename).then((r) => r.text())
                    .then(text => {
                        const rows = text.split('\n').map(row => row.split('\t'));
                        calcFileStats(rows);
                    })
            }
            else {
                setLoading(true);
                handleFileChosen(file)
            }
        } else {
            setAlert(<Alert variant="outlined" severity="error">Please select a file to submit</Alert>)
            setTimeout(() => {
                setAlert('');
            }, 3000);
        }
    }, [file, runtimeConfig,  handleFileChosen, submitGeneStats, calcFileStats, useDefaultFile, useCannedFile]);


    const submitCellLine = useCallback(async () => {
        if (useDefaultFile != false || file != null) {
            if (useDefaultFile) {
                setLoading(true);
                submitGeneStatsCellLine(exampleData)
            } else if (useCannedFile) {
                setLoading(true);
                fetch(runtimeConfig.NEXT_PUBLIC_DOWNLOADS + file.cat + '/' + file.filename).then((r) => r.text())
                    .then(text => {
                        const rows = text.split('\n').map(row => row.split('\t'));
                        calcFileStats(rows);
                    })
            }
            else {
                setLoading(true);
                handleFileChosen(file)
            }
        } else {
            setAlert(<Alert variant="outlined" severity="error">Please select a file to submit</Alert>)
            setTimeout(() => {
                setAlert('');
            }, 3000);
        }
    }, [file, handleFileChosen, submitGeneStatsCellLine, calcFileStats, useDefaultFile, runtimeConfig, useCannedFile]);

    // For input file example table
    const rows = [
        { name: 'Gene Symbol/Ensembl ID', rep1: 0, rep2: 200, rep3: '...' },
        { name: 'Gene Symbol/Ensembl ID', rep1: 50, rep2: 89, rep3: '...' },
        { name: 'Gene Symbol/Ensembl ID', rep1: '...', rep2: '...', rep3: '...' },
    ];

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
                <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="fullwidth tabs example" variant="fullWidth">
                        <Tab label="Identify Highly Expressed Targets" {...a11yProps(0)} />
                        <Tab label="Identify Similar Cell Lines" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <Box className={styles.rowFlexbox}>
                        <div className={styles.sidePanel}>
                            <Box
                                sx={{ width: '375px', height: '100%' }}
                                className={styles.panel}
                            >
                                <SideBar database={precomputedBackground} setdatabase={setPrecomputedBackground} />
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
                                    <SideBar database={precomputedBackground} setdatabase={setPrecomputedBackground} />
                                </Box>
                            </Drawer>
                        </div>

                        <Card >
                            <CardContent>
                                <div style={{ flexWrap: 'wrap', gap: '50px' }} className={styles.horizontalFlexbox}>

                                    <div className={styles.verticalFlexbox}>
                                        <div className={styles.horizontalFlexbox}>

                                            <div className={styles.verticalFlexbox}>
                                                <div><p>Upload RNA-seq profiles from the cells that you wish to target and remove</p></div>
                                                <input
                                                    style={{ display: "none" }}
                                                    id="fileUpload"
                                                    type="file"
                                                    onChange={(e) => { setUseDefaultFile(false); setFile(e.target.files[0]); setFileName((e.target.files[0].name).replace('.csv', '').replace('.tsv', '').replace('.txt', '')) }}
                                                />
                                                <label htmlFor="fileUpload">
                                                    <Button variant="contained" color="secondary" component="span">
                                                        Upload File
                                                    </Button>
                                                </label>
                                                <div className={styles.horizontalFlexbox}>
                                                    <Button onClick={() => { setUseDefaultFile(true); setFileName('GSE49155-P4T') }} className={styles.darkOnHover} variant="text" color="secondary">
                                                        Load example file
                                                    </Button>
                                                    <a style={{ textDecoration: 'none' }} href="files/GSE49155_LSCC_P4T.tsv" download="GSE49155_LSCC_P4T.tsv">
                                                        <Button className={styles.darkOnHover} variant="text" color="secondary" endIcon={<DownloadIcon />}>
                                                            Download example file
                                                        </Button>
                                                    </a>
                                                </div>
                                                <Button className={styles.darkOnHover} onClick={(event) => { setAnchorEl(event.currentTarget) }} variant="text" color="secondary" endIcon={<HelpOutlineIcon />}>
                                                    File specifications
                                                </Button>
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
                                                            component={'span'}
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
                                        <div>Or choose an RNA-seq profile from a variety of collected studies</div>
                                        <Box sx={{ width: 390 }}>
                                            <FormControl fullWidth>
                                                <Select
                                                    color="secondary"
                                                    value={file}
                                                    onChange={(event) => {
                                                        setUseDefaultFile(false);
                                                        setFile(event.target.value);
                                                        setFileName(event.target.value.filename);
                                                        setuseCannedFile(true);
                                                    }}
                                                >
                                                    <ListSubheader>Senescence</ListSubheader>
                                                    {datasets.map(x => {
                                                        if (x.cat == 'Senescence') return <MenuItem color="secondary" value={x}>{x.filename} </MenuItem>
                                                    })}
                                                    <ListSubheader>TCGA</ListSubheader>
                                                    {datasets.map(x => {
                                                        if (x.cat == 'TCGA') return <MenuItem color="secondary" value={x}>{x.filename} </MenuItem>
                                                    })}

                                                </Select>
                                            </FormControl>
                                        </Box>


                                        <div>Chosen file:</div>
                                        <div>{file == null && useDefaultFile == false ? "None" : useDefaultFile == true ? "GSE49155-patient.tsv" : fileName}</div>
                                        <Button onClick={() => { setUseDefaultFile(false); setFile(null); setuseCannedFile(false); setFileName('') }} variant="outlined" component="span" color="secondary">
                                            Clear Chosen File
                                        </Button>

                                    </div>

                                    <div className={styles.verticalFlexbox}>

                                        <div className={styles.verticalFlexbox}>
                                            <div>Normal tissue background:</div>

                                            <div className={styles.horizontalFlexbox}>
                                                <Box sx={{ width: 390 }}>
                                                    <FormControl fullWidth>
                                                        <Select
                                                            color="secondary"
                                                            value={precomputedBackground}
                                                            onChange={(event) => setPrecomputedBackground(event.target.value)}
                                                        >
                                                            <MenuItem color="secondary" value={0}>ARCHS4 (bulk RNA-seq)</MenuItem>
                                                            <MenuItem color="secondary" value={1}>GTEx (bulk RNA-seq)</MenuItem>
                                                            <MenuItem color="secondary" value={2}>Tabula Sapiens (scRNA-seq)</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Box>
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
                                <Button style={{ marginTop: '25px' }} variant="contained" color="secondary" size='large' onClick={submitFile}>Submit</Button>
                            </CardActions>
                            <>
                                {alert}
                            </>
                        </Card>
                    </Box>
                </TabPanel>
                <TabPanel value={value} index={1}>
                <Box className={styles.rowFlexbox}>
                        <div className={styles.sidePanel}>
                            <Box
                                sx={{ width: '375px', height: '100%' }}
                                className={styles.panel}
                            >
                                <SideBarCellLine database={precomputedBackground} setdatabase={setPrecomputedBackground} />
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
                                    <SideBarCellLine database={precomputedBackground} setdatabase={setPrecomputedBackground} />
                                </Box>
                            </Drawer>
                        </div>

                        <Card >
                            <CardContent>
                                <div style={{ flexWrap: 'wrap', gap: '50px' }} className={styles.horizontalFlexbox}>

                                    <div className={styles.verticalFlexbox}>
                                        <div className={styles.horizontalFlexbox}>

                                            <div className={styles.verticalFlexbox}>
                                                <div>Upload RNA-seq profiles to identify similar cell lines</div>
                                                <input
                                                    style={{ display: "none" }}
                                                    id="fileUpload"
                                                    type="file"
                                                    onChange={(e) => { 
                                                        setUseDefaultFile(false); 
                                                        setFile(e.target.files[0]); 
                                                        setFileName((e.target.files[0].name).replace('.csv', '').replace('.tsv', '').replace('.txt', '')) 
                                                        if (precomputedBackground < 4) {
                                                            setPrecomputedBackground(4);
                                                        }
                                                    }}
                                                />
                                                <label htmlFor="fileUpload">
                                                    <Button variant="contained" color="secondary" component="span">
                                                        Upload File
                                                    </Button>
                                                </label>
                                                <div className={styles.horizontalFlexbox}>
                                                    <Button onClick={() => { setUseDefaultFile(true); setFileName('GSE49155-P4T');  }} className={styles.darkOnHover} variant="text" color="secondary">
                                                        Load example file
                                                    </Button>
                                                    <a style={{ textDecoration: 'none' }} href="files/GSE49155_LSCC_P4T.tsv" download="GSE49155_LSCC_P4T.tsv">
                                                        <Button className={styles.darkOnHover} variant="text" color="secondary" endIcon={<DownloadIcon />}>
                                                            Download example file
                                                        </Button>
                                                    </a>
                                                </div>
                                                <Button className={styles.darkOnHover} onClick={(event) => { setAnchorEl(event.currentTarget) }} variant="text" color="secondary" endIcon={<HelpOutlineIcon />}>
                                                    File specifications
                                                </Button>
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
                                                            component={'span'}
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
                                        <div>Chosen file:</div>
                                        <div>{file == null && useDefaultFile == false ? "None" : useDefaultFile == true ? "GSE49155-patient.tsv" : fileName}</div>
                                        <Button onClick={() => { setUseDefaultFile(false); setFile(null); setuseCannedFile(false) }} variant="outlined" component="span" color="secondary">
                                            Clear Chosen File
                                        </Button>

                                    </div>

                                    <div className={styles.verticalFlexbox}>
                                    <div>Or choose an RNA-seq profile from a variety of collected studies</div>
                                        <Box sx={{ width: 390 }}>
                                            <FormControl fullWidth>
                                                <Select
                                                    color="secondary"
                                                    value={file}
                                                    onChange={(event) => {
                                                        setUseDefaultFile(false);
                                                        setFile(event.target.value);
                                                        setFileName(event.target.value.filename);
                                                        setuseCannedFile(true);
                                                    }}
                                                >
                                                    <ListSubheader>Senescence</ListSubheader>
                                                    {datasets.map(x => {
                                                        if (x.cat == 'Senescence') return <MenuItem color="secondary" value={x}>{x.filename} </MenuItem>
                                                    })}
                                                    <ListSubheader>TCGA</ListSubheader>
                                                    {datasets.map(x => {
                                                        if (x.cat == 'TCGA') return <MenuItem color="secondary" value={x}>{x.filename} </MenuItem>
                                                    })}

                                                </Select>
                                            </FormControl>
                                        </Box>

                                        <div>Normal tissue background:</div>

                                        <div className={styles.horizontalFlexbox}>
                                            <Box sx={{ width: 390 }}>
                                                <FormControl fullWidth>
                                                    <Select
                                                        color="secondary"
                                                        value={precomputedBackground}
                                                        onChange={(event) => setPrecomputedBackground(event.target.value)}
                                                    >
                                                        <MenuItem color="secondary" value={4}>ARCHS4 Cell Lines (bulk RNA-seq)</MenuItem>
                                                        <MenuItem color="secondary" value={5}>CCLE Transcriptomics</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardActions style={{ justifyContent: 'center' }}>
                                <Button style={{ marginTop: '25px' }} variant="contained" color="secondary" size='large' onClick={submitCellLine}>Submit</Button>
                            </CardActions>
                            <>
                                {alert}
                            </>
                        </Card>
                    </Box>
                </TabPanel>

                <Footer />
            </div >
        </div >
    )
}
