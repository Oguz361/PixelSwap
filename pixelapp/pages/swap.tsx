import { NextPage } from "next";
import { useEffect, useState, useCallback } from "react";
import SwapInput from "../components/SwapUI";
import styles from "../styles/Home.module.css";
import {
  useAddress,
  useBalance,
  useContract,
  useContractRead,
  useContractWrite,
  useSDK,
  useTokenBalance,
  toEther,
  toWei,
} from "@thirdweb-dev/react";

// Hauptkomponente für die Home-Seite
const Home: NextPage = () => {
  // Kontraktadressen für Token und DEX
  const TOKEN_CONTRACT = "0xb0bD6A7E9B7d95C9beBb590882fa21d3DBf17d93";
  const DEX_CONTRACT = "0x1A007b9f8d84Fd41A11a8A64fAC18FB506fb3daF";

  // Initialisieren des SDKs und der Wallet-Adresse
  const sdk = useSDK();
  const address = useAddress();

  // Abrufen der Token- und DEX-Kontrakte
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT);
  const { contract: dexContract } = useContract(DEX_CONTRACT);

  // Lesen von Daten aus den Kontrakten
  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { data: nativeBalance } = useBalance();
  const { data: contractTokenBalance } = useTokenBalance(
    tokenContract,
    DEX_CONTRACT
  );

  // Definieren von Zustandsvariablen
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [currentFrom, setCurrentFrom] = useState<string>("native");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Schreiben von Daten in die Kontrakte (Swap-Funktionen)
  const { mutateAsync: swapNativeToken } = useContractWrite(
    dexContract,
    "swapEthTotoken"
  );
  const { mutateAsync: swapTokenToNative } = useContractWrite(
    dexContract,
    "swapTokenToEth"
  );
  const { mutateAsync: approveTokenSpending } = useContractWrite(
    tokenContract,
    "approve"
  );

  // Berechnen der Menge an Tokens, die man erhält
  const { data: amountToGet } = useContractRead(
    dexContract,
    "getAmountOfTokens",
    currentFrom === "native"
      ? [
          toWei(nativeValue || "0"),
          toWei(contractBalance || "0"),
          contractTokenBalance?.value,
        ]
      : [
          toWei(tokenValue || "0"),
          contractTokenBalance?.value,
          toWei(contractBalance || "0"),
        ]
  );

  // Funktion zum Abrufen des Kontraktguthabens
  const fetchContractBalance = useCallback(async () => {
    try {
      const balance = await sdk?.getBalance(DEX_CONTRACT);
      setContractBalance(balance?.displayValue || "0");
    } catch (error) {
      console.error(error);
    }
  }, [sdk]);

  // Funktion zum Ausführen des Swaps
  const executeSwap = async () => {
    setIsLoading(true);
    try {
      if (currentFrom === "native") {
        await swapNativeToken({
          overrides: {
            value: toWei(nativeValue || "0"),
          },
        });
        alert("Swap executed successfully");
      } else {
        await approveTokenSpending({
          args: [DEX_CONTRACT, toWei(tokenValue || "0")],
        });
        await swapTokenToNative({
          args: [toWei(tokenValue || "0")],
        });
        alert("Swap executed successfully");
      }

      // Set both values to "0" after a successful swap
      setNativeValue("0");
      setTokenValue("0");
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to execute the swap");
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect zum periodischen Abrufen des Kontraktguthabens
  useEffect(() => {
    fetchContractBalance();
    const interval = setInterval(fetchContractBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchContractBalance]);

  // useEffect zum Setzen der Werte basierend auf den abgerufenen Daten
  useEffect(() => {
    if (!amountToGet) return;
    if (currentFrom === "native") {
      setTokenValue(toEther(amountToGet));
    } else {
      setNativeValue(toEther(amountToGet));
    }
  }, [amountToGet, currentFrom]);

  // Funktion zum Wechseln zwischen native und token
  const handleToggle = () => {
    setCurrentFrom(currentFrom === "native" ? "token" : "native");
    setNativeValue("0");
    setTokenValue("0");
  };

  // Rendering der Hauptkomponente
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.swapBoxWrapper}>
          <div className={styles.swapBox}>
            <div>
              {currentFrom === "native" ? (
                <>
                  <SwapInput
                    current={currentFrom as string}
                    type="native"
                    max={nativeBalance?.displayValue}
                    value={nativeValue as string}
                    setValue={setNativeValue}
                    tokenSymbol="MATIC"
                    tokenBalance={nativeBalance?.displayValue}
                  />
                  <div className={styles.toggleButtonContainer}>
                    <button onClick={handleToggle} className={styles.toggleButton}>
                      ↑↓
                    </button>
                  </div>
                  <SwapInput
                    current={currentFrom as string}
                    type="token"
                    max={tokenBalance?.displayValue}
                    value={tokenValue as string}
                    setValue={setTokenValue}
                    tokenSymbol={symbol as string}
                    tokenBalance={tokenBalance?.displayValue}
                  />
                </>
              ) : (
                <>
                  <SwapInput
                    current={currentFrom as string}
                    type="token"
                    max={tokenBalance?.displayValue}
                    value={tokenValue as string}
                    setValue={setTokenValue}
                    tokenSymbol={symbol as string}
                    tokenBalance={tokenBalance?.displayValue}
                  />
                  <div className={styles.toggleButtonContainer}>
                    <button onClick={handleToggle} className={styles.toggleButton}>
                      ↑↓
                    </button>
                  </div>
                  <SwapInput
                    current={currentFrom as string}
                    type="native"
                    max={nativeBalance?.displayValue}
                    value={nativeValue as string}
                    setValue={setNativeValue}
                    tokenSymbol="MATIC"
                    tokenBalance={nativeBalance?.displayValue}
                  />
                </>
              )}
            </div>
            {address ? (
              <div className={styles.swapButtonContainer}>
                <button
                  onClick={executeSwap}
                  disabled={isLoading as boolean}
                  className={styles.swapButton}
                >
                  {isLoading ? "Loading..." : "Swap"}
                </button>
              </div>
            ) : (
              <p className={styles.centerText}>Connect Wallet to exchange</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
