import * as React from "react";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import styles from '../styles/TargetScreener.module.css';
import { useState } from "react";
import { Button, Tooltip, TextField } from "@mui/material";
import { useRuntimeConfig } from "./runtimeConfig";
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';


    
    

    
   




export default function TCGATable(props) {
    const runtimeConfig = useRuntimeConfig()
    const filename = props.fileName;
    const setFilename = props.setFileName;
    const handleClickOpen = props.handleClickOpen;

    
    

    var table = props.table;

    let columns = [
        { field: "cluster", headerName: "Cluster", minWidth: 60, flex: 1},
        { field: "n", headerName: "# Samples", type: "number", minWidth: 80, flex: 1 },
        { field: "mutations", headerName: "Common Mutations", type: "number", minWidth: 150, renderCell: (cellValues) => {
            const mutationString = Object.keys(cellValues.row.mutations).map(el => el + ': ' +cellValues.row.mutations[el].toString()).join(', ')
            const preview = `${mutationString.split(',')[0].split(' ')[0]}  (${mutationString.split(',')[0].split(' ')[2]})`
            console.log(mutationString)
            return (
                <Tooltip title={mutationString}>
                     <span style={{justifyItems: 'center', textAlign: 'center'}}>{preview}.. <PreviewIcon/></span>
                </Tooltip>
            )
        }
        },
        {
            field: "action",
            headerName: "",
            sortable: false,
            minWidth: 300,
            renderCell: (params) => {

            const onClickSubmit = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                handleClickOpen();
                setFilename(params.row.filename);
            };
            const onClickDownload = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                window.open(`${runtimeConfig.NEXT_PUBLIC_DOWNLOADS}TCGA/${params.row.filename}`);
            };
        
            return (
                <div className={styles.horizontalFlexbox} style={{gap: '0px', padding: '0px'}}>
                    <Tooltip title="Download">
                        <Button onClick={onClickDownload}><DownloadIcon color="secondary"></DownloadIcon></Button>
                    </Tooltip>
                    <Tooltip title="Analyze in TargetRanger">
                        <Button onClick={onClickSubmit}><img sx={{m: 1}} style={{width: '25px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px', marginLeft: '0px'}} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/logo.png"} alt="GDC"/></Button>
                    </Tooltip>
                </div>
            )
            }
        },
    ]



    for (let i =0; i < table.length; i++) {
        table[i]['id'] = table[i]['filename'];
        table[i]['cluster'] = table[i]['filename'].split('_')[1].replace('cluster', 'C').replace('.tsv', '');
    }

    return (
        <div style={{ height: "400px", margin: '3%', minWidth: '500px' }}>
            <DataGrid
                rows={table}
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
            />
    </div>
    )
}
