
import { Box } from "@mui/system";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GeneAndGraphDescription from './geneAndGraphDescription';
import GraphMissing from './graphMissing';
import styles from '../styles/Main.module.css';
import PropTypes from 'prop-types';
import { Container} from '@mui/material';
import { useRuntimeConfig } from "./runtimeConfig";
import PlotOrientation from "./plotOrientation";
import { useState } from "react";


export default function DbTabsViewer(props) {
    const runtimeConfig = useRuntimeConfig()
    var database = props.database
    var setDatabase = props.setdatabase
    var result = props.result
    const geneStats = JSON.parse(props.geneStats)
    var gene = props.gene
    var transcript_level = props.transcript_level

    console.log(result)

    const [horizontal, setHorizontal] = useState(true)

    var gene_data = {
        type: 'box',
        values: geneStats[gene],
        name: 'input vector',
        boxmean: 'sd',
    }

    /* if (props.database == 0) {
        gene_data.values =  gene_data.values.map(x => Math.log2(x + 1))
    } */

    function TabPanel(props) {
        const {children, value, index, classes, ...other} = props;
    
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Container>
                        <Box>
                            {children}
                        </Box>
                    </Container>
                )}
            </div>
        );
    }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };


    let gtex_transcriptomics = null, archs4 = null, tabula_sapiens = null, hpm = null, hpa = null, gtex_proteomics = null, ccle_transcriptomics = null, ccle_proteomics = null, hubmap = null;
    let gtex_transcriptomics_names_x = [], gtex_transcriptomics_names_y = [], archs4_names_x = [], archs4_names_y = [], ts_names_y = [], ts_names_x = [], hubmap_names_x = [], hubmap_names_y = [];
    let hpm_names_x = [], hpm_names_y = [], hpa_names_x = [], hpa_names_y = [], gtex_proteomics_names_x = [], gtex_proteomics_names_y = [], ccle_transcriptomics_names_x = [], ccle_transcriptomics_names_y = [], ccle_prot_names_x = [], ccle_prot_names_y = [];

    if ('GTEx_transcriptomics' in result.sorted_data) {
        gtex_transcriptomics = result.sorted_data.GTEx_transcriptomics;
        gtex_transcriptomics_names_x = {"x": gtex_transcriptomics.names.slice().reverse(), orientation: 'v'}
        gtex_transcriptomics_names_y = {"y": gtex_transcriptomics.names, orientation: 'h'}
    }
    if ('ARCHS4' in result.sorted_data) {
        archs4 = result.sorted_data.ARCHS4;  
        archs4_names_x = {"x": archs4.names.slice().reverse(), orientation: 'v'}
        archs4_names_y = {"y": archs4.names, orientation: 'h'}
    } 
    if ('HuBMAP' in result.sorted_data) {
        hubmap = result.sorted_data.HuBMAP;  
        hubmap_names_x = {"x": hubmap.names.slice().reverse(), orientation: 'v'}
        hubmap_names_y = {"y": hubmap.names, orientation: 'h'}
    } 
    if ('Tabula_Sapiens' in result.sorted_data) {
        tabula_sapiens = result.sorted_data.Tabula_Sapiens;
        ts_names_x = {"x": tabula_sapiens.names.slice().reverse(), orientation: 'v'}
        ts_names_y = {"y": tabula_sapiens.names, orientation: 'h'}
    } 
    if ('HPM' in result.sorted_data) {
        hpm = result.sorted_data.HPM;
        hpm_names_x = {"x": hpm.names.slice().reverse(), "y": hpm.values.slice().reverse(), orientation: 'v'}
        hpm_names_y = {"y": hpm.names, "x": hpm.values, orientation: 'h'}
    } 
    if ('HPA' in result.sorted_data) {
        hpa = result.sorted_data.HPA;
        hpa_names_x = {"x": hpa.names.slice().reverse(), "y": hpa.values.slice().reverse(), orientation: 'v'}
        hpa_names_y = {"y": hpa.names, "x": hpa.values, orientation: 'h'}
    } 
    if ('GTEx_proteomics' in result.sorted_data) {
        gtex_proteomics = result.sorted_data.GTEx_proteomics;
        gtex_proteomics_names_x = {"x": gtex_proteomics.names.slice().reverse(), orientation: 'v'}
        gtex_proteomics_names_y = {"y": gtex_proteomics.names, orientation: 'h'}
    }
    if ('CCLE_transcriptomics' in result.sorted_data) {
        ccle_transcriptomics = result.sorted_data.CCLE_transcriptomics;
        ccle_transcriptomics_names_x = {"x": ccle_transcriptomics.names.slice().reverse(), "y": ccle_transcriptomics.values.slice().reverse(), orientation: 'v'}
        ccle_transcriptomics_names_y = {"y": ccle_transcriptomics.names, "x": ccle_transcriptomics.values, orientation: 'h'}
    }
    if ('CCLE_proteomics' in result.sorted_data) {
        ccle_proteomics =  result.sorted_data.CCLE_proteomics;
        ccle_prot_names_x = {"x": ccle_proteomics.names.slice().reverse(), "y": ccle_proteomics.values.slice().reverse(), orientation: 'v'}
        ccle_prot_names_y = {"y": ccle_proteomics.names, "x": ccle_proteomics.values, orientation: 'h'}
    }



    let ARCHS4_link = <a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">ARCHS4</a>;
    let GTEx_transcriptomics_link = <a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">GTEx transcriptomics</a>;
    let Tabula_Sapiens_link = <a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">Tabula Sapiens</a>;
    let CCLE_transcriptomics_link = <a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;
    let HPM_link = <a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">Human Proteome Map (HPM)</a>;
    let HPA_link = <a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">Human Protein Atlas (HPA)</a>;
    let GTEx_proteomics_link = <a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">GTEx proteomics</a>;
    let CCLE_proteomics_link = <a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">Cancer Cell Line Encyclopedia (CCLE)</a>;

    let ARCHS4_str = 'ARCHS4, developed by the Ma’ayan Lab, contains over 1 million samples of uniformly processed RNA-seq data from the Gene Expression Omnibus (GEO). The samples were aligned using kallisto with an efficient parallelized cloud workflow.';
    let GTEx_transcriptomics_str = 'GTEx transcriptomics provides bulk RNA-seq data for 54 human tissues collected from postmortem donors. The GTEx database was designed to study the relationship between genetic variation and gene expression across multiple human tissues.';
    let Tabula_Sapiens_str = 'Tabula Sapiens is a gene expression atlas created from single cell RNA-seq data collected from multiple tissues of 16 postmortem donors. The processed data contains average expression of each human gene in 486 cell types.';
    let CCLE_transcriptomics_str = 'The Cancer Cell Line Encyclopedia (CCLE) transcriptomics dataset contains gene expression data collected with RNA-seq from over 1000 human pan-cancer cell lines.';
    let HPM_str = 'The Human Proteome Map (HPM) contains data from LC-MS/MS proteomics profiling protein expression in 30 human tissues collected from 17 adult postmortem donors.';
    let HPA_str = 'The Human Protein Atlas (HPA) contains protein expression data from 44 normal human tissues derived from antibody-based protein profiling using immunohistochemistry.';
    let GTEx_proteomics_str = 'The GTEx proteomics dataset has relative protein levels for more than 12,000 proteins across 32 normal human tissues. The data was collected using tandem mass tag (TMT) proteomics to profile tissues collected from 14 postmortem donors.';
    let CCLE_proteomics_str = 'The Cancer Cell Line Encyclopedia (CCLE) proteomics dataset contains protein expression in 375 pan-cancer cell lines. Data was collected by quantitative multiplex mass spectrometry proteomics.';

    let ARCHS4_links = <><a href="https://maayanlab.cloud/archs4" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/29636450/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_transcriptomics_links = <><a href="https://gtexportal.org/home" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/23715323/" target="_blank" rel="noopener noreferrer">citation</a></>
    let Tabula_Sapiens_links = <><a href="https://tabula-sapiens-portal.ds.czbiohub.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/35549404/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_transcriptomics_links = <><a href="https://sites.broadinstitute.org/ccle/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/22460905/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPM_links = <><a href="http://www.humanproteomemap.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/24870542/" target="_blank" rel="noopener noreferrer">citation</a></>
    let HPA_links = <><a href="https://www.proteinatlas.org/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/25613900/" target="_blank" rel="noopener noreferrer">citation</a></>
    let GTEx_proteomics_links = <><a href="https://tsomics.shinyapps.io/RNA_vs_protein/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/32916130/" target="_blank" rel="noopener noreferrer">citation</a></>
    let CCLE_proteomics_links = <><a href="https://gygi.hms.harvard.edu/" target="_blank" rel="noopener noreferrer">website</a> | <a href="https://pubmed.ncbi.nlm.nih.gov/31978347/" target="_blank" rel="noopener noreferrer">citation</a></>

    let ARCHS4_desc_d = <>{ARCHS4_str} <span style={{whiteSpace: 'nowrap'}}>{ARCHS4_links}</span></>;
    let GTEx_transcriptomics_desc_d = <>{GTEx_transcriptomics_str} <span style={{whiteSpace: 'nowrap'}}>{GTEx_transcriptomics_links}</span></>;
    let Tabula_Sapiens_desc_d = <>{Tabula_Sapiens_str} <span style={{whiteSpace: 'nowrap'}}>{Tabula_Sapiens_links}</span></>;
    let CCLE_transcriptomics_desc_d = <>{CCLE_transcriptomics_str} <span style={{whiteSpace: 'nowrap'}}>{CCLE_transcriptomics_links}</span></>;
    let HPM_desc_d = <>{HPM_str} <span style={{whiteSpace: 'nowrap'}}>{HPM_links}</span></>;
    let HPA_desc_d = <>{HPA_str} <span style={{whiteSpace: 'nowrap'}}>{HPA_links}</span></>;
    let GTEx_proteomics_desc_d = <>{GTEx_proteomics_str} <span style={{whiteSpace: 'nowrap'}}>{GTEx_proteomics_links}</span></>;
    let CCLE_proteomics_desc_d = <>{CCLE_proteomics_str} <span style={{whiteSpace: 'nowrap'}}>{CCLE_proteomics_links}</span></>;

    let archs4_title = props.gene + ' Expression across ARCHS4 Cells & Tissues (RNA-seq)';
    let gtex_transcriptomics_title = props.gene + ' Expression across GTEx Tissues (RNA-seq)';
    let hubmap_title = props.gene + ' Expression across HuBMAP Cells (RNA-seq)';
    let tabula_sapiens_title = props.gene + ' Expression across Tabula Sapiens Cells (RNA-seq)';
    let hpm_title = props.gene + ' Protein Expression across HPM Cells & Tissues';
    let hpa_title = props.gene + ' Protein Expression across HPA Cells & Tissues';
    let gtex_proteomics_title = props.gene + ' Protein Expression across GTEx Tissues';
    let ccle_transcriptomics_title = props.gene + ' Expression across CCLE Cell Lines';
    let ccle_proteomics_title = props.gene + ' Protein Expression across CCLE Cell Lines';

    return (
    <div>
        <Box sx={{ margin: "1.25rem" }}>
            <Box className={styles.tabsBox}>
                <Tabs value={database} onChange={(event, newValue) => { setDatabase(newValue) }} aria-label="basic tabs example" variant="scrollable" scrollButtons={'auto'} centered>
                    {
                        (database == 0)
                            ?
                            <Tab value={0} icon={<img className={styles.tabLogo} alt="ARCHS4 logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                            :
                            <Tab value={0} icon={<img className={styles.grayTabLogo} alt="ARCHS4 logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/archs4.png"} />} />
                    }
                    {
                        (database == 1)
                            ?
                            <Tab value={1} icon={<img className={styles.tabLogo} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                            :
                            <Tab value={1} icon={<img className={styles.grayTabLogo} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_transcriptomics.png"} />} />
                    }
                    {
                        (database == 9)
                            ?
                            <Tab value={9} icon={<img className={styles.tabLogo} alt="HuBMAP logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/hubmap.png"} />} />
                            :
                            <Tab value={9} icon={<img className={styles.grayTabLogo} alt="HuBMAP logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/hubmap_grey.png"} />} />
                    }
                    {
                        (database == 2)
                            ?
                            <Tab value={2} icon={<img className={styles.tabLogo} alt="Tabula Sapiens logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} />} />
                            :
                            <Tab value={2} icon={<img className={styles.grayTabLogo} alt="Tabula Sapiens logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/tabula_sapiens.png"} />} />
                    }
                    {
                        (database == 3)
                            ?
                            <Tab value={3} icon={<img className={styles.tabLogo} alt="CCLE logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} />} />
                            :
                            <Tab value={3} icon={<img className={styles.grayTabLogo} alt="CCLE logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_transcriptomics.jpeg"} />} />
                    }
                    {
                        (database == 4)
                            ?
                            <Tab value={4} icon={<img className={styles.tabLogo} alt="HPM logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} />} />
                            :
                            <Tab value={4} icon={<img className={styles.grayTabLogo} alt="HPM logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPM.gif"} />} />
                    }
                    {
                        (database == 5)
                            ?
                            <Tab value={5} icon={<img className={styles.tabLogo} alt="HPA logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} />} />
                            :
                            <Tab value={5} icon={<img className={styles.grayTabLogo} alt="HPA logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/HPA.svg"} />} />
                    }
                    {
                        (database == 6)
                            ?
                            <Tab value={6} icon={<img className={styles.tabLogo} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} />} />
                            :
                            <Tab value={6} icon={<img className={styles.grayTabLogo} alt="GTEx logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GTEx_proteomics.png"} />} />
                    }
                    {
                        (database == 7)
                            ?
                            <Tab value={7} icon={<img className={styles.tabLogo} alt="CCLE logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} />} />
                            :
                            <Tab value={7} icon={<img className={styles.grayTabLogo} alt="CCLE logo" src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/CCLE_proteomics.jpeg"} />} />
                    }
                </Tabs>
            </Box>
            <TabPanel value={database} index={0}>
                {
                    archs4 != null
                        ?
                        <>
                           {/*  <h1 style={{ textAlign: 'center' }}>{props.gene}</h1> */}
                            {/* <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={ARCHS4_link} database_desc={ARCHS4_desc_d} data={archs4} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={archs4} labels_x={archs4_names_x} labels_y={archs4_names_y} title={archs4_title} text={'RNA Counts'} horizontal={horizontal} genedata={gene_data} transcript_level={transcript_level}/>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={1}>
                {
                    gtex_transcriptomics != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={GTEx_transcriptomics_link} database_desc={GTEx_transcriptomics_desc_d} data={gtex_transcriptomics} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={gtex_transcriptomics} labels_x={gtex_transcriptomics_names_x} labels_y={gtex_transcriptomics_names_y} title={gtex_transcriptomics_title} text={'RNA Counts'} horizontal={horizontal} genedata={gene_data} transcript_level={transcript_level}/>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={2}>
                {
                    tabula_sapiens != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={Tabula_Sapiens_link} database_desc={Tabula_Sapiens_desc_d} data={archs4} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={tabula_sapiens} labels_x={ts_names_x} labels_y={ts_names_y} title={tabula_sapiens_title} text={'RNA Counts'} horizontal={horizontal} genedata={gene_data} transcript_level={transcript_level}/>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={9}>
                {
                    hubmap != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={Tabula_Sapiens_link} database_desc={Tabula_Sapiens_desc_d} data={archs4} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={hubmap} labels_x={hubmap_names_x} labels_y={hubmap_names_y} title={hubmap_title} text={'RNA Counts'} horizontal={horizontal} genedata={gene_data} transcript_level={transcript_level}/>
                        </>

                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={3}>
                {
                    ccle_transcriptomics != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={CCLE_transcriptomics_link} database_desc={CCLE_transcriptomics_desc_d} data={ccle_transcriptomics} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={ccle_transcriptomics} labels_x={ccle_transcriptomics_names_x} labels_y={ccle_transcriptomics_names_y} title={ccle_transcriptomics_title} text={'TPM'} horizontal={horizontal} transcript_level={transcript_level}/>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={4}>
                {
                    hpm != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1> */}
                            {/* <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={HPM_link} database_desc={HPM_desc_d} data={hpm} horizontal={horizontal} setHorizontal={setHorizontal} /> */}
                            <PlotOrientation data={hpm} labels_x={hpm_names_x} labels_y={hpm_names_y} title={hpm_title} text={'Average Spectral Counts'} horizontal={horizontal} transcript_level={transcript_level}/>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={5}>
                {
                    hpa != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1> */}
                            {/* <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={HPA_link} database_desc={HPA_desc_d} data={hpa} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={hpa} labels_x={hpa_names_x} labels_y={hpa_names_y} title={hpa_title} text={'Tissue Expression Level'} horizontal={horizontal} transcript_level={transcript_level}/>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={6}>
                {
                    gtex_proteomics != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1>
                            <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={GTEx_proteomics_link} database_desc={GTEx_proteomics_desc_d} data={gtex_proteomics} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={gtex_proteomics} labels_x={gtex_proteomics_names_x} labels_y={gtex_proteomics_names_y} title={gtex_proteomics_title} text={'log2(relative abundance)'} horizontal={horizontal} transcript_level={transcript_level}/>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
            <TabPanel value={database} index={7}>
                {
                    ccle_proteomics != null
                        ?
                        <>
                            {/* <h1 style={{ textAlign: 'center' }}>{props.gene}</h1> */}
                            {/* <GeneAndGraphDescription NCBI_data={result.NCBI_data} gene={props.gene} database={CCLE_proteomics_link} database_desc={CCLE_proteomics_desc_d} data={ccle_proteomics} horizontal={horizontal} setHorizontal={setHorizontal}/> */}
                            <PlotOrientation data={ccle_proteomics} labels_x={ccle_prot_names_x} labels_y={ccle_prot_names_y} title={ccle_proteomics_title} text={'Normalized Protein Quantity'}  horizontal={horizontal}></PlotOrientation>
                        </>
                        :
                        <GraphMissing />
                }
            </TabPanel>
        </Box>
    </div>
    );
}