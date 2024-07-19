import React, { useEffect, useState, useCallback } from "react";
import {
  useAddress,
  useBalance,
  useContract,
  useContractWrite,
  useSDK,
  useTokenBalance,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import styles from "../styles/testPool.module.css";

const TOKEN_CONTRACT = "0xb0bD6A7E9B7d95C9beBb590882fa21d3DBf17d93";
const DEX_CONTRACT = "0x1A007b9f8d84Fd41A11a8A64fAC18FB506fb3daF";

interface Pool {
  tokenReserve: BigNumber;
  ethReserve: BigNumber;
  volume24h: BigNumber;
  fees24h: BigNumber;
  apr24h: BigNumber;
}

const Pools = () => {
  const sdk = useSDK();
  const address = useAddress();

  const { contract: tokenContract, isLoading: isLoadingTokenContract } =
    useContract(TOKEN_CONTRACT);
  const { contract: dexContract, isLoading: isLoadingDexContract } =
    useContract(DEX_CONTRACT);

  const { data: contractTokenBalance } = useTokenBalance(
    tokenContract,
    DEX_CONTRACT
  );

  const [contractBalance, setContractBalance] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);

  const { mutateAsync: addLiquidity } = useContractWrite(
    dexContract,
    "addLiquidity"
  );
  const { mutateAsync: approveTokenSpending } = useContractWrite(
    tokenContract,
    "approve"
  );

  const fetchContractBalance = useCallback(async () => {
    if (!sdk) return;
    try {
      const balance = await sdk.getBalance(DEX_CONTRACT);
      setContractBalance(balance?.displayValue || "0");
    } catch (error) {
      console.error("Error fetching contract balance:", error);
    }
  }, [sdk]);

  const fetchPools = useCallback(async () => {
    if (!dexContract) return;
    try {
      const poolsData: Pool[] = await dexContract.call("getPools");
      setPools(poolsData);
    } catch (error) {
      console.error("Error fetching pools:", error);
    }
  }, [dexContract]);

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
      await approveTokenSpending({
        args: [DEX_CONTRACT, ethers.utils.parseEther(tokenValue)],
      });

      const tokenReserve = await dexContract.call("getTokensInContract");
      const reservedEth = await sdk.getBalance(DEX_CONTRACT);

      const tokenReserveValue = parseFloat(ethers.utils.formatEther(tokenReserve));
      const reservedEthValue = parseFloat(reservedEth.displayValue);

      const minTokenAmount =
        (parseFloat(nativeValue) * tokenReserveValue) / reservedEthValue;

      if (parseFloat(tokenValue) < minTokenAmount) {
        throw new Error(
          "Amount of tokens sent is less than the minimum tokens required"
        );
      }

      await addLiquidity({
        args: [ethers.utils.parseEther(tokenValue)],
        overrides: { value: ethers.utils.parseEther(nativeValue) },
      });

      alert("Liquidity added successfully");
      fetchPools();
      fetchContractBalance();
      setTokenValue("0");
      setNativeValue("0");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      alert("An error occurred while adding liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (poolIndex: number) => {
    if (!dexContract || !tokenContract || !sdk) {
      console.error("Contracts or SDK are not loaded");
      return;
    }

    setIsLoading(true);
    try {
      const pool = pools[poolIndex];
      const tokenAmount = ethers.utils.parseEther(tokenValue);
      const nativeAmount = ethers.utils.parseEther(nativeValue);

      await approveTokenSpending({
        args: [DEX_CONTRACT, tokenAmount],
      });

      await addLiquidity({
        args: [tokenAmount],
        overrides: { value: nativeAmount },
      });

      alert("Liquidity added successfully");
      fetchPools();
      fetchContractBalance();
      setTokenValue("0");
      setNativeValue("0");
    } catch (error) {
      console.error("Error depositing liquidity:", error);
      alert("An error occurred while depositing liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractBalance();
    fetchPools();
    const interval = setInterval(() => {
      fetchContractBalance();
      fetchPools();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchContractBalance, fetchPools]);

  if (isLoadingTokenContract || isLoadingDexContract) {
    return <div>Loading contracts...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} ${styles.highlight}`}>Liquidity Pools</h1>
      <p className={styles.description}>Provide liquidity, earn yield.</p>
      <div className={styles["pool-container"]}>
        <div className={styles["pool-header"]}>
          <div className={styles["pool-column"]}>Pool</div>
          <div className={styles["pool-column"]}>Token Liquidity</div>
          <div className={styles["pool-column"]}>MATIC Liquidity</div>
          <div className={styles["pool-column"]}>Volume 24H</div>
          <div className={styles["pool-column"]}>Fees 24H</div>
          <div className={styles["pool-column"]}>APR 24H</div>
          <div className={styles["pool-column"]}>Actions</div>
        </div>
        {pools.map((pool, index) => (
          <div className={styles["pool-row"]} key={index}>
            <div className={styles["pool-column"]}>Pool {index + 1}</div>
            <div className={styles["pool-column"]}>{ethers.utils.formatEther(pool.tokenReserve)} SWP</div>
            <div className={styles["pool-column"]}>{ethers.utils.formatEther(pool.ethReserve)} MATIC</div>
            <div className={styles["pool-column"]}>${ethers.utils.formatEther(pool.volume24h)}</div>
            <div className={styles["pool-column"]}>{ethers.utils.formatEther(pool.fees24h)}%</div>
            <div className={styles["pool-column"]}>{ethers.utils.formatEther(pool.apr24h)}%</div>
            <div className={styles["pool-column"]}>
              <button
                className={styles["action-button"]}
                onClick={() => handleDeposit(index)}
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
        <div className={styles["input-group"]}>
          <label htmlFor="swpInput" className={styles["input-label"]}>SWP Amount:</label>
          <input
            id="swpInput"
            type="number"
            className={styles.input}
            placeholder="Enter SWP amount"
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className={styles["input-group"]}>
          <label htmlFor="maticInput" className={styles["input-label"]}>MATIC Amount:</label>
          <input
            id="maticInput"
            type="number"
            className={styles.input}
            placeholder="Enter MATIC amount"
            value={nativeValue}
            onChange={(e) => setNativeValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
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