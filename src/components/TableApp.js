import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Table.css';

function TableApp() {
  const [points, setPoints] = useState(null);
  const [rank, setRank] = useState(null);
  const [userTotalVolume, setUserTotalVolume] = useState(null);
  const [totalDeposit, setTotalDeposit] = useState(null);
  const [endAccountValue, setEndAccountValue] = useState(null);
  const [accountPnL, setAccountPnL] = useState(null);

  useEffect(() => {
    // Запрос к первому API
    axios.get('https://api-evm.orderly.org/v1/client/points?address=0xce6915ea810b862a44d10ccc8086921078a2266c')
      .then(response => {
        setPoints(response.data.data.current_epoch_points);
        setRank(response.data.data.current_epoch_rank);
      })
      .catch(error => {
        console.error('Error fetching data from the first API:', error);
      });

    // Запрос к второму API
    axios.get('https://api-evm.orderly.org/v1/public/campaign/user?address=0xce6915ea810b862a44d10ccc8086921078a2266c&campaign_id=13')
      .then(response => {
        const data = response.data.data;
        setUserTotalVolume(data.volume !== null ? data.volume.toFixed(2) : null);
        setTotalDeposit(data.total_deposit_amount !== null ? data.total_deposit_amount.toFixed(2) : null);
        setEndAccountValue(data.end_account_value !== null ? data.end_account_value.toFixed(2) : null);
      })
      .catch(error => {
        console.error('Error fetching data from the second API:', error);
      });
  }, []);

  useEffect(() => {
    if (endAccountValue !== null && totalDeposit !== null) {
      const pnl = (endAccountValue - totalDeposit).toFixed(2);
      setAccountPnL(pnl);
    }
  }, [endAccountValue, totalDeposit]);
  

  return (
    <div>
      <h1>Orderly (LogX) Accounts Table</h1>
      <table>
        <thead>
          <tr>
            <th>Current Epoch Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Current Epoch Points</td>
            <td>{points}</td>
          </tr>
          <tr>
            <td>Current Epoch Rank</td>
            <td>{rank}</td>
          </tr>
          <tr>
            <td>User Total Volume</td>
            <td>{userTotalVolume}</td>
          </tr>
          <tr>
            <td>User Total Deposits</td>
            <td>{totalDeposit}</td>
          </tr>
          <tr>
            <td>End Account Value</td>
            <td>{endAccountValue}</td>
          </tr>
          <tr>
            <td>Account P&L</td>
            <td>{accountPnL}</td>
          </tr>
        </tbody>

      </table>
    </div>
  );
}

export default TableApp;