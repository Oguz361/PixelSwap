import { ConnectWallet } from "@thirdweb-dev/react"; 
import Link from "next/link";
import Image from "next/image"; 
import React from "react";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Link href="/" passHref>
        <div className={styles.logoTitleContainer}>
          <Image
            src="/star30.png" 
            alt="Logo"
            className={styles.logo}
            width={45} 
            height={50}
          />
          <span className={styles.title}>PixelSwap</span>
        </div>
      </Link>
      <div className={styles.links}>
        <Link href="/explore" passHref>
          <div className={styles.navLink}>Explore</div>
        </Link>
        <Link href="/swap" passHref>
          <div className={styles.navLink}>Swap</div>
        </Link>
        <Link href="/pools" passHref>
          <div className={styles.navLink}>Pools</div>
        </Link>
        <Link href="/testPool" passHref>
          <div className={styles.navLink}>testPools</div>
        </Link>
      </div>
      <ConnectWallet /> {}
    </nav>
  );
};

export default Navbar;


