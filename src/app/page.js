"use client";

import dynamic from 'next/dynamic';
import styles from '../styles/globals.css';

const CanvasScene = dynamic(() => import('../components/CanvasScene'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.canvasContainer}>
      <CanvasScene />
    </div>
  );
}
