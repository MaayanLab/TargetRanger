import * as React from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import membrane_protiens from "../public/files/membrane_protiens.json";
import secreted from "../public/files/secretome.json";
import styles from "../styles/TargetScreener.module.css";
import { useState } from "react";
import { Button, Image, Tooltip } from "@mui/material";
import { useRuntimeConfig } from "./runtimeConfig";

export default function TargetResultTable(props) {
  const runtimeConfig = useRuntimeConfig();

  var results = JSON.parse(props.results);
  const filt = props.filt;
  const setFilt = props.setFilt;
  const setGene = props.setgene;
  const setTranscript = props.settranscript;
  const fname = props.fname;
  const transcript_level = props.transcript_level;
  var columns = [];

  if (transcript_level) {
    columns = [
      { field: "transcript", headerName: "Target", minWidth: 200, flex: 1 },
      { field: "gene", headerName: "gene symbol", minWidth: 100, flex: 1 },
      {
        field: "t",
        headerName: "t statistic",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "p",
        headerName: "P-value",
        type: "number",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "adj_p",
        headerName: "Adj. P-value",
        type: "number",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "log2fc",
        headerName: "log2 Fold Change",
        type: "number",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "membrane",
        headerName: "Membrane Protien",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "secreted",
        headerName: "Secreted Protien",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "antibody",
        headerName: "Antibody",
        sortable: false,
        flex: 1,
        minWidth: 80,
        renderCell: (params) => {
          const onClickAntibodypedia = (e) => {
            e.stopPropagation(); // don't select this row after clicking
            window.open(
              `https://www.antibodypedia.com/explore/${params.row.gene}`, "_blank", "noreferrer"
            )
          }
          return (
            <div
              className={styles.horizontalFlexbox}
              style={{ gap: "0px", padding: "0px" }}
            >
              <Tooltip title="Open in antibodypedia">
                <Button onClick={onClickAntibodypedia}>
                  <img
                    style={{
                      width: "20px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/antibodypedia.png"
                    }
                    alt="antibodypedia Logo"
                  />
                </Button>
              </Tooltip>
              </div>)
        }
      },
      {
        field: "action",
        headerName: "Links",
        sortable: false,
        flex: 1,
        minWidth: 320,
        renderCell: (params) => {
          const onClickENSEMBL = (e) => {
            e.stopPropagation(); // don't select this row after clicking
            window.open(
              `https://useast.ensembl.org/Homo_sapiens/Transcript/Summary?t=${params.row.transcript}`,
              "_blank",
              "noreferrer"
            );
          };
          const onClickARCHS4 = (e) => {
            e.stopPropagation(); // don't select this row after clicking
            window.open(
              `https://maayanlab.cloud/archs4/gene/${params.row.gene}`,
              "_blank",
              "noreferrer"
            );
          };
          const onClickHARMONIZOME = (e) => {
            e.stopPropagation();

            window.open(
              `https://maayanlab.cloud/Harmonizome/gene/${params.row.gene}`
            );
          };
          const onClickGDLPA = (e) => {
            e.stopPropagation();

            window.open(
              `https://cfde-gene-pages.cloud/gene/${params.row.gene}?CF=false&PS=true&Ag=true&gene=false&variant=false`,
              "_blank",
              "noreferrer"
            );
          };

          const onClickPrismEXP = (e) => {
            e.stopPropagation();

            window.open(
              `https://maayanlab.cloud/prismexp/g/${params.row.gene}`,
              "_blank",
              "noreferrer"
            );
          };

          return (
            <div
              className={styles.horizontalFlexbox}
              style={{ gap: "0px", padding: "0px" }}
            >
              <Tooltip title="Open in Ensembl">
                <Button onClick={onClickENSEMBL}>
                  <img
                    style={{
                      width: "20px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/ensembl.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in ARCHS4">
                <Button onClick={onClickARCHS4}>
                  <img
                    style={{
                      width: "40px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/archs4.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in Harmonizome">
                <Button onClick={onClickHARMONIZOME}>
                  <img
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/harmonizomelogo.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in PrismEXP">
                <Button onClick={onClickPrismEXP}>
                  <img
                    sx={{ m: 1 }}
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/PrismEXP.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in GDLPA">
                <Button onClick={onClickGDLPA}>
                  <img
                    sx={{ m: 1 }}
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GDLPA.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
            </div>
          );
        },
      },
    ];
  } else {
    columns = [
      { field: "gene", headerName: "Target", minWidth: 100, flex: 1 },
      {
        field: "t",
        headerName: "t statistic",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "p",
        headerName: "P-value",
        type: "number",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "adj_p",
        headerName: "Adj. P-value",
        type: "number",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "log2fc",
        headerName: "log2 Fold Change",
        type: "number",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "membrane",
        headerName: "Membrane Protien",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "secreted",
        headerName: "Secreted Protien",
        type: "number",
        flex: 1,
        minWidth: 150,
      },
      {
        field: "antibody",
        headerName: "Antibody",
        sortable: false,
        flex: 1,
        minWidth: 80,
        renderCell: (params) => {
          const onClickAntibodypedia = (e) => {
            e.stopPropagation(); // don't select this row after clicking
            window.open(
              `https://www.antibodypedia.com/explore/${params.row.gene}`, "_blank", "noreferrer"
            )
          }
          return (
            <div
              className={styles.horizontalFlexbox}
              style={{ gap: "0px", padding: "0px" }}
            >
              <Tooltip title="Open in antibodypedia">
                <Button onClick={onClickAntibodypedia}>
                  <img
                    style={{
                      width: "20px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/antibodypedia.png"
                    }
                    alt="antibodypedia Logo"
                  />
                </Button>
              </Tooltip>
              </div>
          )
        }
      },
      {
        field: "action",
        headerName: "Links",
        sortable: false,
        flex: 1,
        minWidth: 265,
        renderCell: (params) => {
          

          const onClickARCHS4 = (e) => {
            e.stopPropagation(); // don't select this row after clicking

            window.open(
              `https://maayanlab.cloud/archs4/gene/${params.row.gene}`,
              "_blank",
              "noreferrer"
            );
          };
          const onClickHARMONIZOME = (e) => {
            e.stopPropagation();

            window.open(
              `https://maayanlab.cloud/Harmonizome/gene/${params.row.gene}`
            );
          };
          const onClickGDLPA = (e) => {
            e.stopPropagation();

            window.open(
              `https://cfde-gene-pages.cloud/gene/${params.row.gene}?CF=false&PS=true&Ag=true&gene=false&variant=false`,
              "_blank",
              "noreferrer"
            );
          };

          const onClickPrismEXP = (e) => {
            e.stopPropagation();

            window.open(
              `https://maayanlab.cloud/prismexp/g/${params.row.gene}`,
              "_blank",
              "noreferrer"
            );
          };

          return (
            <div
              className={styles.horizontalFlexbox}
              style={{ gap: "0px", padding: "0px" }}
            >
              <Tooltip title="Open in ARCHS4">
                <Button onClick={onClickARCHS4}>
                  <img
                    style={{
                      width: "40px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/archs4.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in Harmonizome">
                <Button onClick={onClickHARMONIZOME}>
                  <img
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/harmonizomelogo.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in PrismEXP">
                <Button onClick={onClickPrismEXP}>
                  <img
                    sx={{ m: 1 }}
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                      "/images/PrismEXP.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="Open in GDLPA">
                <Button onClick={onClickGDLPA}>
                  <img
                    sx={{ m: 1 }}
                    style={{
                      width: "23px",
                      display: "flex",
                      flexDirection: "row",
                      gap: "0px",
                      padding: "0px",
                      marginLeft: "0px",
                    }}
                    src={
                      runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/GDLPA.png"
                    }
                    alt="archs4 Logo"
                  />
                </Button>
              </Tooltip>
            </div>
          );
        },
      },
    ];
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ fileName: fname }}
          color="secondary"
        />
      </GridToolbarContainer>
    );
  }

  for (let i = 0; i < results.length; i++) {
    results[i]["id"] = i;
    results[i]["membrane"] = membrane_protiens.includes(results[i]["gene"]);
    results[i]["secreted"] = secreted.includes(results[i]["gene"]);
    results[i]["t"] = Number(results[i]["t"]).toFixed(2);
    var pval = results[i]["p"];
    if (pval < 0.001) {
      results[i]["p"] = Number.parseFloat(pval).toExponential(4);
    } else {
      results[i]["p"] = Number.parseFloat(pval).toFixed(4);
    }
    var pval = results[i]["adj_p"];
    if (pval < 0.001) {
      results[i]["adj_p"] = Number.parseFloat(pval).toExponential(4);
    } else {
      results[i]["adj_p"] = Number.parseFloat(pval).toFixed(4);
    }
    results[i]["log2fc"] = Number.parseFloat(results[i]["log2fc"]).toFixed(2);
  }

  return (
    <div style={{ height: "500px", width: "80%" }}>
      <DataGrid
        rows={results}
        columns={columns}
        filterModel={filt}
        initialState={{
          sorting: {
            sortModel: [{ field: "t", sort: "desc" }],
          },
        }}
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: "secondary.light",
          "& .MuiDataGrid-cell:hover": {
            color: "secondary.main",
          },
          "& .MuiDataGrid-toolbarContainer": {
            color: "secondary.main",
          },
        }}
        onFilterModelChange={(newFilterModel) => setFilt(newFilterModel)}
        onSelectionModelChange={(newSelection) => {
          const selectedRowData = results.filter(
            (row) => newSelection.toString() == row.id.toString()
          );
          console.log(selectedRowData);
          setGene(selectedRowData[0]["gene"]);
          if (transcript_level) {
            setTranscript(selectedRowData[0]["transcript"]);
          }
        }}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
