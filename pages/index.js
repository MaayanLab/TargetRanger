import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "../styles/TargetScreener.module.css";
import Footer from "../components/footer";
import Header from "../components/header";
import Head from "../components/head";
import SideBar from "../components/sideBar";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useRouter } from "next/router";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import Popover from "@mui/material/Popover";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import MenuIcon from "@mui/icons-material/Menu";
import { Alert } from "@mui/material";
import { Drawer, Link } from "@mui/material";
import { useRuntimeConfig } from "../components/runtimeConfig";
import { IconButton, LinearProgress } from "@mui/material";

const databases = new Map([
  [0, "ARCHS4"],
  [1, "GTEx_transcriptomics"],
  [2, "Tabula_Sapiens"],
  [3, "ARCHS4_transcript"],
  [4, "GTEx_transcript"],
]);

export default function Page() {
  const runtimeConfig = useRuntimeConfig();

  // For MUI loading icon

  const [loading, setLoading] = React.useState(false);
  const [file, setFile] = React.useState(null);
  const [useDefaultFile, setUseDefaultFile] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [level, setLevel] = React.useState(true);
  const [fileLoading, setFileLoading] = React.useState(false);

  const [membraneGenes, setMembraneGenes] = React.useState(true);
  const [secretedGenes, setSecretedGenes] = React.useState(false);

  const [precomputedBackground, setPrecomputedBackground] = React.useState(0);

  const [drawerState, setDrawerState] = useState(false);

  const toggleDrawer = (open) => (event) => {
    setDrawerState(open);
  };

  const router = useRouter();

  var fileReader = useRef(null);

  const submitGeneStats = useCallback(
    async (fileStats, geneCounts) => {
      const bg = databases.get(precomputedBackground);

      var inputData = { inputData: fileStats, bg: bg };
      var res;
      res = await fetch(
        `${runtimeConfig.NEXT_PUBLIC_ENTRYPOINT || ""}/api/${
          level ? "query_db_targets" : "query_db_targets_transcript"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(inputData),
        }
      );

      let json = await res.json();

      var targets = [];
      var included = [];
      if (level) {
        targets = json.map((item) => item.gene);
        included = Object.keys(fileStats["genes"]);
      } else {
        targets = json.map((item) => item.transcript);
        included = Object.keys(fileStats["transcripts"]);
      }
      var targetStats = {};
      for (let i = 0; i < targets.length; i++) {
        if (included.includes(targets[i]))
          targetStats[targets[i]] = geneCounts[targets[i]];
      }
      setLoading(false);
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
        },
      };
      router
        .push(href, "/targetscreenerresults")
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          alert("Error with returned data");
        });
    },
    [
      runtimeConfig,
      precomputedBackground,
      membraneGenes,
      secretedGenes,
      alert,
      router,
      fileName,
      level,
    ]
  );

  const fetchDataset = useCallback(
    (endpoint) => {
      fetch(endpoint)
        .then((r) => r.text())
        .then(async (text) => {
          const r = await fetch(`/api/fileparse`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ level: level, text: text }),
          });
          const res = await r.json();
          submitGeneStats(res.stats, res.counts);
        });
    },
    [level, submitGeneStats]
  );

  const fetchFileStats = useCallback(
    async (text) => {
      const r = await fetch(`/api/fileparse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ level: level, text: text }),
      });
      const res = await r.json();
      submitGeneStats(res.stats, res.counts);
    },
    [level, submitGeneStats]
  );

  const handleFileRead = useCallback(() => {
    const content = fileReader.current.result;
    fetchFileStats(content);
  }, [fetchFileStats]);

  const handleFileChosen = useCallback(() => {
    fileReader.current = new FileReader();
    fileReader.current.onloadend = handleFileRead;
    fileReader.current.readAsText(file);
  }, [file, handleFileRead]);

  const submitFile = useCallback(async () => {
    if (useDefaultFile != false || file != null) {
      if (useDefaultFile) {
        setLoading(true);
        if (level) {
          fetchDataset(
            runtimeConfig.NEXT_PUBLIC_DOWNLOADS + "Cancer/GSE49155-patient.tsv"
          );
        } else {
          fetchDataset(
            runtimeConfig.NEXT_PUBLIC_DOWNLOADS +
              "Cancer/GSE49155-patient-transcript.tsv"
          );
        }
      } else {
        setLoading(true);
        handleFileChosen();
      }
    } else {
      setAlert(
        <Alert variant="outlined" severity="error">
          Please select a file to submit
        </Alert>
      );
      setTimeout(() => {
        setAlert("");
      }, 3000);
    }
  }, [
    file,
    useDefaultFile,
    level,
    runtimeConfig.NEXT_PUBLIC_DOWNLOADS,
    fetchDataset,
    handleFileChosen,
  ]);

  // For input file example table
  const rows = [
    { name: "Gene Symbol/Ensembl ID", rep1: 0, rep2: 200, rep3: "..." },
    { name: "Gene Symbol/Ensembl ID", rep1: 50, rep2: 89, rep3: "..." },
    { name: "Gene Symbol/Ensembl ID", rep1: "...", rep2: "...", rep3: "..." },
  ];

  useEffect(() => {
    if (useDefaultFile) {
      setTimeout(() => {
        setFileLoading(false);
      }, 2500);
    }
    if (file) {
      setTimeout(() => {
        setFileLoading(false);
      }, 3000);
    }
  }, [fileLoading, file, useDefaultFile]);

  // For MUI Popover

  const [anchorEl, setAnchorEl] = React.useState(null);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Head />

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress size="10rem" />
      </Backdrop>

      <div className={styles.mainDiv}>
        <Header />
        <Box
          className={styles.verticalFlexbox}
          sx={{ paddingBottom: "50px", paddingX: "50px" }}
        >
          <div className={styles.verticalFlexbox}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <div
                  style={{ flexWrap: "wrap" }}
                  className={styles.verticalFlexbox}
                >
                  <div className={styles.verticalFlexbox}>
                    <div className={styles.horizontalFlexbox}>
                      <div className={styles.verticalFlexbox}>
                        <div>
                          Upload RNA-seq profiles from the cells that you wish
                          to target and remove
                        </div>
                        <div className={styles.verticalFlexboxNoGap}>
                          <div className={styles.verticalFlexboxNoGap}>
                            <div className={styles.horizontalFlexboxNoGap}>
                              <input
                                style={{ display: "none" }}
                                id="fileUpload"
                                type="file"
                                onChange={(e) => {
                                  setFileLoading(true);
                                  setUseDefaultFile(false);
                                  setFile(e.target.files[0]);
                                  setFileName(
                                    e.target.files[0].name
                                      .replace(".csv", "")
                                      .replace(".tsv", "")
                                      .replace(".txt", "")
                                  );
                                }}
                              />
                              <label htmlFor="fileUpload">
                                <Button
                                  sx={{
                                    backgroundColor: "#DCDCDC",
                                    borderRadius: "0%",
                                    height: "42px",
                                    color: "#666666",
                                    borderColor: "lightgrey",
                                    width: "140px",
                                  }}
                                  variant="outlined"
                                  color="secondary"
                                  component="span"
                                >
                                  Choose File
                                </Button>
                              </label>
                              <Card
                                variant="outlined"
                                sx={{
                                  backgroundColor: "#FAF9F6",
                                  borderRadius: "0%",
                                  height: "40px",
                                }}
                              >
                                <div style={{ margin: "10px" }}>
                                  <p
                                    style={{
                                      textDecoration: "none",
                                      fontSize: "16px",
                                      margin: "0px",
                                      marginTop: "5px",
                                      minWidth: "150px",
                                    }}
                                  >
                                    {file == null && useDefaultFile == false
                                      ? ""
                                      : useDefaultFile == true
                                      ? level
                                        ? "GSE49155-patient.tsv"
                                        : "GSE49155-patient-transcript.tsv"
                                      : file.name}
                                  </p>
                                </div>
                              </Card>
                            </div>
                            {fileLoading ? (
                              <LinearProgress
                                sx={{ margin: "2px" }}
                                color="secondary"
                              ></LinearProgress>
                            ) : (
                              <></>
                            )}
                          </div>

                          <Button
                            className={styles.darkOnHover}
                            onClick={() => {
                              setUseDefaultFile(true);
                              setFileName("GSE49155-P4T");
                              setFileLoading(true);
                            }}
                            variant="text"
                            color="secondary"
                          >
                            Example <UploadIcon />
                          </Button>
                          <a
                            style={{
                              textDecoration: "none",
                              gap: "0px",
                              textAlign: "center",
                            }}
                            href={
                              level
                                ? runtimeConfig.NEXT_PUBLIC_DOWNLOADS +
                                  "Cancer/GSE49155-patient.tsv"
                                : runtimeConfig.NEXT_PUBLIC_DOWNLOADS +
                                  "Cancer/GSE49155-patient-transcript.tsv"
                            }
                            download={
                              level
                                ? "GSE49155-patient.tsv"
                                : "GSE49155-patient-transcript.tsv"
                            }
                          >
                            <Button
                              className={styles.darkOnHover}
                             
                              variant="text"
                              color="secondary"
                            >
                              {" "}
                              <DownloadIcon />
                            </Button>
                          </a>
                          <IconButton
                            className={styles.darkOnHover}
                            onClick={(event) => {
                              setAnchorEl(event.currentTarget);
                            }}
                            variant="text"
                            color="secondary"
                            size="small"
                          >
                            <HelpOutlineIcon />
                          </IconButton>

                          <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={() => {
                              setAnchorEl(null);
                            }}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "center",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "center",
                            }}
                          >
                            <TableContainer component={Paper}>
                              <Typography
                                sx={{ textAlign: "center" }}
                                variant="h6"
                              >
                                File should be a tsv/csv of the following form:
                              </Typography>
                              <Table sx={{ width: 500 }} size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell align="right">
                                      <b>Replicate 1</b>
                                    </TableCell>
                                    <TableCell align="right">
                                      <b>Replicate 2</b>
                                    </TableCell>
                                    <TableCell align="right">
                                      <b>...</b>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {rows.map((row) => (
                                    <TableRow key={row.name}>
                                      <TableCell>
                                        <b>{row.name}</b>
                                      </TableCell>
                                      <TableCell align="right">
                                        {row.rep1}
                                      </TableCell>
                                      <TableCell align="right">
                                        {row.rep2}
                                      </TableCell>
                                      <TableCell align="right">
                                        {row.rep3}
                                      </TableCell>
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

                  <div className={styles.verticalFlexbox}>
                    <div className={styles.verticalFlexbox}>
                      <div>Normal tissue background:</div>
                      <ToggleButtonGroup
                        color="secondary"
                        value={level}
                        exclusive
                        onChange={(event, newValue) => {
                          if (newValue !== null) setLevel(newValue);
                          if (newValue) setPrecomputedBackground(0);
                          else setPrecomputedBackground(3);
                        }}
                      >
                        <ToggleButton value={true}>Gene</ToggleButton>
                        <ToggleButton value={false}>Transcript</ToggleButton>
                      </ToggleButtonGroup>

                      <div className={styles.horizontalFlexbox}>
                        {level ? (
                          <Box sx={{ width: 390 }}>
                            <FormControl fullWidth>
                              <Select
                                color="secondary"
                                value={precomputedBackground}
                                onChange={(event) =>
                                  setPrecomputedBackground(event.target.value)
                                }
                              >
                                <MenuItem color="secondary" value={0}>
                                  ARCHS4 (bulk RNA-seq) - Gene
                                </MenuItem>
                                <MenuItem color="secondary" value={1}>
                                  GTEx (bulk RNA-seq) - Gene
                                </MenuItem>
                                <MenuItem color="secondary" value={2}>
                                  Tabula Sapiens (scRNA-seq) - Gene
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        ) : (
                          <Box sx={{ width: 390 }}>
                            <FormControl fullWidth>
                              <Select
                                color="secondary"
                                value={precomputedBackground}
                                onChange={(event) =>
                                  setPrecomputedBackground(event.target.value)
                                }
                              >
                                <MenuItem color="secondary" value={3}>
                                  ARCHS4 (bulk RNA-seq) - Transcript
                                </MenuItem>
                                <MenuItem color="secondary" value={4}>
                                  GTEx (bulk RNA-seq) - Transcript
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        )}
                      </div>
                    </div>
                    <div
                      className={styles.horizontalFlexbox}
                      style={{ justifyItems: "left" }}
                    >
                      <ToggleButtonGroup
                        color="secondary"
                        value={membraneGenes}
                        exclusive
                        onChange={(event, newValue) => {
                          if (newValue !== null) setMembraneGenes(newValue);
                          if (newValue) setSecretedGenes(false);
                        }}
                      >
                        <ToggleButton value={true}>Yes</ToggleButton>
                        <ToggleButton value={false}>No</ToggleButton>
                      </ToggleButtonGroup>
                      <div>Prioritize membrane genes</div>
                    </div>
                    <div
                      className={styles.horizontalFlexbox}
                      style={{ justifyContent: "left" }}
                    >
                      <ToggleButtonGroup
                        color="secondary"
                        value={secretedGenes}
                        exclusive
                        onChange={(event, newValue) => {
                          if (newValue !== null) setSecretedGenes(newValue);
                          if (newValue) setMembraneGenes(false);
                        }}
                      >
                        <ToggleButton value={true}>Yes</ToggleButton>
                        <ToggleButton value={false}>No</ToggleButton>
                      </ToggleButtonGroup>
                      <div>Prioritize secreted genes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardActions style={{ justifyContent: "center" }}>
                <div className={styles.horizontalFlexbox}>
                  <Button
                    sx={{fontSize: "1em", paddingX: '30px'}}
                    variant="contained"
                    color="secondary"
                    onClick={submitFile}
                  >
                    Submit
                  </Button>
                  <Button
                    onClick={() => {
                      setUseDefaultFile(false);
                      setFile(null);
                      setFileName("");
                    }}
                    variant="outlined"
                    component="span"
                    color="secondary"
                  >
                    Clear
                  </Button>
                </div>
              </CardActions>
              <>{alert}</>
            </Card>

            <Card sx={{ width: "100%" }}>
              <CardContent
                sx={{
                  display: "block",
                  textAlign: "center",
                  justifyItems: "center",
                }}
              >
                Systematic target prioritization for TCGA subtypes with
                TargetRanger:{" "}
                <Link href="/tcga" sx={{ textDecoration: "none" }}>
                  <Button variant="outlined" color="secondary">
                    Explore Subtypes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </Box>
        <Footer />
      </div>
    </div>
  );
}
