import "./ButtonSection.css";
import Button from "../Button";

import {
  Download,
  Plus,
  ChevronRight,
  Settings,
  Bell,
  ArrowRight,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

function ButtonSection() {
  return (
    <section id="buttons" className="button-section">

      <h2 className="section-title">
        1. Buttons
      </h2>

      <div className="button-table">

        {/* ---------- Header ---------- */}

        <div></div>

        <div className="table-heading">Primary</div>

        <div className="table-heading">Secondary</div>

        <div className="table-heading">Danger</div>

        <div className="table-heading">Success</div>

        <div className="table-heading">Icon Button</div>

        <div className="table-heading">Disabled</div>

        {/* ---------- Small ---------- */}

        <div className="row-title">Small</div>

        <Button variant="primary" size="small">
          Button
        </Button>

        <Button variant="secondary" size="small">
          Button
        </Button>

        <Button variant="danger" size="small">
          Button
        </Button>

        <Button variant="success" size="small">
          Button
        </Button>

        <div className="icon-group">

          <Button
            variant="icon-dark"
            size="small"
            iconOnly={<Download size={15} />}
          />

          <Button
            variant="icon-light"
            size="icon-small"
            iconOnly={<Download size={15} />}
            />

        </div>

        <Button
          variant="disabled"
          size="small"
          disabled
        >
          Button
        </Button>

        {/* ---------- Medium ---------- */}

        <div className="row-title">Medium</div>

        <Button variant="primary" size="medium">
          Button
        </Button>

        <Button variant="secondary" size="medium">
          Button
        </Button>

        <Button variant="danger" size="medium">
          Button
        </Button>

        <Button variant="success" size="medium">
          Button
        </Button>

        <div className="icon-group">

          <Button
            variant="icon-dark"
            size="icon-medium"
            iconOnly={<Plus size={16} />}
            />

          <Button
            variant="icon-light"
            size="icon-medium"
            iconOnly={<Plus size={16} />}
            />
        </div>

        <Button
          variant="disabled"
          size="medium"
          disabled
        >
          Button
        </Button>

        {/* ---------- Large ---------- */}

        <div className="row-title">Large</div>

        <Button variant="primary" size="large">
          Button
        </Button>

        <Button variant="secondary" size="large">
          Button
        </Button>

        <Button variant="danger" size="large">
          Button
        </Button>

        <Button variant="success" size="large">
          Button
        </Button>

        <div className="icon-group">

          <Button
            variant="icon-dark"
            size="icon-large"
            iconOnly={<ChevronRight size={18} />}
            />

          <Button
            variant="icon-light"
            size="icon-large"
            iconOnly={<ChevronRight size={18} />}
            />

        </div>

        <Button
          variant="disabled"
          size="large"
          disabled
        >
          Button
        </Button>

        {/* ---------- With Icon ---------- */}

        <div className="row-title">
          With Icon
        </div>

        <Button
          variant="primary"
          size="medium"
          iconRight={<Download size={16} />}
        >
          Button
        </Button>

        <Button
          variant="secondary"
          size="medium"
          iconRight={<ArrowRight size={16} />}
        >
          Button
        </Button>

        <Button
          variant="danger"
          size="medium"
          iconRight={<Trash2 size={16} />}
        >
          Button
        </Button>

        <Button
          variant="success"
          size="medium"
          iconRight={<Check size={16} />}
        >
          Button
        </Button>

        <div className="icon-group">

          <Button
            variant="icon-light"
            size="icon-medium"
            iconOnly={<Settings size={16} />}
            />

          <Button
            variant="icon-light"
            size="icon-medium"
            iconOnly={<Bell size={16} />}
            />

        </div>

        <Button
          variant="disabled"
          size="medium"
          disabled
        >
          Button
        </Button>

        {/* ---------- Loading ---------- */}

        <div className="row-title">
          Loading
        </div>

        <Button
          variant="primary"
          size="medium"
          loading
        >
          Loading...
        </Button>

        <Button
          variant="secondary"
          size="medium"
          loading
        >
          Loading...
        </Button>

        <Button
          variant="danger"
          size="medium"
          loading
        >
          Loading...
        </Button>

        <Button
          variant="success"
          size="medium"
          loading
        >
          Loading...
        </Button>

        <div className="icon-group">

          <Loader2
            className="spinner"
            size={22}
          />

          <Loader2
            className="spinner"
            size={22}
          />

        </div>

        <Button
          variant="disabled"
          size="medium"
          disabled
        >
          Loading...
        </Button>

      </div>

    </section>
  );
}

export default ButtonSection;