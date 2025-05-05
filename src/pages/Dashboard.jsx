// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import API from "../api"; // ✅ Use centralized API instance
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#00C49F", "#FF8042"];

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense"
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/api/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/transactions", formData);
      setFormData({
        title: "",
        amount: "",
        category: "",
        type: "expense"
      });
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  // Chart Data
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pieData = [
    { name: "Income", value: income },
    { name: "Expense", value: expense }
  ];

  const barData = transactions.reduce((acc, t) => {
    const date = new Date(t.createdAt).toLocaleDateString();
    const existing = acc.find((d) => d.date === date);
    if (existing) {
      existing[t.type] += Number(t.amount);
    } else {
      acc.push({
        date,
        income: t.type === "income" ? Number(t.amount) : 0,
        expense: t.type === "expense" ? Number(t.amount) : 0
      });
    }
    return acc;
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Dashboard</h2>

      {/* Add Transaction Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          <div className="col-md-3 mb-2">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              placeholder="Title"
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-control"
              placeholder="Amount"
              required
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              placeholder="Category"
              required
            />
          </div>
          <div className="col-md-2 mb-2">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-control"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="col-md-2 mb-2">
            <button type="submit" className="btn btn-primary w-100">
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Transaction Table */}
      <h4 className="mt-4">Transactions</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id}>
              <td>{tx.title}</td>
              <td>₹{tx.amount}</td>
              <td>{tx.category}</td>
              <td>{tx.type}</td>
              <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts Section */}
      <div className="row mt-5">
        <div className="col-md-6">
          <h5>Income vs Expense</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6">
          <h5>Daily Spending</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#00C49F" />
              <Bar dataKey="expense" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
