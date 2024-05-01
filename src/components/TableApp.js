import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Table.css';

function TableApp() {
  const [data, setData] = useState([]);
  const [averageCostPer1k, setAverageCostPer1k] = useState(null);
  const [currentEpochId, setCurrentEpochId] = useState(null);
  const [totalTraders, setTotalTraders] = useState(null);
  const [timeRemainingCurrentEpoch, setTimeRemainingCurrentEpoch] = useState(null);
  const [timeRemainingLastEpoch, setTimeRemainingLastEpoch] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Получаем текущую эпоху
      axios.get('https://api-evm.orderly.org/v1/public/points/epoch')
        .then(response => {
          setCurrentEpochId(response.data.data.current_epoch_id);
          setTotalTraders(response.data.data.total_traders);
          // Получаем данные всех эпох
          return axios.get('https://api-evm.orderly.org/v1/public/points/epoch_dates');
        })
        .then(response => {
          const epochData = response.data.data;

          // Находим данные текущей эпохи
          const currentEpoch = epochData.rows.find(epoch => epoch.epoch_id === currentEpochId);
          const timestamp = Date.now();

          // Вычисляем оставшееся время до конца текущей эпохи
          const timeRemainingCurrent = currentEpoch.epoch_end_date - timestamp;
          setTimeRemainingCurrentEpoch(timeRemainingCurrent);

          // Находим данные последней эпохи
          const lastEpoch = epochData.rows[epochData.rows.length - 1];

          // Вычисляем оставшееся время до конца последней эпохи
          const timeRemainingLast = lastEpoch.epoch_end_date - timestamp;
          setTimeRemainingLastEpoch(timeRemainingLast);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });

      const addresses = [
        { address: '0xbAB31fed20b2862CB4d734C0FD04A79A3195bf90', number: 16 },
        { address: '0xdab4b1280f01C333a37f83fe9F785D70bB4367Af', number: 18 },
        { address: '0xdd168C5003e280eB70bB890FD3245FFC3e43E740', number: 19 },
        { address: '0x902E57be4b741570CeA27265517F90E90BDc9427', number: 20 },
        { address: '0xBE9FcdEa0Cd0eCD894F5bac603E702d6342637d0', number: 21 },
        { address: '0xEED4e59568BCc63597B6a1A8a6cE645eC581694E', number: 22 },
        { address: '0x6Dc86aA96D0827aB394DbdfD0089145F162F62A1', number: 23 },
        { address: '0xA326897BCDe01d6B9cEC65122b6B70d1DA16D818', number: 24 },
        { address: '0x0CB13166248BC7d29630D24B77187376096e2079', number: 25 },
      ];

      const promises = addresses.map((address, index) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            Promise.all([
              axios.get(`https://api-evm.orderly.org/v1/client/points?address=${address.address}`),
              axios.get(`https://api-evm.orderly.org/v1/public/campaign/user?address=${address.address}&campaign_id=12`)
            ])
              .then(([pointsResponse, campaignResponse]) => {
                const pointsData = pointsResponse.data.data;
                const campaignData = campaignResponse.data.data;
                const newDataItem = {
                  number: address.number,
                  address: address.address,
                  totalPoints: pointsData.total_points,
                  globalRank: pointsData.global_rank,
                  points: pointsData.current_epoch_points,
                  rank: pointsData.current_epoch_rank,
                  userTotalVolume: campaignData.volume !== null ? campaignData.volume.toFixed(2) : null,
                  totalDeposit: campaignData.total_deposit_amount !== null ? campaignData.total_deposit_amount.toFixed(2) : null,
                  endAccountValue: campaignData.end_account_value !== null ? campaignData.end_account_value.toFixed(2) : null,
                  accountPnL: (pointsData.current_epoch_points !== null && campaignData.total_deposit_amount !== null) ? (campaignData.end_account_value - campaignData.total_deposit_amount).toFixed(2) : null,
                  costPer1k: (pointsData.current_epoch_points !== null && campaignData.volume !== null && campaignData.volume !== 0) ? ((campaignData.end_account_value - campaignData.total_deposit_amount) / campaignData.volume * 1000).toFixed(2) : null
                };
                resolve(newDataItem);
              })
              .catch(error => {
                console.error('Error fetching data:', error);
                reject(error);
              });
          }, index * 500);
        });
      });

      Promise.all(promises)
        .then(newData => {
          setData(newData);

          const averageCostPer1kValue = newData.reduce((acc, item) => {
            if (item.costPer1k !== null) {
              acc += parseFloat(item.costPer1k);
            }
            return acc;
          }, 0) / newData.length;
          setAverageCostPer1k(averageCostPer1kValue.toFixed(2));
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    };

    fetchData();
  }, [currentEpochId]);

  const formatTime = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${days} days: ${hours} hours: ${minutes} minutes`;
  };

  return (
    <div>
      <h1>Orderly Accounts Table</h1>
      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Address</th>
            <th>Total Points</th>
            <th>Global Rank</th>
            <th>Current Epoch Points</th>
            <th>Current Epoch Rank</th>
            <th>User Total Volume</th>
            <th>User Total Deposits</th>
            <th>End Account Value</th>
            <th>Account P&L</th>
            <th>Cost per 1k</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.number}</td>
              <td>{item.address}</td>
              <td>{item.totalPoints}</td>
              <td>{item.globalRank}</td>
              <td>{item.points}</td>
              <td>{item.rank}</td>
              <td>{item.userTotalVolume}</td>
              <td>{item.totalDeposit}</td>
              <td>{item.endAccountValue}</td>
              <td>{item.accountPnL}</td>
              <td>{item.costPer1k}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Average Cost per 1k: {averageCostPer1k !== null ? `$ ${averageCostPer1k}` : 'N/A'}</p>
      <p>Total Traders: {totalTraders}</p>
      <p>Time remaining in current epoch: {timeRemainingCurrentEpoch !== null ? formatTime(timeRemainingCurrentEpoch) : 'Loading...'}</p>
      <p>Time remaining until end of last epoch: {timeRemainingLastEpoch !== null ? formatTime(timeRemainingLastEpoch) : 'Loading...'}</p>
    </div>
  );
}

export default TableApp;
