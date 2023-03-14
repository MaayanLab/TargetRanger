import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { useState, useEffect } from 'react';
import styles from '../styles/TargetScreener.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import CellLineResultTable from '../components/cellLineResultsTable';
import { useRouter } from 'next/router';
import { useRuntimeConfig } from '../components/runtimeConfig';
import { Button } from '@mui/material';

export default function Results() {
  // Recieve results and relevant gene stats from user submission
  const router = useRouter()
  const runtimeConfig = useRuntimeConfig()
  const string_res = router.query['res']
  const fname = router.query['fileName'] + '-' + router.query['precomputedBackground']
  // Set state of membrane gene filter based on submission page
  var results;

  try {
    results = JSON.parse(string_res);
  } catch {
    results = null;
  }
  

  // Try to display results --> on reload direct them back to the Target Screener page
  if (results) {
    // Use membraneGene state to determine filter
    
    return (

      <div style={{ position: 'relative', minHeight: '100vh' }}>

        <Head />

        <div className={styles.mainDiv}>

          <Header />
          <div className={styles.textDiv}><h2>TargetRanger Cell Line Results</h2></div>
            <div style={{width: '60%', textAlign: 'center'}}>The TargetRanger pipeline compares the RNA-seq expression data you uploaded to data from CCLE or ARCHS4 cell line expression to identify the most correlated cell lines based upon the 250 most variable genes. </div>
          

          <CellLineResultTable results={string_res} fname={fname}/>

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