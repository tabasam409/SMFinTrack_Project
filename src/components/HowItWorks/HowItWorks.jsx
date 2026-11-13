import "./HowItWorks.css";
import { UploadCloud, Waypoints, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: <UploadCloud size={26} />,
    title: "Upload Statement",
    desc: "Upload your bank statement (CSV/Excel) securely.",
  },
  {
    number: 2,
    icon: <Waypoints size={26} />,
    title: "We Analyze & Predict",
    desc: "We categorize, detect subscriptions, and predict your next month spending.",
  },
  {
    number: 3,
    icon: <ShieldCheck size={26} />,
    title: "You Stay In Control",
    desc: "Get insights, alerts, and stay ahead of your budget.",
  },
];

function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="how-header">
        <span className="how-eyebrow">HOW IT WORKS</span>
        <h2 className="how-heading">Get started in 3 simple steps</h2>
      </div>

      <div className="how-steps">
        {steps.map((step, i) => (
          <div className="how-step-wrapper" key={step.number}>
            <div className="how-step">
              <div className="how-icon-wrap">
                <span className="how-number">{step.number}</span>
                <div className="how-icon">{step.icon}</div>
              </div>
              

              <div className="how-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>

            {i < steps.length - 1 && <div className="how-arrow">⋯➔</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;