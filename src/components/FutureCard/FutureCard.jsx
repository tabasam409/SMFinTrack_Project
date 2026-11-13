import './FutureCard.css';

const FutureCard = ({ icon, title, description }) => {
  return (
    <div className="future-card">
      <div className="future-card-icon">{icon}</div>
      <h3 className="future-card-title">{title}</h3>
      <p className="future-card-desc">{description}</p>
      <a href="#" className="future-card-link">Learn more →</a>
    </div>
  );
};

export default FutureCard;