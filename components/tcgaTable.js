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

    var table = props.table;

    let columns = [
        { field: "filename", headerName: "File", minWidth: 200},
        { field: "n", headerName: "# Samples", type: "number", minWidth: 10 },
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
            headerName: "Links",
            sortable: false,
            flex: 1,
            minWidth: 265,
            renderCell: (params) => {
            const onClickCancer = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                
                window.open(`https://portal.gdc.cancer.gov/projects/TCGA-${params.row.filename.split('_')[0]}`, '_blank', 'noreferrer');
            };
            const onClickSubmit = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                
                window.open(`https://maayanlab.cloud/archs4/gene/${params.row.gene}`, '_blank', 'noreferrer');
            };
            const onClickDownload = (e) => {
                e.stopPropagation(); // don't select this row after clicking
                window.open(`${runtimeConfig.NEXT_PUBLIC_DOWNLOADS}TCGA/${params.row.filename}`);
            };
        
            return (
                <div className={styles.horizontalFlexbox} style={{gap: '0px', padding: '0px'}}>
                    <Tooltip title="Explore Genomic Data Commons">
                        <Button onClick={onClickCancer}><img sx={{m: 1}} style={{width: '70px', display: 'flex', flexDirection: 'row', gap: '0px', padding: '0px', marginLeft: '0px'}} src={runtimeConfig.NEXT_PUBLIC_ENTRYPOINT + "/images/gdclogo.png"} alt="GDC"/></Button>
                    </Tooltip>
                    <Button onClick={onClickDownload}><img sx={{m: 1}} /><DownloadIcon color="secondary"></DownloadIcon></Button>
                    <Button onClick={onClickSubmit} variant="outlined" color='secondary'>Submit</Button>
                    
                </div>
            )
            }
        },
    ]



    for (let i =0; i < table.length; i++) {
        table[i]['id'] = table[i]['filename'];
    }

    return (
        <div style={{ height: "400px", width: "60%", margin: '3%' }}>
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
