import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/TCGA.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import {Card, CardContent, Autocomplete, TextField} from '@mui/material';
import datasets from '../public/files/tcga_datasets.json';
import coords from '../public/files/tcga_coordinates.json';
import TCGATable from '../components/tcgaTable';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
	ssr: false,
});

const categories = Object.keys(datasets)



export default function Page() {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>
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
                        
                        return (<> <div><h2>{el}</h2></div>
                        <div style={{width: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', alignItems: 'center', display: 'flex' }} id={el}>
                           
                        <Card  className={styles.card} key={el}>
                            
                            <TCGATable table={datasets[el]}/>
                            <Plot
                                    data={coords[el]}
                                    layout={{
                                        title: '', yaxis: { automargin: true },
                                        showlegend: true,
                                    }}
                                    style={{ width: '50%', height: '100%' }}
                                    config={{ responsive: true }}
                            />
                        </Card>
                        </div>
                        </>)
                    })}

            </div>

            <Footer/>

        </div>
      
    )
  }

