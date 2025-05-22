import React, { useCallback, useState, useEffect } from "react"; 
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../slices/authSlice";
import UserInfo from "../components/UserInfo"; 
import { motion, AnimatePresence } from "framer-motion"; 

// 아이콘 추가 (예시: Heroicons)
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const BasicLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userRole } = useSelector((state) => state.auth);
  const [hoveredMenu, setHoveredMenu] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 모바일 메뉴 상태

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem("id");
    localStorage.removeItem("pw");
    localStorage.removeItem("role");
    navigate("/member/login");
    setIsMobileMenuOpen(false); // 로그아웃 시 모바일 메뉴 닫기
  }, [dispatch, navigate]);

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-md p-3 sm:p-4 flex justify-between items-center sticky top-0 z-50">
        <Link to="/main" className="flex items-center space-x-2 sm:space-x-3">
          <img
            src="/images/eonLogo.jpg"
            alt="학교 로고"
            className="h-10 sm:h-14"
          />
          <div className="text-blue-800 font-extrabold leading-tight">
            {/* 모바일에서는 한 줄로, sm 이상에서는 두 줄로 */}
            <div className="text-xl sm:text-3xl">이온대학교</div>
            <div className="text-[10px] sm:text-xs font-medium tracking-wider hidden sm:block">
              EON UNIVERSITY
            </div>
          </div>
        </Link>

        {/* 데스크탑용 UserInfo 및 로그아웃/로그인 버튼 */}
        <div className="hidden md:flex items-center space-x-4">
          <UserInfo />
          {userId ? (
            <button
              onClick={handleLogout}
              className="bg-blue-600 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-5 rounded-lg transition duration-300"
            >
              로그아웃
            </button>
          ) : (
            <Link
              to="/member/login"
              className="bg-blue-600 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold py-2 px-3 sm:px-5 rounded-lg transition duration-300"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 모바일용 햄버거 버튼 */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-blue-800 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      {/* 모바일 메뉴 (화면 전체를 덮도록 수정) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 pt-20 flex flex-col space-y-6 overflow-y-auto md:hidden"
          >
            {/* 모바일 메뉴 상단 */}
            <div className="mb-4 p-4 bg-blue-200 rounded-lg">
              <UserInfo isMobile={true} />{" "}
              {userId ? (
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 bg-blue-700 hover:bg-blue-900 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition duration-300"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to="/member/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center mt-3 bg-blue-700 hover:bg-blue-900 text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition duration-300"
                >
                  로그인
                </Link>
              )}
            </div>

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
              isMobile={true}
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
                  isMobile={true}
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
                  isMobile={true}
                />
                <ToggleMenu
                  title="✏️ 학적 관리 "
                  links={[{ to: "/main/leavereturn", label: "휴 · 복학 신청" }]}
                  currentPath={location.pathname}
                  hoveredMenu={hoveredMenu}
                  setHoveredMenu={setHoveredMenu}
                  isMobile={true}
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
                  isMobile={true}
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
                  isMobile={true}
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
                  isMobile={true}
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
                />
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        {/* 왼쪽 사이드바 - md 이상에서만 보임 */}
        <nav className="hidden md:block bg-gradient-to-b from-blue-900 to-blue-800 text-white w-60 lg:w-64 p-4 sm:p-6 flex-col space-y-6 shadow-xl rounded-tr-3xl rounded-br-3xl">
          <SectionTitle title={userRole} />
          {/* 메뉴 링크들 ... (기존과 동일, 필요시 isMobile 같은 prop으로 스타일 분기 가능) */}
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
              />
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
        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-gray-50 flex flex-col">
          {/* 본문 컨테이너 패딩 및 최소 높이 조정 */}
          <motion.div
            className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg p-4 sm:p-6 md:p-10 flex-1"
            style={{
              minHeight: `calc(100vh - ${isMobileMenuOpen ? "80px" : "160px"})`,
            }} 
            key={location.pathname} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* 푸터 */}
      <footer className="bg-blue-950 text-gray-300 text-center text-[10px] sm:text-xs py-4 sm:py-6 px-2">
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

const SimpleLink = ({ to, label, currentPath, onClick }) => {
  const isActive = currentPath.startsWith(to);
  return (
    <Link
      to={to}
      onClick={onClick} // 메뉴 클릭 시 닫기 위함
      className={`flex items-center px-3 py-2.5 sm:px-4 sm:py-2 rounded-md transition space-x-2 text-sm sm:text-base ${
        isActive
          ? "bg-blue-700 text-white shadow-inner border-l-4 border-blue-300"
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
  isMobile,
  onLinkClick,
}) => {
  const isCurrentPathInLinks = links.some((link) =>
    currentPath.startsWith(link.to)
  );
  // 모바일에서는 클릭으로만, 데스크탑에서는 호버 + 현재 경로로 열림 상태 결정
  const [mobileToggleOpen, setMobileToggleOpen] =
    useState(isCurrentPathInLinks);

  const isHovered = !isMobile && hoveredMenu === title; 
  const isOpen = isMobile
    ? mobileToggleOpen
    : isCurrentPathInLinks || isHovered;

  const handleToggle = () => {
    if (isMobile) {
      setMobileToggleOpen(!mobileToggleOpen);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => !isMobile && setHoveredMenu(title)} 
      onMouseLeave={() => !isMobile && setHoveredMenu("")} 
    >
      <button
        onClick={handleToggle} 
        className={`w-full text-left flex justify-between items-center px-3 py-2.5 sm:px-4 sm:py-2 rounded-md transition text-sm sm:text-base ${
          isOpen && !isMobile 
            ? "bg-blue-700 text-white shadow-inner"
            : isMobile && isOpen 
            ? "bg-blue-700 text-white"
            : "hover:bg-blue-600 hover:text-white transition-colors duration-300"
        }`}
      >
        <span>{title}</span>
        <span>{isOpen ? "▼" : "▶"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`pl-4 sm:pl-6 overflow-hidden`} 
          >
            <div className="pt-2 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              {" "}
              {/* 내부 링크 간격 */}
              {links.map((link, idx) => {
                const active = currentPath.startsWith(link.to);
                return (
                  <Link
                    key={idx}
                    to={link.to}
                    onClick={onLinkClick} 
                    className={`block px-2 py-1.5 sm:px-2 sm:py-1 rounded-md transition ${
                      active
                        ? "bg-blue-600 text-white shadow-inner border-l-4 border-blue-300"
                        : "hover:bg-blue-700 hover:text-white transition-colors duration-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BasicLayout;
