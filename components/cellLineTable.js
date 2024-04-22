import * as React from "react";
import styles from '../styles/TargetScreener.module.css';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { Button, Tooltip } from "@mui/material";
import { useRuntimeConfig } from "./runtimeConfig";

export default function CellLineTable(props) {
  const runtimeConfig = useRuntimeConfig();

  var results = props.results;
  console.log(results)
  var columns = [
    { field: "cell_line", headerName: "Cell Line", minWidth: 200, flex: 1 },
    {
      field: "pcc",
      headerName: "Pearson Correlation Coefficient",
      type: "number",
      flex: 1,
      minWidth: 150,
    },
    {
        field: "action",
        headerName: "DepMap Link",
        type: "number",
        flex: 1,
        renderCell: (params) => {
            const onClickDepMap = (e) => {
              e.stopPropagation(); // don't select this row after clicking
              window.open(
                `https://depmap.org/portal/cell_line/${params.row.depmap_id}?tab=overview`,
                "_blank",
                "noreferrer"
              );
            };
            
  
            return (
              <div
                className={styles.horizontalFlexbox}
                style={{ gap: "0px", padding: "0px" }}
              >
                <Tooltip title="Open in DepMap">
                  <Button onClick={onClickDepMap}>
                    <img
                      style={{
                        width: "50px",
                        display: "flex",
                        flexDirection: "row",
                        gap: "0px",
                        padding: "0px",
                      }}
                      src={
                        runtimeConfig.NEXT_PUBLIC_ENTRYPOINT +
                        "/images/depmap.png"
                      }
                      alt="depmap Logo"
                    />
                  </Button>
                </Tooltip>
              </div>
            );
          },
        },
      ];


  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ fileName: "cell_line_corr" }}
          color="secondary"
        />
      </GridToolbarContainer>
    );
  }

  for (let i = 0; i < results.length; i++) {
    results[i]["id"] = i;
    results[i]["pcc"] = Number.parseFloat(results[i]["pcc"]).toFixed(4);
  }

  return (
    <div style={{ height: "300px", width: "34%" }}>
      <DataGrid
        rows={results}
        columns={columns}
        initialState={{
          sorting: {
            sortModel: [{ field: "pcc", sort: "desc" }],
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
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </div>
  );
}
