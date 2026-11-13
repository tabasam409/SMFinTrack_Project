import "./FeaturesSection.css";
import { Wallet, BarChart3, TrendingUp } from "lucide-react";

const features = [
  {
    icon: <Wallet size={22} />,
    title: "Smart Budgeting",
    desc: "Set budgets for each category and track your spending in real-time.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Expense Insights",
    desc: "Get detailed insights and visuals to understand your spending habits better.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Spending Forecast",
    desc: "Predict next month's expenses per category and plan with confidence.",
  },
];

function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <span className="features-eyebrow">FEATURES</span>
        <h2 className="features-heading">
          Everything you need to <br /> manage your finances
        </h2>
      </div>

      <div className="features-grid">
        {features.map((item, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <a href="#" className="feature-link">Learn more →</a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;