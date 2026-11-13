// import "./Sidebar.css";

// import {
//   Home,
//   Palette,
//   Type,
//   Move,
//   Layers3,
//   Image,
//   MousePointerClick,
//   SquareStack,
//   RectangleHorizontal,
//   CreditCard,
//   LayoutGrid,
//   TrendingUp,
// } from "lucide-react";

// function Sidebar() {
//   return (
//     <aside className="sidebar">
//       {/* ================= Logo ================= */}

//       <div className="sidebar-logo">
//         <div className="logo-box">
//           <Layers3 size={22} strokeWidth={2.3} />
//         </div>

//         <h2>SMFinTrack</h2>
//       </div>

//       {/* ================= Introduction ================= */}

//       <div className="sidebar-section">
//         <p className="sidebar-heading">INTRODUCTION</p>

//         <ul>

//           <li className="active">
//             <Home size={18} />
//             <span>Overview</span>
//           </li>

//           <li>
//             <Palette size={18} />
//             <span>Colors</span>
//           </li>

//           <li>
//             <Type size={18} />
//             <span>Typography</span>
//           </li>

//           <li>
//             <Move size={18} />
//             <span>Spacing</span>
//           </li>

//           <li>
//             <Layers3 size={18} />
//             <span>Shadows</span>
//           </li>

//           <li>
//             <Image size={18} />
//             <span>Icons</span>
//           </li>

//         </ul>
//       </div>

//       {/* ================= Components ================= */}

//       <div className="sidebar-section">

//         <p className="sidebar-heading">COMPONENTS</p>

//         <ul>

//           <li>
//             <MousePointerClick size={18} />
//             <span>Buttons</span>
//           </li>

//           <li>
//             <RectangleHorizontal size={18} />
//             <span>Inputs</span>
//           </li>

//           <li>
//             <SquareStack size={18} />
//             <span>Select</span>
//           </li>

//           <li>
//             <CreditCard size={18} />
//             <span>Cards</span>
//           </li>

//           <li>
//             <LayoutGrid size={18} />
//             <span>Modal / Popup</span>
//           </li>

//         </ul>

//       </div>

//       {/* ================= Examples ================= */}

//       <div className="sidebar-section">

//         <p className="sidebar-heading">EXAMPLES</p>

//         <ul>

//           <li>
//             <LayoutGrid size={18} />
//             <span>Dashboard</span>
//           </li>

//           <li>
//             <RectangleHorizontal size={18} />
//             <span>Transactions</span>
//           </li>

//           <li>
//             <CreditCard size={18} />
//             <span>Budgets</span>
//           </li>

//           <li>
//             <TrendingUp size={18} />
//             <span>Forecast</span>
//           </li>

//         </ul>

//       </div>

//       {/* ================= Bottom Card ================= */}

//       <div className="sidebar-card">

//         <h3>SMFinTrack</h3>

//         <p>
//           Know where it's going,
//           <br />
//           before it's gone.
//         </p>

//         <div className="sidebar-card-image">

//           <div className="card-circle one"></div>

//           <div className="card-circle two"></div>

//           <div className="card-circle three"></div>

//           <div className="card-screen">

//             <div className="chart-line"></div>

//           </div>

//         </div>

//       </div>
//     </aside>
//   );
// }

// export default Sidebar;

import "./Sidebar.css";

import { useState } from "react";

import promoImage from "../../assets/signuppagepic.png";

import {
  Home,
  Palette,
  Type,
  Move,
  Layers3,
  Image,
  MousePointerClick,
  SquareStack,
  RectangleHorizontal,
  CreditCard,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";

function Sidebar() {

  const [active, setActive] = useState("overview");

  const scrollToSection = (id) => {

    setActive(id);

    const section = document.getElementById(id);

    if (section) {

      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };

  return (

    <aside className="sidebar">

      {/* ================= Logo ================= */}

      <div
        className="sidebar-logo"
        onClick={() => scrollToSection("overview")}
      >

        <div className="logo-box">
          <Layers3 size={22} strokeWidth={2.3} />
        </div>

        <h2>SMFinTrack</h2>

      </div>

      {/* ================= INTRODUCTION ================= */}

      <div className="sidebar-section">

        <p className="sidebar-heading">
          INTRODUCTION
        </p>

        <ul>

          <li
            className={active === "overview" ? "active" : ""}
            onClick={() => scrollToSection("overview")}
          >
            <Home size={18} />
            <span>Overview</span>
          </li>

          <li
            className={active === "colors" ? "active" : ""}
            onClick={() => scrollToSection("colors")}
          >
            <Palette size={18} />
            <span>Colors</span>
          </li>

          <li
            className={active === "typography" ? "active" : ""}
            onClick={() => scrollToSection("typography")}
          >
            <Type size={18} />
            <span>Typography</span>
          </li>

          <li
            className={active === "spacing" ? "active" : ""}
            onClick={() => scrollToSection("spacing")}
          >
            <Move size={18} />
            <span>Spacing</span>
          </li>

          {/* <li>
            <Layers3 size={18} />
            <span>Shadows</span>
          </li> */}

          <li
            className={active === "icons" ? "active" : ""}
            onClick={() => scrollToSection("icons")}
          >
            <Image size={18} />
            <span>Icons</span>
          </li>

        </ul>

      </div>

      {/* ================= COMPONENTS ================= */}

      <div className="sidebar-section">

        <p className="sidebar-heading">
          COMPONENTS
        </p>

        <ul>

          <li
            className={active === "buttons" ? "active" : ""}
            onClick={() => scrollToSection("buttons")}
          >
            <MousePointerClick size={18} />
            <span>Buttons</span>
          </li>

          <li
            className={active === "inputs" ? "active" : ""}
            onClick={() => scrollToSection("inputs")}
          >
            <RectangleHorizontal size={18} />
            <span>Inputs</span>
          </li>

          <li
            className={active === "select" ? "active" : ""}
            onClick={() => scrollToSection("select")}
          >
            <SquareStack size={18} />
            <span>Select</span>
          </li>

          <li
            className={active === "cards" ? "active" : ""}
            onClick={() => scrollToSection("cards")}
          >
            <CreditCard size={18} />
            <span>Cards</span>
          </li>

          <li
            className={active === "popup" ? "active" : ""}
            onClick={() => scrollToSection("popup")}
          >
            <LayoutGrid size={18} />
            <span>Modal / Popup</span>
          </li>

        </ul>

      </div>

      {/* ================= EXAMPLES ================= */}

      <div className="sidebar-section">

        <p className="sidebar-heading">
          EXAMPLES
        </p>

        <ul>

          <li>
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </li>

          <li>
            <RectangleHorizontal size={18} />
            <span>Transactions</span>
          </li>

          <li>
            <CreditCard size={18} />
            <span>Budgets</span>
          </li>

          <li>
            <TrendingUp size={18} />
            <span>Forecast</span>
          </li>

        </ul>

      </div>

      {/* ================= Bottom Card ================= */}

      <div className="sidebar-card">

        <div className="sidebar-card-photo-wrapper">
          <img
            src={promoImage}
            alt="SMFinTrack financial overview"
            className="sidebar-card-photo"
          />
        </div>

        <h3>SMFinTrack</h3>

        <p>
          Know where it's going,
          <br />
          before it's gone.
        </p>

      </div>

    </aside>

  );

}

export default Sidebar;