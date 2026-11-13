import "./DashBoard.css";

import {
  Bell,
  ChevronDown,
  Home,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

function DashboardPreview() {
  return (
    <div className="dashboard-preview">

      {/* Header */}

      <div className="dashboard-top">

        <h4>SMFinTrack</h4>

        <div className="dashboard-icons">
          <Bell size={18} />
          <div className="avatar">A</div>
          <ChevronDown size={16} />
        </div>

      </div>

      {/* Body */}

      <div className="dashboard-body">

        {/* Sidebar */}

        <aside className="dashboard-sidebar">

          <div className="sidebar-item active">
            <Home size={16} />
            <span>Overview</span>
          </div>

          <div className="sidebar-item">
            <Wallet size={16} />
            <span>Transactions</span>
          </div>

          <div className="sidebar-item">
            <BarChart3 size={16} />
            <span>Reports</span>
          </div>

          <div className="sidebar-item">
            <Settings size={16} />
            <span>Settings</span>
          </div>

        </aside>

        {/* Main */}

        <main className="dashboard-main">

          {/* Cards */}

          <div className="stat-grid">

            <div className="stat-card">
              <p>Total Balance</p>
              <h3>PKR 24,560</h3>
              <span>+12.5%</span>
            </div>

            <div className="stat-card">
              <p>Income</p>
              <h3>PKR 45,000</h3>
              <span>+8%</span>
            </div>

            <div className="stat-card">
              <p>Expenses</p>
              <h3>PKR 28,650</h3>
              <span className="red">-3%</span>
            </div>

          </div>

          {/* Bottom */}

          <div className="dashboard-bottom">

            {/* Chart */}

            <div className="chart-card">

              <h5>Spending</h5>

              <div className="pie-chart"></div>

              <ul>

                <li>
                  <span className="dot blue"></span>
                  Food
                </li>

                <li>
                  <span className="dot green"></span>
                  Transport
                </li>

                <li>
                  <span className="dot yellow"></span>
                  Bills
                </li>

                <li>
                  <span className="dot red"></span>
                  Shopping
                </li>

              </ul>

            </div>

            {/* Transactions */}

            <div className="transaction-card">

              <h5>Recent Transactions</h5>

              <div className="transaction">
                <span>Netflix</span>
                <strong className="expense">-409</strong>
              </div>

              <div className="transaction">
                <span>Uber</span>
                <strong className="expense">-450</strong>
              </div>

              <div className="transaction">
                <span>Salary</span>
                <strong className="income">+45000</strong>
              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default DashboardPreview;