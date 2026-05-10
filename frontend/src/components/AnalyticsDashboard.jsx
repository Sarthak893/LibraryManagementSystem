// src/components/AnalyticsDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const AnalyticsDashboard = () => {

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalRentals: 0,
    issuedBooks: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/analytics/admin-stats`
      );

      setStats(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const cardStyle =
    "bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 border border-gray-100";

  const numberStyle =
    "text-4xl font-bold mt-3 text-indigo-600";

  const titleStyle =
    "text-gray-600 text-lg font-medium";

  return (
    <div className="mb-10">

      {/* HEADING */}
      <div className="mb-6">

      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* TOTAL BOOKS */}
        <div className={cardStyle}>

          <div className="flex items-center justify-between">

            <h2 className={titleStyle}>
              Total Books
            </h2>

            <span className="text-3xl">
              📚
            </span>

          </div>

          <p className={numberStyle}>
            {stats.totalBooks}
          </p>

        </div>

        {/* TOTAL USERS */}
        <div className={cardStyle}>

          <div className="flex items-center justify-between">

            <h2 className={titleStyle}>
              Total Users
            </h2>

            <span className="text-3xl">
              👥
            </span>

          </div>

          <p className={numberStyle}>
            {stats.totalUsers}
          </p>

        </div>

        {/* TOTAL RENTALS */}
        <div className={cardStyle}>

          <div className="flex items-center justify-between">

            <h2 className={titleStyle}>
              Total Rentals
            </h2>

            <span className="text-3xl">
              🔄
            </span>

          </div>

          <p className={numberStyle}>
            {stats.totalRentals}
          </p>

        </div>

        {/* ISSUED BOOKS */}
        <div className={cardStyle}>

          <div className="flex items-center justify-between">

            <h2 className={titleStyle}>
              Issued Books
            </h2>

            <span className="text-3xl">
              📖
            </span>

          </div>

          <p className={numberStyle}>
            {stats.issuedBooks}
          </p>

        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;