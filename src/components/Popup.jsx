import "./Popup.css";

function Popup({

  children,

  className = "",

}) {

  return (

    <div
      className={`popup-card ${className}`}
    >

      {children}

    </div>

  );

}

export default Popup;