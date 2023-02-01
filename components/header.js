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
                    <div className={styles.rightDiv}>
                        <div className={styles.text}><b>TargetRanger is a web-server application that provides target screening from user-inputted data by comparing it to processed data of the expression of human genes and proteins across human cell types, tissues, and cell lines from several atlases.</b></div>
                        <div className={styles.APIandDownloadDiv}>
                        <div className={styles.text}></div>
                            <Link href={process.env.NEXT_PUBLIC_GENERANGERURL} ><a className={styles.headerLink}><div className={styles.text}><b>GeneRanger </b></div><img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/GeneRangerLogo.png'} alt="Logo" width={50} /></a></Link>
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
                            <Link href={process.env.NEXT_PUBLIC_GENERANGERURL} ><a className={styles.headerLink}><div className={styles.text}><b>GeneRanger </b></div><img src={process.env.NEXT_PUBLIC_ENTRYPOINT + '/images/GeneRangerLogo.png'} alt="Logo" width={50} /></a></Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}