import React, { useCallback, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import UserInfo from "../components/UserInfo";
import { motion } from "framer-motion";

const BasicLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userRole } = useSelector((state) => state.auth);
  const [hoveredMenu, setHoveredMenu] = useState("");

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem("id");
    localStorage.removeItem("pw");
    localStorage.removeItem("role");
    navigate("/member/login");
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white/80 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
        <Link to="/main" className="flex items-center space-x-3">
          <img src="/images/eonLogo.jpg" alt="학교 로고" className="h-14" />
          <div className="text-blue-800 font-extrabold text-3xl leading-tight">
            <div>이온대학교</div>
            <div className="text-xs font-medium tracking-wider">
              EON UNIVERSITY
            </div>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <UserInfo />
          {userId ? (
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-800 text-white text-sm font-semibold py-2 px-5 rounded-lg transition duration-300"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/member/login"
              className="bg-blue-600 hover:bg-blue-800 text-white text-sm font-semibold py-2 px-5 rounded-lg transition duration-300"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* 왼쪽 사이드바 */}
        <nav className="bg-gradient-to-b from-blue-900 to-blue-800 text-white w-64 p-6 flex flex-col space-y-8 shadow-xl rounded-tr-3xl rounded-br-3xl">
          <SectionTitle title={userRole} />

          <SimpleLink
            to="/main/noticelist"
            label="📢 공지사항"
            currentPath={location.pathname}
          />

          <ToggleMenu
            title="🙍‍♂️ 정보조회"
            links={[
              { to: "/main/profile", label: "내 정보 조회" },
              { to: "/main/password", label: "비밀번호 변경" },
            ]}
            currentPath={location.pathname}
            hoveredMenu={hoveredMenu}
            setHoveredMenu={setHoveredMenu}
          />

          {userRole === "STUDENT" && (
            <>
              <ToggleMenu
                title="📋 수강 신청"
                links={[
                  { to: "/main/enrollment", label: "수강신청 목록" },
                  { to: "/main/history", label: "수강신청 내역" },
                  { to: "/main/schedule", label: "시간표 조회" },
                ]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
              <ToggleMenu
                title="📑 성적 조회"
                links={[
                  { to: "/main/grades", label: "현재학기 성적 조회" },
                  { to: "/main/allgrades", label: "전체 성적 조회" },
                  { to: "/main/evaluationlist", label: "강의 평가" },
                ]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
                            <ToggleMenu
                title="✏️ 학적 관리 "
                links={[{ to: "/main/leavereturn", label: "휴 · 복학 신청" }]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
            </>
          )}

          {userRole === "ADMIN" && (
            <>
              <SimpleLink
                to="/main/admin/user-list"
                label="👥 사용자 관리"
                currentPath={location.pathname}
              />
              <ToggleMenu
                title="🏫 학과/과목 관리"
                links={[
                  { to: "/main/admin/departments", label: "학과 관리" },
                  { to: "/main/admin/courses", label: "과목 관리" },
                ]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
              <ToggleMenu
                title="🏢 시설 관리"
                links={[
                  { to: "/main/admin/buildings", label: "건물 관리" },
                  { to: "/main/admin/lecture-rooms", label: "강의실 관리" },
                ]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
              <SimpleLink
                to="/main/admin/users"
                label="🗓 일정 관리"
                currentPath={location.pathname}
              />
                            <ToggleMenu
                title="✏️ 학적 관리 "
                links={[
                  { to: "/main/admin/leave", label: "휴학 승인" },
                  { to: "/main/admin/return", label: "복학 승인" },
                ]}
                currentPath={location.pathname}
                hoveredMenu={hoveredMenu}
                setHoveredMenu={setHoveredMenu}
              />
              <SimpleLink
                to="/main/admin/grades"
                label="📚 성적 집계"
                currentPath={location.pathname}
              />
              
            </>
          )}

          {userRole === "PROFESSOR" && (
            <>
              <SimpleLink
                to="/main/professor/classes"
                label="📖 강의 관리"
                currentPath={location.pathname}
              />
              <SimpleLink
                to="/main/professor/list"
                label="🔎 평가 조회"
                currentPath={location.pathname}
              ></SimpleLink>
              <SimpleLink
                to="/main/professor/grades"
                label="📝 성적 관리"
                currentPath={location.pathname}
              />
              <SimpleLink
                to="/main/professor/msg"
                label="✉️ 문자 발송"
                currentPath={location.pathname}
              />
            </>
          )}

          {userRole !== "PROFESSOR" && (
            <SimpleLink
              to="/main/qnalist"
              label="❓ Q&A"
              currentPath={location.pathname}
            />
          )}
        </nav>

        {/* 오른쪽 본문 */}
        <main className="flex-1 p-10 bg-gray-50 flex flex-col">
          <motion.div
            className="bg-white rounded-3xl shadow-lg p-10 flex-1"
            style={{ minHeight: "calc(100vh - 200px)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <footer className="bg-blue-950 text-gray-300 text-center text-xs py-6">
        01212 서울특별시 한국구 한국산로 12(한국동) 이온대학교 02-123-1234
        <br />
        webmaster@eon.ac.kr
        <br />
        COPYRIGHT © EON UNIVERSITY. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
};

const SectionTitle = ({ title }) => (
  <div className="text-gray-300 text-xs uppercase font-semibold tracking-wide mb-2">
    {title}
    <div className="border-t border-blue-700 my-2" />
  </div>
);

const SimpleLink = ({ to, label, currentPath }) => {
  const isActive = currentPath.startsWith(to);
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded transition space-x-2 ${
        isActive
          ? "bg-blue-700 text-white shadow-inner border-l-4 border-white"
          : "hover:bg-blue-600 hover:text-white transition-colors duration-300"
      }`}
    >
      <span>{label}</span>
    </Link>
  );
};

const ToggleMenu = ({
  title,
  links,
  currentPath,
  hoveredMenu,
  setHoveredMenu,
}) => {
  const shouldBeOpen = links.some((link) => currentPath.startsWith(link.to));
  const isHovered = hoveredMenu === title;
  const isOpen = shouldBeOpen || isHovered;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHoveredMenu(title)}
      onMouseLeave={() => setHoveredMenu("")}
    >
      <button
        className={`w-full text-left flex justify-between items-center px-4 py-2 rounded transition ${
          isOpen
            ? "bg-blue-700 text-white shadow-inner"
            : "hover:bg-blue-600 hover:text-white transition-colors duration-300"
        }`}
      >
        <span>{title}</span>
        <span>{isOpen ? "▼" : "▶"}</span>
      </button>

      <div
        className={`pl-6 overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-80 opacity-100 mt-2" : "max-h-0 opacity-0"
        } space-y-2 text-sm`}
      >
        {links.map((link, idx) => {
          const active = currentPath.startsWith(link.to);
          return (
            <Link
              key={idx}
              to={link.to}
              className={`block px-2 py-1 rounded transition ${
                active
                  ? "bg-blue-600 text-white shadow-inner border-l-4 border-white"
                  : "hover:bg-blue-700 hover:text-white transition-colors duration-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BasicLayout;
