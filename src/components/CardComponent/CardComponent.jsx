import "./CardComponent.css";

import Card from "../Card";

import {
  Wallet,
  Heart,
  TrendingUp,
  CalendarDays,
  Music2,
} from "lucide-react";
function CardComponent() {
  return (
    <section id="cards" className="card-section">

      <h2 className="section-title">
        4. Cards
      </h2>

      <div className="card-grid">

        {/* ================= Budget Card ================= */}

        <Card
          variant="budget"
          icon={<Wallet size={20} />}
          title="Budget Card"
          subtitle="Food & Dining"
          amount="PKR 3,500"
          secondaryAmount="of PKR 5,000"
          progress={70}
          progressLabel="70%"
          footer="Remaining: PKR 1,500"
        />

        {/* ================= Health Card ================= */}

        <Card
          variant="health"
          icon={<Heart size={20} />}
          title="Health Score Card"
          subtitle="Financial Health"
          amount="82 /100"
          footer="↑ 6% from last month"
          trend="Great Job!"
          trendIcon={<TrendingUp size={18} />}
        />
              {/* =========================
          Forecast Card
      ========================= */}

      <Card
        variant="forecast"
        icon={<CalendarDays size={18} />}
        title="Forecast Card"
        subtitle="Food & Dining"
        amount="PKR 6,200"
        secondaryAmount="Expected Spend"
        footer="Range: 5,800 - 6,800"
        status="High Confidence"
      >
        <div className="forecast-extra">
          <div className="forecast-bar">
            <div className="forecast-fill"></div>
          </div>
        </div>
      </Card>

      {/* =========================
          Subscription Card
      ========================= */}

      <Card
        variant="subscription"
        icon={<Music2 size={18} />}
        title="Subscription Card"
        subtitle="Spotify"
        amount="PKR 279 / month"
        footer="Next billing on 25 Jul, 2026"
        status="Active"
      >
        <div className="subscription-logo">
          <Music2 size={34} />
        </div>
      </Card>

    </div>

  </section>
);

}

export default CardComponent;