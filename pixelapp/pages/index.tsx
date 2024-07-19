import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Main.module.css";

const Home: React.FC = () => {
  const [popupContent, setPopupContent] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const logoCount = 45;
  const logos = Array.from({ length: logoCount });

  const handleLearnMoreClick = (content: string) => {
    setPopupContent(content);
  };

  const handleClosePopup = () => {
    setPopupContent(null);
  };

  const faqData = [
    {
      question: "How do I start trading on this DEX?",
      answer:
        "To start trading, you&apos;ll need a compatible cryptocurrency wallet (like MetaMask). Connect your wallet to our platform, ensure you have the necessary tokens, and you can begin trading immediately.",
    },
    {
      question: "What are the fees for trading?",
      answer:
        "Our DEX uses a dynamic fee structure based on network congestion and liquidity. Typically, fees range from 0.1% to 0.3% per trade. You can view the current fee rate before confirming any transaction.",
    },
    {
      question: "How does liquidity provision work?",
      answer:
        "Users can become liquidity providers by depositing equal values of two tokens into a liquidity pool. In return, they receive LP tokens and earn a share of the trading fees proportional to their contribution to the pool.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(index === openFaq ? -1 : index);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.textContent}>
        <h1>
          Explore the <span className={styles.highlight}>PixelSwap</span> Universe
        </h1>
        <p>Trade cryptocurrencies safely and decentralized.</p>
        <div className={styles.buttonContainer}>
          <Link href="/swap" passHref>
            <button className={styles.tradeButton}>Trade Now</button>
          </Link>
        </div>
      </div>
      <div className={styles.logoContainer}>
        {logos.map((_, index) => {
          const top = Math.random() * 100;
          const left = Math.random() * 100;
          const delay = Math.random() * 20;
          const imageUrl = index % 3 === 0 ? "/star16.png" : "/star30.png";

          return (
            <div
              key={index}
              className={styles.logo}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                position: "absolute",
                width: "30px",
                height: "30px",
              }}
            >
              <Image
                src={imageUrl}
                alt="Logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
          );
        })}
      </div>
      <section className={styles.advantages}>
        <h2 className={styles.header}>
          Discover the Power of Decentralized Exchanges
        </h2>
        <div className={styles.advantageRow}>
          <div className={`${styles.advantage} ${styles.advantageTitle}`}>
            <div className={styles.advETitle}>What is a DEX?</div>
            <div className={styles.advEAbout}>
              A Decentralized Exchange (DEX) is a type of cryptocurrency
              exchange which allows for direct peer-to-peer transactions without
              an intermediary.
            </div>
            <button
              className={styles.learnMoreButton}
              onClick={() =>
                handleLearnMoreClick(
                  "A Decentralized Exchange (DEX) is a cryptocurrency trading platform that operates without a central authority or intermediary. Instead of relying on a third party to hold funds, DEXes allow for peer-to-peer transactions directly on the blockchain. This means that users retain full control over their assets, enhancing security and privacy. DEXes typically use smart contracts to execute trades, which are self-executing contracts with the terms of the agreement directly written into code. Examples of popular DEXes include Uniswap, SushiSwap, and PancakeSwap."
                )
              }
            >
              Learn More
            </button>
          </div>
          <div className={styles.advantage}>
            <div className={styles.advETitle}>How to Start</div>
            <div className={styles.advEAbout}>
              Begin by creating a cryptocurrency wallet, such as MetaMask, and
              connecting it to a DEX platform like PixelSwap.
            </div>
            <button
              className={styles.learnMoreButton}
              onClick={() =>
                handleLearnMoreClick(
                  "To start, create a cryptocurrency wallet such as MetaMask. Once set up, you can connect it to a DEX platform like PixelSwap, enabling you to trade cryptocurrencies directly from your wallet."
                )
              }
            >
              Learn More
            </button>
          </div>
          <div className={styles.advantage}>
            <div className={styles.advETitle}>Centralized Exchange</div>
            <div className={styles.advEAbout}>
              Centralized exchanges are platforms where your funds are held by a
              third party, making it easier for beginners to navigate.
            </div>
            <button
              className={styles.learnMoreButton}
              onClick={() =>
                handleLearnMoreClick(
                  "A centralized exchange (CEX) is a type of cryptocurrency exchange that relies on a third party to manage and secure users&apos; funds. CEXes often provide a user-friendly interface and are easier for beginners to navigate compared to decentralized exchanges."
                )
              }
            >
              Learn More
            </button>
          </div>
          <div className={styles.advantage}>
            <div className={styles.advETitle}>Decentralized Exchanges</div>
            <div className={styles.advEAbout}>
              DEXes offer more privacy and control over your funds, as
              transactions occur directly between users.
            </div>
          </div>
          <div className={styles.advantage}>
            <div className={styles.advETitle}>Frequent Updates</div>
            <div className={styles.advEAbout}>
              Our platform constantly evolves with new features and improvements
              to enhance your trading experience.
            </div>
          </div>
        </div>
      </section>
      {popupContent && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              &times;
            </button>
            <div className={styles.popupHeader}>
              <Image src="/info-icon.svg" alt="Info" width={30} height={30} />
              <h3 className={styles.popupTitle}>Learn More</h3>
            </div>
            <div className={styles.popupContent}>{popupContent}</div>
          </div>
        </div>
      )}
      <div className={styles.ExploreWorld}>
        <div className={styles.leftContent}>
          <p>Trade</p>
          <h1>Explore the World of Cryptocurrency Trading</h1>
        </div>
        <div className={styles.rightContent}>
          <p>
            Discover a wide range of cryptocurrencies available for trading on
            our decentralized application. With our user-friendly interface and
            secure platform, you can easily navigate the crypto market and make
            informed investment decisions. Whether you&apos;re a beginner or an
            experienced trader, our platform provides the tools and resources
            you need to succeed in the world of cryptocurrency trading.
          </p>
          <Link href="/explore" passHref>
            <button className={styles.exploreButton}>Explore</button>
          </Link>
        </div>
      </div>
      <div className={styles.featureSection}>
        <h1>Trade crypto with low transaction fees</h1>
        <div className={styles.featuresContainer}>
          <div className={styles.featureItem}>
            <Image
              src="/icon2.png"
              alt="User-Friendly Icon"
              width={50}
              height={50}
              className={styles.featureIcon}
            />
            <p>Enjoy a user-friendly interface for seamless trading.</p>
          </div>
          <div className={styles.featureItem}>
            <Image
              src="/icon4.png"
              alt="Secure Icon"
              width={50}
              height={50}
              className={styles.featureIcon}
            />
            <p>Securely trade crypto with advanced features.</p>
          </div>
          <div className={styles.featureItem}>
            <Image
              src="/icon3.png"
              alt="Intuitive Icon"
              width={50}
              height={50}
              className={styles.featureIcon}
            />
            <p>Trade crypto with confidence using our intuitive platform.</p>
          </div>
        </div>
      </div>
      <section className={styles.faqSection}>
        <div className={styles.faqHeaderContainer}>
          <h2 className={styles.faqHeader}>Questions?</h2>
          <p className={styles.faqSubheader}>
            If you have questions, we have answers for you here. In case we
            don&apos;t, please feel free to reach out to us at ...
          </p>
        </div>
        <div className={styles.faqContent}>
          <div className={styles.faqGroupHeaderContainer}>
            <h3 className={styles.faqGroupHeader}>General questions</h3>
          </div>
          <div className={styles.faqContainer}>
            {faqData.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                >
                  {faq.question}
                  <span className={styles.faqToggle}>
                    {openFaq === index ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`${styles.faqAnswer} ${
                    openFaq === index ? styles.showAnswer : ""
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
