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
      { field: "transcript", headerName: "Target", minWidth: 150, flex: 1 },
      { field: "gene", headerName: "Gene Symbol", minWidth: 100, flex: 1 },
      {
        field: "t",
        headerName: "t stat",
        type: "number",
        flex: 1,
        minWidth: 70,
      },
      {
        field: "p",
        headerName: "P-value",
        type: "number",
        flex: 1,
        minWidth: 100,
      },
      {
        field: "adj_p",
        headerName: "Adj. P-value",
        type: "number",
        flex: 1,
        minWidth: 100,
      },
      {
        field: "log2fc",
        headerName: "log2FC",
        type: "number",
        flex: 1,
        minWidth: 70,
      },
      {
        field: "membrane",
        headerName: "Membrane Protien",
        type: "number",
        flex: 1,
        minWidth: 130,
      },
      {
        field: "secreted",
        headerName: "Secreted Protien",
        type: "number",
        flex: 1,
        minWidth: 130,
      }
    ];
  } else {
    columns = [
      { field: "gene", headerName: "Target", minWidth: 100, flex: 1 },
      {
        field: "t",
        headerName: "t stat",
        type: "number",
        flex: 1,
        minWidth: 40,
      },
      {
        field: "p",
        headerName: "P-value",
        type: "number",
        flex: 1,
        minWidth: 100,
      },
      {
        field: "adj_p",
        headerName: "Adj. P-value",
        type: "number",
        flex: 1,
        minWidth: 100,
      },
      {
        field: "log2fc",
        headerName: "log2FC",
        type: "number",
        flex: 1,
        minWidth: 75,
      },
      {
        field: "membrane",
        headerName: "Membrane",
        type: "number",
        flex: 1,
        minWidth: 130,
      },
      {
        field: "secreted",
        headerName: "Secreted",
        type: "number",
        flex: 1,
        minWidth: 80,
      }
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
    <div style={{ height: "500px", margin: "1.25rem" }}>
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
