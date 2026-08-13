import { Link } from "react-router-dom";
import { FaMoon } from "react-icons/fa";
import logo from "../assets/logo.png";
import "./Navbar.css";

function Navbar({ toggleDark }) {
  return (
    <header className="navbar">
      <div className="logo">
        <img src={logo} alt="BM Sciences" />

        <div className="logo-text">
          <h2>BM Sciences</h2>
          <span>علوم الطبيعة والحياة</span>
        </div>
      </div>

      <div className="nav-actions">
        <nav className="nav-links">
          <Link to="/">الرئيسية</Link>
          <Link to="/about">من نحن</Link>
          <Link to="/contact">اتصل بنا</Link>
        </nav>

        <button
          type="button"
          className="dark-btn"
          onClick={toggleDark}
          aria-label="تبديل الوضع الليلي"
          title="تبديل الوضع الليلي"
        >
          <FaMoon />
        </button>
      </div>
    </header>
  );
}

export default Navbar;