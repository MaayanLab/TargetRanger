import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import { Autocomplete, TextField, Button } from '@mui/material';
import TargetResultTable from '../components/targetResultsTable';
import DbTabsViewer from '../components/dbTabsViewer';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useRouter } from 'next/router';
import { useRuntimeConfig } from '../components/runtimeConfig';
import { useCallback } from 'react';


// Setup possible filters
const filtMembranes = {items: [{ columnField: "membrane", operatorValue: "=", value: "1" }]};
const filtSecreted = {items: [{ columnField: "secreted", operatorValue: "=", value: "1" }]};
const filtEmpty = { items: [{ columnField: "t", operatorValue: ">", value: "0" }] }



export default function Results() {
  // Recieve results and relevant gene stats from user submission
  const router = useRouter()
  const runtimeConfig = useRuntimeConfig()
  const string_res = router.query['res']
  const string_stats = router.query['ogfile']
  const fname = router.query['fileName'] + '-' + router.query['precomputedBackground']
  // Set state of membrane gene filter based on submission page
  var initMembraneVal;
  var initSecretedVal;
  var results;

  try {
    initMembraneVal = JSON.parse(router.query['membraneGenes']);
    initSecretedVal = JSON.parse(router.query['secretedGenes']);
    results = JSON.parse(string_res);
  } catch {
    initMembraneVal = false;
    initSecretedVal = false;
    results = null;
  }
  const [membraneGenes, setMembraneGenes] = React.useState(initMembraneVal);

  // Set state of membrane gene filter based on submission page
  const [secretedGenes, setSecretedGenes] = React.useState(initSecretedVal);

  var initFilt;
  if (membraneGenes) {
    initFilt = filtMembranes
  } else if (secretedGenes) {
    initFilt = filtSecreted
  } else initFilt = filtEmpty

  const [filt, setFilt] = useState(initFilt)
  
  const [database, setDatabase] = useState(0)
  const [tabsData, setTabsData] = useState({ sorted_data: {}, NCBI_data: '' })

  // Get results list of differentially expressed genes and create array for autocomplete

  var geneList;
  if (!results) {
    geneList = ['']
  } else {
    geneList = results.map(x => x.gene)
  }
  const [gene, setGene] = useState(geneList[0])


  const fetchData = useCallback(async () => {
    let res = await fetch(`${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ''}/api/get_gene_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'gene': gene })
    })
    const json = await res.json()
    setTabsData(json)
  }, [runtimeConfig, gene, setTabsData]);

  useEffect(() => {
    // fetch data for given gene
    

    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, [gene, runtimeConfig, fetchData])


  useEffect(() => {
    // fetch data for given gene
  if (membraneGenes) {
      setFilt(filtMembranes)
    } else if (secretedGenes) {
      setFilt (filtSecreted)
    } else {
      setFilt(filtEmpty)
    }

  }, [membraneGenes, secretedGenes])

  // Try to display results --> on reload direct them back to the Target Screener page
  if (results) {
    // Use membraneGene state to determine filter
    

    return (

      <div style={{ position: 'relative', minHeight: '100vh' }}>

        <Head />

        <div className={styles.mainDiv}>

          <Header />
          <div className={styles.textDiv}>
            <h2>TargetRanger Results</h2>
            <p>The TargetRanger pipeline compares the RNA-seq expression data you uploaded to basal expression data from normal tissues and cell types to identifies genes that are highly-expressed in the input compared to the normal baseline using Welch&apos;s T-test. You can filter the ranked candidates by membrane or secretome only.</p>
          </div>

          <div className={styles.horizontalFlexbox}>
            <div style={{ width: '250px' }}>Prioritize membrane genes:</div>
            <ToggleButtonGroup
              color="secondary"
              value={membraneGenes}
              exclusive
              onChange={(event, newValue) => {if (newValue !== null) setMembraneGenes(newValue); if (newValue) setSecretedGenes(false)}}
            >
              <ToggleButton value={true}>YES</ToggleButton>
              <ToggleButton value={false}>NO</ToggleButton>
            </ToggleButtonGroup>
            <div style={{ width: '250px' }}>Prioritize secreted genes:</div>
            <ToggleButtonGroup
              color="secondary"
              value={secretedGenes}
              exclusive
              onChange={(event, newValue) => {if (newValue !== null) setSecretedGenes(newValue); if (newValue) setMembraneGenes(false)}}
            >
              <ToggleButton value={true}>YES</ToggleButton>
              <ToggleButton value={false}>NO</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <TargetResultTable results={string_res} membraneGenes={membraneGenes} filt={filt} setFilt={setFilt} setgene={setGene} fname={fname}/>
          <div className={styles.textDiv}>
            <p>View a box plot for each identified target gene in the table by clicking on the table row, or by selecting the gene from the dropdown box below:</p>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <Autocomplete
              disablePortal
              disableClearable
              freeSolo={false}
              value={''}
              options={geneList}
              sx={{ width: 400 }}
              color="secondary"
              onChange={(event, value) => { setGene(value) }}
              renderInput={(params) => <TextField {...params} color="secondary" label="Gene Symbol" />}
            />

          </div>
          <DbTabsViewer gene={gene} database={database} setdatabase={setDatabase} result={tabsData} geneStats={string_stats} />
          <Footer />
        </div>
      </div>
    )
  } else {
    return (
      <>
        <div style={{ position: 'relative', minHeight: '100vh' }}>

          <Head />

          <div className={styles.mainDiv}>
            <Header />
            <p>Error: No results found</p>
            <p>Please try resubmitting your data</p>
            <Button variant="contained" color="secondary" href="targetscreener">TargetRanger Upload</Button>
            <Footer />
          </div>
        </div>
      </>
    )
  }
}