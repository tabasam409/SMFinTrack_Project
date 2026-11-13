import "./Header.css";

function Header() {
  return (
    <header id="overview" className="header">

      <div className="header-left">
        <h1>SMFinTrack Design System</h1>

        <p>
          Re-usable components for building consistent and beautiful interfaces.
        </p>
      </div>

      {/* <div className="header-right">

        <button className="theme-btn">
          <Sun size={20} strokeWidth={2.2} />
        </button>

        <button className="open-modal-btn">
          Open Modal Demo
        </button>

      </div> */}

    </header>
  );
}

export default Header;