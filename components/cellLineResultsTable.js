import * as React from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import styles from '../styles/TargetScreener.module.css';
import { Button, Tooltip } from "@mui/material";
import { useRuntimeConfig } from "./runtimeConfig";
import depmap from '../public/files/depmap_dict.json';



export default function TargetResultTable(props) {
    const runtimeConfig = useRuntimeConfig()

    var results = JSON.parse(props.results);
    const fname = props.fname;

    const columns = [
        { field: "cell_line", headerName: "Cell line", minWidth: 200},
        { field: "pcc", headerName: "Pearson's Correlation Coeffecient", type: "number", minWidth: 300 },
        { field: "depmap_id", headerName: "DepMap Id", type: "String", minWidth: 200 },
        {
            field: "action",
            headerName: "Links",
            sortable: false,
            minWidth: 200,
            renderCell: (params) => {
              const onClickDepMap = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                window.open(`https://depmap.org/portal/cell_line/${params.id}`, '_blank', 'noreferrer');
              };
        
              return (
                <div className={styles.horizontalFlexbox} style={{gap: '0px', padding: '0px'}}>
                    <Tooltip title="Open in DepMap">
                        <Button onClick={onClickDepMap}><img style={{width: '40px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px'}} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/depmap.png"} alt="archs4 Logo"/></Button>
                    </Tooltip>
                </div>
              )
            }
          },
    ]


    function CustomToolbar() {
      return (
        <GridToolbarContainer>
          <GridToolbarExport printOptions={{ disableToolbarButton: true }} csvOptions={{fileName: fname}} color="secondary"/>
        </GridToolbarContainer>
      );
    }

    for (let i =0; i < results.length; i++) {
        results[i]['id'] = depmap[results[i]['cell_line']]
        results[i]['depmap_id'] = depmap[results[i]['cell_line']]
    }

    return (
        <div style={{ height: "500px", width: '50%', marginBottom: '2%'}}>
            <DataGrid
                rows={results}
                columns={columns}
                sx={{
                  boxShadow: 2,
                  border: 2,
                  borderColor: 'secondary.light',
                  '& .MuiDataGrid-cell:hover': {
                    color: 'secondary.main',
                  },
                  '& .MuiDataGrid-toolbarContainer': {
                    color: 'secondary.main',
                  },
                }}
                components={{
                  Toolbar: CustomToolbar,
                }}
               
            />
    </div>
  )
}
