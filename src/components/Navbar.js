// components/Navbar.jsx
import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // 햄버거/닫기 아이콘

const Navbar = ({ name, onListClick, onEditClick, onDelClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">{name}</h1>

      {/* 데스크탑 메뉴 */}
      <ul className="hidden md:flex gap-6">
        <li>
          <p
            className="cursor-pointer hover:text-yellow-300"
            onClick={() => {
              onListClick();
            }}
          >
            List
          </p>
        </li>
        <li>
          <p
            className="cursor-pointer hover:text-yellow-300"
            onClick={() => {
              onEditClick();
            }}
          >
            Edit
          </p>
        </li>
        <li>
          <p
            className="cursor-pointer hover:text-yellow-300"
            onClick={() => {
              onDelClick();
            }}
          >
            Delete
          </p>
        </li>
      </ul>

      {/* 햄버거 버튼 (모바일용) */}
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* 모바일 메뉴 */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center gap-10 transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <p
          className="cursor-pointer hover:text-yellow-300"
          onClick={() => {
            setMenuOpen(false);
            onListClick();
          }}
        >
          List
        </p>
        <p
          className="cursor-pointer hover:text-yellow-300"
          onClick={() => {
            setMenuOpen(false);
            onEditClick();
          }}
        >
          Edit
        </p>
        <p
          className="cursor-pointer hover:text-yellow-300"
          onClick={() => {
            setMenuOpen(false);
            onDelClick();
          }}
        >
          Delete
        </p>
        <p
          className="cursor-pointer hover:text-yellow-300"
          onClick={() => setMenuOpen(false)}
        >
          Close
        </p>
      </div>
    </nav>
  );
};

export default Navbar;
