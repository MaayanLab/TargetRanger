import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React from 'react';
import styles from '../styles/Main.module.css';
import Footer from '../components/footer';
import Header from '../components/header';
import Head from '../components/head';
import "swagger-ui-react/swagger-ui.css"
import dynamic from "next/dynamic";
import { createSwaggerSpec } from 'next-swagger-doc';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(import('swagger-ui-react'), {ssr: false})

export async function getStaticProps() {
    let spec = createSwaggerSpec({
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'TargetRanger API',
          version: '1.0',
        },
      },
    });


    spec.paths['/api/query_db_targets'].post.tags = ['query_db_targets'];
    spec.paths['/api/query_db_targets_transcript'].post.tags = ['query_db_targets_transcript'];
  
    return {
      props: {
        spec,
      },
    };
};

export default function Page(props) {

    return (

        <div style={{position: 'relative', minHeight: '100vh'}}>

            <Head/>

            <div className={styles.mainDiv}>

                <Header/>

                <div style={{width: '90%', marginBottom: '200px'}}>
                    <SwaggerUI spec={props.spec}/>
                </div>
            
                <Footer/>

            </div>
        </div>
      
    )
  }

