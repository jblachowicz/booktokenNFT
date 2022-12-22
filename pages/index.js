

import { useAddress, useMetamask } from "@thirdweb-dev/react";



import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const connectWithMetamask = useMetamask();
  const address = useAddress();


  const router = useRouter();

  useEffect(() => {
    if (address) router.replace("/exchange");
  }, [address]);

  return (
    <div>
      <Head>
        <title>Księgarnia</title>
        <link rel="shortcut icon" href="../public/"/>
      </Head>
      <div className="home__container">
        <h1>Zaloguj się</h1>
        <button className="home__button" onClick={connectWithMetamask}>
          Zaloguj się z MetaMask
        </button>
      </div>
    </div>
  );
}
