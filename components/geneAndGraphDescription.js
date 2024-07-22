import { Button, Menu, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import * as React from 'react';
import runtimeConfig from './runtimeConfig';
import styles from '../styles/GeneDescription.module.css';


function createCSV(gene, data, dbname) {
    var csvData = '';
    if (dbname == 'ARCHS4' || dbname == 'GTEx transcriptomics' || dbname == 'Tabula Sapiens' || dbname == 'GTEx proteomics') {
        csvData += ',,' + [...data.y].reverse().join(',') + '\n'
        csvData += `${gene},25%,` + [...data.q1].reverse().join(',') + '\n'
        csvData += `${gene},50%,` + [...data.median].reverse().join(',') + '\n'
        csvData += `${gene},75%,` + [...data.q3].reverse().join(',') + '\n'
        csvData += `${gene},mean,` + [...data.mean].reverse().join(',') + '\n'
        if (dbname != 'ARCHS4') {
            csvData += `${gene},std,` + [...data.sd].reverse().join(',') + '\n'
        }
        csvData += `${gene},min,` + [...data.lowerfence].reverse().join(',') + '\n'
        csvData += `${gene},max,` + [...data.upperfence].reverse().join(',') + '\n'
    } else {
        csvData += ',,' + [...data.y].reverse().join(',') + '\n'
        csvData += `${gene},value,` + [...data.x].reverse().join(',')
    }
    return csvData;
}

function GeneAndGraphDescription({ NCBI_data, transcript, gene, database, database_desc, data, horizontal, setHorizontal }) {

    // Gene links
    let Ensembl_link = 'https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?t=' + transcript;
    let NCBI_entrez = 'https://www.ncbi.nlm.nih.gov/gene/?term=' + gene;
    let GeneCards = 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + gene;
    let Harmonizome = 'https://maayanlab.cloud/Harmonizome/gene/' + gene;
    let ARCHS4_link = 'https://maayanlab.cloud/archs4/gene/' + gene;
    let GDLPA = 'https://cfde-gene-pages.cloud/gene/' + gene + '?CF=false&PS=true&Ag=true&gene=false&variant=false';
    let Antibodypedia =  `https://www.antibodypedia.com/explore/${gene}`
    let OpenTargets = `https://platform.opentargets.org/search?q=${gene}&page=1&entities=target`
    

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        
    };
    var dbname = database

    const formatCSV = () => {
        const csvData = createCSV(gene, data, dbname)
        var downloadLink = document.createElement("a");
        downloadLink.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
        downloadLink.download = `${gene}-${dbname}.csv`

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div style={{margin: "15px"}}>
            <div style={{ fontSize: "16px", textAlign: "justify"}}><p><b style={{fontWeight: "2000"}}>{gene}</b> short description (from <a href={NCBI_entrez} target="_blank" rel="noopener noreferrer">NCBI&apos;s Gene Database</a>):</p> {NCBI_data}</div>
            <br />
            <div><b>Gene pages on other sites:</b></div>
            <br />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginRight: "auto", marginLeft: "auto", justifyContent: "center" }}>
                
                <Tooltip title="Open in Ensembl">
                <a className={styles.geneLink} href={ARCHS4_link} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "60px"}} alt="Ensembl" src={"images/archs4.png"} />
                </a>
                </Tooltip>
                {transcript ?  <Tooltip title="Open in ARCHS4"><a className={styles.geneLink} href={Ensembl_link} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "20px"}} alt="ARCHS4" src={"images/ensembl.png"} />
                </a></Tooltip>: <></>}
                <Tooltip title="Open in Harmonizome">
                <a className={styles.geneLink} href={Harmonizome} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "25px"}} alt="Harmonizome" src={"images/harmonizomelogo.png"} />
                </a>
                </Tooltip>
                <Tooltip title="Open in Entrez Gene">
                <a className={styles.geneLink} href={NCBI_entrez} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "22px"}} alt="Entrez" src={"images/Entrez.png"} />
                </a>
                </Tooltip>
                <Tooltip title="Open in GDLPA (Gene and Drug Landing Page Aggregator)">
                <a className={styles.geneLink} href={GDLPA} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "20px"}} alt="GDLPA" src={"images/GDLPA.png"} />
                </a>
                </Tooltip>
                <Tooltip title="Open in Antibodypedia">
                <a className={styles.geneLink} href={Antibodypedia} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "20px"}} alt="Antibodypedia" src={"images/antibodypedia.png"} />
                </a>
                </Tooltip>
                <Tooltip title="Open in GeneCards">
                <a className={styles.geneLink} href={GeneCards} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "60px"}} alt="GeneCards" src={"images/genecards.png"} />
                </a>
                </Tooltip>
                <Tooltip title="Open in OpenTargets">
                <a className={styles.geneLink} href={OpenTargets} target="_blank" rel="noopener noreferrer">
                    <img style={{width: "80px"}} alt="OpenTargets" src={"images/opentargets.png"} />
                </a>
                </Tooltip>
            </div>
            <br />
        </div>
    );
}

export default GeneAndGraphDescription;

