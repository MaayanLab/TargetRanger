import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import React, { useState, useEffect } from "react";
import styles from "../styles/TargetScreener.module.css";
import Footer from "../components/footer";
import Header from "../components/header";
import Head from "../components/head";
import { Autocomplete, TextField, Button } from "@mui/material";
import TargetResultTable from "../components/targetResultsTable";
import DbTabsViewer from "../components/dbTabsViewer";
import DbTabsViewerTranscript from "../components/dbTabsViewerTranscript";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useRouter } from "next/router";
import { useRuntimeConfig } from "../components/runtimeConfig";
import { useCallback } from "react";
import membrane_protiens from "../public/files/membrane_protiens.json";
import GeneAndGraphDescription from "../components/geneAndGraphDescription";

// Setup possible filters
const filtMembranes = {
  items: [{ columnField: "membrane", operatorValue: "=", value: "1" }],
};
const filtSecreted = {
  items: [{ columnField: "secreted", operatorValue: "=", value: "1" }],
};
const filtEmpty = {
  items: [{ columnField: "t", operatorValue: ">=", value: "0" }],
};

const fetcher = (endpoint) => fetch(endpoint).then((res) => res.json());

export default function Results() {
  // Recieve results and relevant gene stats from user submission
  const router = useRouter();
  const runtimeConfig = useRuntimeConfig();
  const string_res = router.query["res"];
  const string_stats = router.query["ogfile"];
  const fname =
    router.query["fileName"] + "-" + router.query["precomputedBackground"];
  // Set state of membrane gene filter based on submission page
  var initMembraneVal;
  var initSecretedVal;
  var results;
  var transcript_level;
  var initGene = "";
  var initTranscript = "";

  try {
    initMembraneVal = JSON.parse(router.query["membraneGenes"]);
    initSecretedVal = JSON.parse(router.query["secretedGenes"]);
    transcript_level = JSON.parse(router.query["transcript_level"]);

    results = JSON.parse(string_res);
    initGene = results[0].gene;
    if (transcript_level) initTranscript = results[0].transcript;
  } catch {
    initMembraneVal = false;
    initSecretedVal = false;
    results = null;
    transcript_level = false;
  }
  const [membraneGenes, setMembraneGenes] = React.useState(initMembraneVal);
  // Set state of membrane gene filter based on submission page
  const [secretedGenes, setSecretedGenes] = React.useState(initSecretedVal);

  var initFilt;
  if (membraneGenes) {
    initFilt = filtMembranes;
  } else if (secretedGenes) {
    initFilt = filtSecreted;
  } else initFilt = filtEmpty;

  const [filt, setFilt] = useState(initFilt);

  const [database, setDatabase] = useState(0);
  const [tabsData, setTabsData] = useState({ sorted_data: {}, NCBI_data: "" });

  // Get results list of differentially expressed genes and create array for autocomplete

  var targetList;
  var geneFirst = "";
  var transcriptFirst = "";
  var targetMap = {};
  if (!results) {
    targetList = [""];
  } else {
    targetList = results.filter((x) => x.t > 0).map((x) => x.gene);
    if (transcript_level) {
      targetList = results.map((x) => x.transcript);
      results.map((x) => (targetMap[x.transcript] = x.gene));
      transcriptFirst = targetList[0];
      geneFirst = targetMap[transcriptFirst];
    } else {
      console.log(results);
      console.log(targetList);
      geneFirst = targetList[0];
      if (membraneGenes) {
        const membraneTargetList = targetList.filter((x) =>
          membrane_protiens.includes(x)
        );
        geneFirst = membraneTargetList[0];
      }
    }
  }

  const [gene, setGene] = useState(geneFirst);
  const [transcript, setTranscript] = useState(transcriptFirst);
  const [transcriptExpression, setTranscriptExpression] =
    useState(transcript_level);

  const fetchData = useCallback(async () => {
    if (transcriptExpression) {
      let res = await fetch(
        `${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ""}/api/get_transcript_info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gene: gene, transcript: transcript }),
        }
      );
      const json = await res.json();
      setTabsData(json);
    } else {
      let res = await fetch(
        `${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ""}/api/get_gene_info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gene: gene }),
        }
      );
      const json = await res.json();
      setTabsData(json);
    }
  }, [runtimeConfig, transcriptExpression, gene, transcript, setTabsData]);

  useEffect(() => {
    // call the function
    fetchData()
      // make sure to catch any error
      .catch(console.error);
  }, [gene, runtimeConfig, fetchData]);

  useEffect(() => {
    // fetch data for given gene
    if (membraneGenes) {
      setFilt(filtMembranes);
    } else if (secretedGenes) {
      setFilt(filtSecreted);
    } else {
      setFilt(filtEmpty);
    }
  }, [membraneGenes, secretedGenes]);

  // Try to display results --> on reload direct them back to the Target Screener page
  if (results != null) {
    // Use membraneGene state to determine filter

    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <Head />

        <div className={styles.mainDiv}>
          <Header />
          <div style={{ textAlign: "justify", width: "80%" }}>
            <p>
              The TargetRanger pipeline compares the RNA-seq expression data you
              uploaded to basal expression data from normal tissues and cell
              types to identifies genes that are highly-expressed in the input
              compared to the normal baseline using Welch&apos;s T-test. You can
              filter the ranked candidates by membrane or secretome only.
            </p>
          </div>
          <div className={styles.horizontalFlexbox} style={{ gap: "20px" }}>
            <Autocomplete
              disablePortal
              disableClearable
              freeSolo={false}
              value={""}
              options={targetList}
              sx={{ width: 400, marginTop: "15px" }}
              color="secondary"
              onChange={(event, value) => {
                if (transcript_level) {
                  setTranscript(value);
                  setGene(targetMap[value]);
                } else {
                  setGene(value);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} color="secondary" label="Target" />
              )}
            />

            <div style={{justifyContent: "center", textAlign: "center"}}>
              <div
                style={{
                  width: "240px",
                  marginBottom: "5px",
                }}
              >
                Prioritize membrane genes:
              </div>
              <ToggleButtonGroup
                color="secondary"
                value={membraneGenes}
                exclusive
                onChange={(event, newValue) => {
                  if (newValue !== null) setMembraneGenes(newValue);
                  if (newValue) setSecretedGenes(false);
                }}
              >
                <ToggleButton value={true}>YES</ToggleButton>
                <ToggleButton value={false}>NO</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div style={{justifyContent: "center", textAlign: "center"}}>
              <div
                style={{
                  width: "220px",
                  marginBottom: "5px"
                }}
              >
                Prioritize secreted genes:
              </div>
              <ToggleButtonGroup
                color="secondary"
                value={secretedGenes}
                exclusive
                onChange={(event, newValue) => {
                  if (newValue !== null) setSecretedGenes(newValue);
                  if (newValue) setMembraneGenes(false);
                }}
              >
                <ToggleButton value={true}>YES</ToggleButton>
                <ToggleButton value={false}>NO</ToggleButton>
              </ToggleButtonGroup>
            </div>
            <div className={styles.horizontalFlexbox}>
            {transcript_level ? (
              <div style={{ marginBottom: "10px", marginLeft: "30px" }}>
                <div style={{ marginBottom: "10px" }}>
                  View Expression of Target:
                </div>
                <ToggleButtonGroup
                  color="secondary"
                  value={transcriptExpression}
                  exclusive
                  onChange={(event, newValue) => {
                    if (newValue != null) {
                      setTranscriptExpression(newValue);
                      if (database ==  3 || database == 4) {
                        setDatabase(0);
                      }
                    }
                  }}
                >
                  <ToggleButton value={true}>Transcript</ToggleButton>
                  <ToggleButton value={false}>Gene</ToggleButton>
                </ToggleButtonGroup>
              </div>
            ) : (
              <></>
            )}
          </div>
          </div>
          <div className={styles.horizontalFlexbox}>
            <div style={{ width: "45rem" }}>
              <div className={styles.verticalFlexboxNoGap}>
                <TargetResultTable
                  results={string_res}
                  membraneGenes={membraneGenes}
                  filt={filt}
                  setFilt={setFilt}
                  setgene={setGene}
                  settranscript={setTranscript}
                  transcript_level={transcript_level}
                  fname={fname}
                />
                <GeneAndGraphDescription
                  NCBI_data={tabsData.NCBI_data}
                  gene={gene}
                  database={""}
                  database_desc={""}
                  data={""}
                  horizontal={true}
                  setHorizontal={() => console.log("")}
                />
              </div>
            </div>
            <div style={{ width: "45rem" }}>
              {transcriptExpression ? (
                <DbTabsViewerTranscript
                  transcript={transcript}
                  gene={gene}
                  database={database}
                  setdatabase={setDatabase}
                  result={tabsData}
                  transcriptStats={string_stats}
                  transcript_level={transcript_level}
                />
              ) : (
                <DbTabsViewer
                  gene={gene}
                  database={database}
                  setdatabase={setDatabase}
                  result={tabsData}
                  geneStats={string_stats}
                  transcript_level={transcript_level}
                />
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  } else {
    return (
      <>
        <div style={{ position: "relative", minHeight: "100vh" }}>
          <Head />

          <div className={styles.mainDiv}>
            <Header />
            <p>Error: No results found</p>
            <p>Please try resubmitting your data</p>
            <Button variant="contained" color="secondary" href="targetscreener">
              TargetRanger Upload
            </Button>
            <Footer />
          </div>
        </div>
      </>
    );
  }
}
