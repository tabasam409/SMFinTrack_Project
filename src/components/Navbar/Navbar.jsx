import "./Navbar.css";
import Button from "../Button";
import { Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">

      {/* Left */}
      <div className="navbar-logo">
        <Layers size={30} color="#004C48"/>
        <h2>SMFinTrack</h2>
      </div>

      {/* Center */}
      <nav className="navbar-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it Works</a>
        <a href="#benefits">Benefits</a>
        {/* <a href="#pricing">Pricing</a> */}
        <a href="#about-us">About Us</a>
      </nav>

      {/* Right */}
      <div className="navbar-buttons">
        <Button variant="secondary" onClick={() => navigate("/login")}>
          Login
        </Button>

        <Button variant="primary" onClick={() => navigate("/signup")}>
          Sign Up Free
        </Button>
      </div>

    </header>
  );
}

export default Navbar;