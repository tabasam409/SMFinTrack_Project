import "./IconSection.css";

import {
  House,
  User,
  CloudUpload,
  Download,

  SquarePen,
  Trash2,
  Eye,
  Camera,

  Search,
  Bell,
  TrendingUp,
  MessageSquare,

  Tag,
  Calendar,
  Shield,
  MapPin,
} from "lucide-react";

function IconSection() {
  return (
    <section id="icons" className="icon-section">

      {/* ==========================
          SECTION TITLE
      =========================== */}

      <h2 className="icon-section-title">
        10. Icons (Lucide)
      </h2>

      {/* ==========================
          ICON CARD
      =========================== */}

      <div className="icon-card">

        {/* ==========================
            ICON GRID
        =========================== */}

        <div className="icon-grid">

          {/* Row 1 */}

          <div className="icon-item">
            <House size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <User size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <CloudUpload size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Download size={24} strokeWidth={2} />
          </div>

          {/* Row 2 */}

          <div className="icon-item">
            <SquarePen size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Trash2 size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Eye size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Camera size={24} strokeWidth={2} />
          </div>

          {/* Row 3 */}

          <div className="icon-item">
            <Search size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Bell size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <TrendingUp size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <MessageSquare size={24} strokeWidth={2} />
          </div>

          {/* Row 4 */}

          <div className="icon-item">
            <Tag size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Calendar size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <Shield size={24} strokeWidth={2} />
          </div>

          <div className="icon-item">
            <MapPin size={24} strokeWidth={2} />
          </div>

        </div>

        {/* ==========================
            DESCRIPTION
        =========================== */}

        <div className="icon-description">

          <p>
            Consistent line style, 2px stroke width,
            rounded ends.
          </p>

        </div>

      </div>

    </section>
  );
}

export default IconSection;