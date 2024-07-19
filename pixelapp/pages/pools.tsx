import React, { useEffect, useState, useCallback } from "react";
import {
  useAddress,
  useBalance,
  useContract,
  useContractWrite,
  useSDK,
  toWei,
  useTokenBalance,
} from "@thirdweb-dev/react";
import styles from "../styles/Pools.module.css";

// Kontraktadressen für Token und DEX
const TOKEN_CONTRACT = "0x63b31C58d994a01e7323852C2Ed4f967Db45c169";
const DEX_CONTRACT = "0x4E70490974A3262D9a8CF09C986c6df6359E224B";

// Hauptkomponente für die Pools-Seite
const Pools = () => {
  // Initialisieren des SDKs und der Wallet-Adresse
  const sdk = useSDK();
  const address = useAddress();

  // Abrufen der Token- und DEX-Kontrakte und ihrer Ladezustände
  const { contract: tokenContract, isLoading: isLoadingTokenContract } =
    useContract(TOKEN_CONTRACT);
  const { contract: dexContract, isLoading: isLoadingDexContract } =
    useContract(DEX_CONTRACT);

  // Lesen von Daten aus den Kontrakten
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const { data: nativeBalance } = useBalance();
  const { data: contractTokenBalance } = useTokenBalance(
    tokenContract,
    DEX_CONTRACT
  );

  // Definieren von Zustandsvariablen
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pools, setPools] = useState<any[]>([
    { token: "1000", native: "10" },
    { token: "500", native: "5" },
  ]);

  // Schreiben von Daten in die Kontrakte (Liquiditätsfunktionen)
  const { mutateAsync: addLiquidity } = useContractWrite(
    dexContract,
    "addLiquidity"
  );
  const { mutateAsync: approveTokenSpending } = useContractWrite(
    tokenContract,
    "approve"
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

  // Funktion zum Hinzufügen von Liquidität
  const handleAddLiquidity = async () => {
    if (!dexContract || !tokenContract || !sdk) {
      console.error("Contracts or SDK are not loaded");
      return;
    }

    if (parseFloat(tokenValue) <= 0 || parseFloat(nativeValue) <= 0) {
      alert("Please enter valid token and native amounts.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Approving token spending...");
      const approveTx = await approveTokenSpending({
        args: [DEX_CONTRACT, toWei(tokenValue)],
      });
      console.log("Approve transaction:", approveTx);

      console.log("Adding liquidity...");
      const tokenReserve = await dexContract.call("getTokensInContract");
      const reservedEth = await sdk.getBalance(DEX_CONTRACT);
      console.log("Token Reserve:", tokenReserve.toString());
      console.log("Reserved ETH:", reservedEth.displayValue);

      const tokenReserveValue = parseFloat(tokenReserve.toString());
      const reservedEthValue = parseFloat(reservedEth.displayValue);

      const minTokenAmount =
        (parseFloat(nativeValue) * tokenReserveValue) / reservedEthValue;
      console.log("Minimum Token Amount Required:", minTokenAmount);

      if (parseFloat(tokenValue) < minTokenAmount) {
        throw new Error(
          "Amount of tokens sent is less than the minimum tokens required"
        );
      }

      const addLiquidityTx = await addLiquidity({
        args: [toWei(tokenValue)],
        overrides: { value: toWei(nativeValue) },
      });
      console.log("Add liquidity transaction:", addLiquidityTx);

      alert("Liquidity added successfully");
      setPools([...pools, { token: tokenValue, native: nativeValue }]);
      fetchContractBalance();
    } catch (error) {
      console.error("Error adding liquidity:", error);
      alert("An error occurred while adding liquidity");
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

  // Anzeige einer Ladeanzeige, wenn die Kontrakte geladen werden
  if (isLoadingTokenContract || isLoadingDexContract) {
    return <div>Loading contracts...</div>;
  }

  // Rendering der Hauptkomponente
  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} ${styles.highlight}`}>Liquidity Pools</h1>
      <p className={styles.description}>Provide liquidity, earn yield.</p>
      <div className={styles["pool-container"]}>
        <div className={styles["pool-header"]}>
          <div className={styles["pool-column"]}>Pool</div>
          <div className={styles["pool-column"]}>Liquidity</div>
          <div className={styles["pool-column"]}>Volume 24H</div>
          <div className={styles["pool-column"]}>Fees 24H</div>
          <div className={styles["pool-column"]}>APR 24H</div>
          <div className={styles["pool-column"]}>Actions</div>
        </div>
        {pools.map((pool, index) => (
          <div className={styles["pool-row"]} key={index}>
            <div className={styles["pool-column"]}>SWP-MATIC</div>
            <div className={styles["pool-column"]}>{pool.token} SWP</div>
            <div className={styles["pool-column"]}>{pool.native} MATIC</div>
            <div className={styles["pool-column"]}>$0</div>
            <div className={styles["pool-column"]}>0%</div>
            <div className={styles["pool-column"]}>
              <button
                className={styles["action-button"]}
                onClick={() => handleAddLiquidity()}
                disabled={isLoading}
              >
                Deposit
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles["add-remove-section"]}>
        <h2 className={styles["section-title"]}>Add Liquidity</h2>
        <input
          type="number"
          className={styles.input}
          placeholder="Token Amount"
          value={tokenValue}
          onChange={(e) => setTokenValue(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="number"
          className={styles.input}
          placeholder="Native Amount (MATIC)"
          value={nativeValue}
          onChange={(e) => setNativeValue(e.target.value)}
          disabled={isLoading}
        />
        <button
          className={styles["action-button"]}
          onClick={handleAddLiquidity}
          disabled={isLoading || parseFloat(tokenValue) <= 0 || parseFloat(nativeValue) <= 0}
        >
          {isLoading ? "Loading..." : "Add Liquidity"}
        </button>
      </div>
      <div className={styles["balance-section"]}>
        <h2 className={styles["section-title"]}>Pool Balances</h2>
        <div className={styles["balance-row"]}>
          <span className={styles["balance-label"]}>Contract Balance:</span>
          <span className={styles["balance-value"]}>
            {contractBalance} MATIC
          </span>
        </div>
        <div className={styles["balance-row"]}>
          <span className={styles["balance-label"]}>
            Token Balance in Pool:
          </span>
          <span className={styles["balance-value"]}>
            {contractTokenBalance?.displayValue} SWP
          </span>
        </div>
      </div>
    </div>
  );
};

export default Pools;
