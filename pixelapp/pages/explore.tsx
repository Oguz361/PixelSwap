import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from '../styles/Explore.module.css';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h: number;
  total_volume: number;
  fully_diluted_valuation: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface NewsItem {
  id: string;
  title: string;
  published_at: string;
  author: string;
  url: string;
  thumb_2x: string;
}

const FeaturedNews = ({ newsData }: { newsData: NewsItem[] }) => {
  if (!newsData || newsData.length === 0) {
    return null;
  }
  return (
    <div className={styles.featuredNews}>
      <h2 className={styles.featuredNewsTitle}>Featured News</h2>
      <div className={styles.newsContainer}>
        {newsData.map((item) => (
          <div key={item.id} className={styles.newsItem}>
            {item.thumb_2x ? (
              <Image src={item.thumb_2x} alt={item.title} width={200} height={150} />
            ) : (
              <div className={styles.placeholderImage}>No Image</div>
            )}
            <div className={styles.newsContent}>
              <p className={styles.newsSource}>{item.author}</p>
              <p className={styles.newsDate}>{new Date(item.published_at).toLocaleDateString()}</p>
              <h3 className={styles.newsTitle}>{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Explore = () => {
  const [data, setData] = useState<Coin[]>([]);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Coin[]>('https://api.coingecko.com/api/v3/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: true,
            price_change_percentage: '1h,24h',
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data from CoinGecko API:', error);
        setLoading(false);
      }
    };

    const fetchNewsData = async () => {
      try {
        const response = await axios.get<{ data: NewsItem[] }>('https://api.coingecko.com/api/v3/news', {
          params: {
            order: 'published_at',
            per_page: 4
          }
        });
        setNewsData(response.data.data);
      } catch (error) {
        console.error('Error fetching news data from CoinGecko:', error);
      }
    };

    fetchData();
    fetchNewsData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <FeaturedNews newsData={newsData} />
      <h1 className={styles.title}>TOKENS</h1>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rankHeader}>#</th>
              <th>Token name</th>
              <th>Price</th>
              <th>1h %</th>
              <th>24h %</th>
              <th>Volume</th>
              <th>FDV</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((token, index) => (
              <tr key={token.id}>
                <td className={styles.rankCell}>{index + 1}</td>
                <td>
                  <div className={styles.tokenCell}>
                    <Image src={token.image} alt={`${token.name} logo`} width={24} height={24} />
                    <span>
                      <span className={styles.tokenName}>{token.name}</span>
                      <span className={styles.tokenSymbol}>{token.symbol.toUpperCase()}</span>
                    </span>
                  </div>
                </td>
                <td>${token.current_price.toFixed(2)}</td>
                <td className={token.price_change_percentage_1h_in_currency >= 0 ? styles.priceUp : styles.priceDown}>
                  {token.price_change_percentage_1h_in_currency?.toFixed(2)}%
                </td>
                <td className={token.price_change_percentage_24h >= 0 ? styles.priceUp : styles.priceDown}>
                  {token.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td>${(token.total_volume / 1e6).toFixed(2)}M</td>
                <td>${token.fully_diluted_valuation ? (token.fully_diluted_valuation / 1e9).toFixed(2) + 'B' : '-'}</td>
                <td className={styles.chartCell}>
                  <ResponsiveContainer width="100%" height={50}>
                    <LineChart data={token.sparkline_in_7d?.price.map((price, i) => ({ price, index: i }))}>
                      <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                      <Line type="monotone" dataKey="price" stroke={token.price_change_percentage_24h >= 0 ? "#4caf50" : "#f44336"} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Explore;