import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../api/adminUserApi";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import PageComponent from "../../components/PageComponent";
import BaseModal from "../../components/BaseModal";
import AdminUserCreatePage from "./AdminUserCreatePage";
import AdminUserEditPage from "./AdminUserEditPage";
import useConfirmModal from "../../hooks/useConfirmModal";
import AdminUserMultiUploadPage from "./AdminUserMultiUploadPage";


const AdminUserListPage = () => {
  const dispatch = useDispatch();
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();
  const [users, setUsers] = useState({
    dtoList: [],
    totalPage: 0,
    current: 1,
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("userId");
  const [sortDir, setSortDir] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [isMultiUploadModalOpen, setIsMultiUploadModalOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      const res = await getAllUsers(page, 10, searchQuery, sortField, sortDir);
      setUsers(res.data);
      setCurrentPage(page);
    } catch (err) {
      dispatch(showModal("사용자 목록을 불러오지 못했습니다."));
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchQuery, sortField, sortDir]);

  const handleDelete = (user) => {
    openConfirm(
      `ID: ${user.userId}\n이름: ${user.userName}\n\n이 사용자를 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteUser(user.userId);
          dispatch(showModal("사용자가 성공적으로 삭제되었습니다."));
          fetchUsers(users.current);
        } catch (err) {
          dispatch(
            showModal({
              message: "사용자 삭제 중 오류가 발생했습니다.",
              type: "error",
            })
          );
        }
      }
    );
  };

  const handleSort = (field) => {
    setSortDir(sortField === field && sortDir === "asc" ? "desc" : "asc");
    setSortField(field);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "STUDENT":
        return "학생";
      case "PROFESSOR":
        return "교수";
      case "ADMIN":
        return "관리자";
      default:
        return role;
    }
  };

  const tableHeaders = [
    { label: "학번/ID", field: "userId", desktopAlignment: "sm:text-center" },
    { label: "이름", field: "userName", desktopAlignment: "sm:text-left" },
    {
      label: "생년월일",
      field: "userBirth",
      desktopAlignment: "sm:text-center",
    },
    { label: "이메일", field: "userEmail", desktopAlignment: "sm:text-center" },
    {
      label: "전화번호",
      field: "userPhone",
      desktopAlignment: "sm:text-center",
    },
    { label: "구분", field: "userRole", desktopAlignment: "sm:text-center" },
    {
      label: "학과",
      field: "departmentName",
      desktopAlignment: "sm:text-center",
    },
    { label: "관리", field: "actions", desktopAlignment: "sm:text-center" },
  ];

  const renderUserValue = (user, header) => {
    switch (header.field) {
      case "userId":
        return user.userId;
      case "userName":
        return user.userName;
      case "userBirth":
        return user.userBirth;
      case "userEmail":
        return user.userEmail || "-";
      case "userPhone":
        return user.userPhone || "-";
      case "userRole":
        return getRoleLabel(user.userRole);
      case "departmentName":
        return user.departmentName || "-";
      default:
        return null;
    }
  };

  /* 테스트 아이디 권한 제약을 위한 코드 추가 */

  // 테스트 유저 여부 체크를 위한 상수 선언
  const yourUserId = useSelector((state) => state.auth.userId) || "000000000";
  const [isTester, setIstester] = useState(true);
  useEffect(()=>{
    if(yourUserId == "000000000"){
      setIstester(true);
      console.log("테스트 유저", isTester);
    } else {
      setIstester(false);
      console.log("일반 유저", isTester)
    }
  }, [])
  return (
    <div className="w-3/5 mx-auto sm:w-full mt-4 sm:mt-6 md:mt-10">
      <div className="w-full sm:max-w-5xl sm:mx-auto px-2 py-3 sm:px-4 sm:py-6 md:px-6 md:py-8 bg-white shadow-md rounded-md mb-8">
        {/* 테스터인 경우, 안내 메시지 추가 */}
        <p className={`text-red-500 sm:text-right pb-3 sm:text-base text-xs ${!isTester ? 'hidden' : ''}`}>테스트 유저로 접속하셨습니다. 일부 권한이 제한됩니다.</p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 mb-4 sm:mb-6">
          {/* 테스트 유저인 경우, 등록 버튼 비활성화 */}
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
            사용자 관리
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => {if(!isTester){
               setIsModalOpen(true) 
              }}}
              className={`w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-white rounded ${!isTester ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed'} transition text-sm`
            }>
              사용자 등록
            </button>
            <button
              onClick={() => {if(!isTester){
               setIsMultiUploadModalOpen(true) 
              }}}
              className={`w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 text-white rounded transition text-sm ${!isTester ? 'bg-yellow-600 hover:bg-yellow-800' : 'bg-gray-400 cursor-not-allowed'}`
          }>
              일괄 등록
            </button>
          </div>
        </div>
        <div className="flex justify-end mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="ID 또는 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 shadow-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full sm:min-w-full sm:table-auto">
            <thead className="hidden sm:table-header-group bg-gray-50 text-gray-600 uppercase text-xs leading-normal border">
              <tr>
                {tableHeaders.map(({ label, field, desktopAlignment }) => (
                  <th
                    key={label}
                    className={`py-3 px-4 cursor-pointer border-b ${
                      field !== "actions" ? "text-left" : "text-center"
                    } ${desktopAlignment} `}
                    onClick={() =>
                      field !== "actions" && field !== null && handleSort(field)
                    }
                  >
                    {label}
                    {field !== "actions" &&
                      field !== null &&
                      sortField === field &&
                      (sortDir === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="block sm:table-row-group text-gray-700 text-sm border">
              {users.dtoList.length === 0 ? (
                <tr className="block sm:table-row w-full">
                  
                  <td
                    colSpan={tableHeaders.length}
                    className="block sm:table-cell py-6 text-center text-gray-400 text-xs sm:text-sm w-full"
                  >
                    사용자 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                users.dtoList.map((user) => (
                  <tr
                    key={user.userId}
                    className="block w-full mb-3 border border-gray-200 rounded-lg shadow-md px-3 py-2 hover:bg-gray-50 
                               sm:table-row sm:shadow-none sm:rounded-none sm:border-0 sm:border-b sm:border-gray-200 sm:p-0 sm:hover:bg-gray-100"
                  >
                    {tableHeaders.map((header) => (
                      <td
                        key={`${user.userId}-${header.field}`}
                        data-label={header.label}
                        className={`
                          ${
                            header.field === "userName"
                              ? "block order-first sm:order-none font-bold text-blue-700 sm:text-gray-700 pb-1 mb-1 border-b sm:border-b-0 sm:pb-2 sm:mb-0 text-base sm:text-sm sm:font-normal"
                              : "block pt-0.5 pb-0.5 text-xs sm:text-sm"
                          }
                          sm:table-cell sm:h-12 sm:py-2 sm:px-4 sm:align-middle 
                          ${header.desktopAlignment}
                        `}
                        onMouseEnter={() =>
                          header.field === "userName" && setHoveredUser(user)
                        }
                        onMouseLeave={() =>
                          header.field === "userName" && setHoveredUser(null)
                        }
                      >
                        {header.field !== "userName" &&
                          header.field !== "actions" && (
                            <span className="font-medium sm:hidden mr-1 text-gray-500">
                              {header.label}:{" "}
                            </span>
                          )}
                        {header.field !== "actions" ? (
                          <span className="break-words">
                            {renderUserValue(user, header)}
                          </span>
                        ) : (
                          <div className={`flex flex-row items-center justify-start space-x-1 sm:justify-center sm:space-x-1 pt-0.5 sm:pt-0 ${!isTester ? '' : 'hidden'}`}>
                            <button
                              onClick={() => setEditUser(user)}
                              className="w-14 sm:w-auto text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-xs"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="w-14 sm:w-auto text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                        {header.field === "userName" &&
                          hoveredUser?.userId === user.userId && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white border-2 border-blue-200 rounded-md shadow-lg z-20 overflow-hidden">
                              <img
                                src={
                                  hoveredUser.userImgUrl
                                    ? `https://www.eonuniversity.co.kr${hoveredUser.userImgUrl}`
                                    : "/images/noImage.jpg"
                                }
                                alt="프로필"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PageComponent
          currentPage={users.current}
          totalPage={users.totalPage}
          onPageChange={(page) => fetchUsers(page)}
        />

        <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <AdminUserCreatePage
            onSuccess={() => {
              fetchUsers(1);
              setIsModalOpen(false);
            }}
            onClose={() => setIsModalOpen(false)}
          />
        </BaseModal>

        <BaseModal isOpen={!!editUser} onClose={() => setEditUser(null)}>
          <AdminUserEditPage
            user={editUser}
            onSuccess={() => {
              fetchUsers(users.current);
              setEditUser(null);
            }}
            onClose={() => setEditUser(null)}
          />
        </BaseModal>

        <BaseModal
          isOpen={isMultiUploadModalOpen}
          onClose={() => setIsMultiUploadModalOpen(false)}
        >
          <AdminUserMultiUploadPage
            onSuccess={() => {
              fetchUsers(1);
              setIsMultiUploadModalOpen(false);
            }}
            onClose={() => setIsMultiUploadModalOpen(false)}
          />
        </BaseModal>

        {ConfirmModalComponent}
      </div>
    </div>
  );
};
export default AdminUserListPage;
