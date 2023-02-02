import * as React from 'react';
import styles from '../styles/Header.module.css';
import Link from 'next/link';

export default class Header extends React.Component {

    render() {
        return (
            <>
                <div className={styles.longTitle}>
                    <div className={styles.logoAndTitleDiv}>
                        <Link href="targetscreener">
                            <img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                        </Link>
                        <Link href="targetscreener">
                            <h1 style={{fontSize: '40px'}}>TargetRanger</h1>
                        </Link>
                    </div>

                    <div className={styles.text}><b>TargetRanger is a web-server application that identifies targets from user-inputted RNA-seq samples collected from the cells we wish to target. By comparing the inputted samples with processed RNA-seq and proteomics data from several atlases, TargetRanger identifies genes that are highly expressed in the target cells while lowly expressed across normal human cell types, tissues, and cell lines.</b></div>
                    <div className={styles.rightDiv}>
                            <div className={styles.verticalFlexbox}>
                            <b style={{fontSize: '16px', marginBottom: '5px'}}>Explore single gene expression across tissues and cell types with:</b>
                            <Link href={process.env.NEXT_PUBLIC_GENERANGERURL} ><a style={{textDecoration: 'none'}}><img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/GeneRangerLogo.png'} alt="Logo" width={50} /><div className={styles.sisterSite}><b>GeneRanger</b></div></a></Link>
                            </div>
                           
                    </div>
                </div>
                <div className={styles.shortTitle}>
                    <div className={styles.centerDiv}>
                        <div className={styles.logoAndTitleDiv}>
                            <Link href="targetscreener">
                                <img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/logo.png'} alt="App Logo" width={75} height={75} />
                            </Link>
                            <Link href="targetscreener">
                                <h1 style={{fontSize: '40px'}}>TargetRanger</h1>
                            </Link>
                        </div>
                        <div className={styles.APIandDownloadDiv}>
                        <div className={styles.textRight}>
                            Explore Gene Expression on:
                            </div>
                            <Link href={process.env.NEXT_PUBLIC_GENERANGERURL} ><a style={{textDecoration: 'none'}}><img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/GeneRangerLogo.png'} alt="Logo" width={50} /><div className={styles.sisterSite}><b>GeneRanger</b></div></a></Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}