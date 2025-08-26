import React from "react";
import styles from "./Loader.module.css";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

export default function Loader({
  size = "medium",
  text,
  className = "",
}: LoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[size]} ${className}`}>
      <div className={styles.spinner}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      {text && <div className={styles.text}>{text}</div>}
    </div>
  );
}
