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
          fetchUsers(currentPage);
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
    if (field === "actions") return;
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
    {
      label: "학번/ID",
      field: "userId",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "이름",
      field: "userName",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "생년월일",
      field: "userBirth",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "이메일",
      field: "userEmail",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "전화번호",
      field: "userPhone",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "구분",
      field: "userRole",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "학과",
      field: "departmentName",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
    {
      label: "관리",
      field: "actions",
      thClassName: "md:text-center",
      tdClassName: "md:text-center",
    },
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

  const yourUserId = useSelector((state) => state.auth.userId) || "000000000";
  const [isTester, setIstester] = useState(true);

  useEffect(() => {
    setIstester(yourUserId === "000000000");
  }, [yourUserId]);

  return (
    <div className="max-w-7xl mx-auto px-1 py-1 sm:px-2 md:px-4 md:py-8 mt-2 md:mt-10">
      <div className="w-full bg-white shadow-md rounded-md p-2 sm:p-4 md:p-6">
        {isTester && (
          <p className="text-red-500 text-center pb-2 text-xs sm:text-right sm:text-sm md:text-base">
            테스트 유저로 접속하셨습니다.{" "}
            <span className="sm:hidden">
              <br />
            </span>
            일부 권한이 제한됩니다.
          </p>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-2 mb-3 md:pb-3 md:mb-6">
          <h2 className="text-lg font-semibold text-gray-700 md:text-2xl mb-2 md:mb-0">
            사용자 관리
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => !isTester && setIsModalOpen(true)}
              className={`w-full sm:w-auto px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-white rounded transition ${
                !isTester
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={isTester}
            >
              사용자 등록
            </button>
            <button
              onClick={() => !isTester && setIsMultiUploadModalOpen(true)}
              className={`w-full sm:w-auto px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm text-white rounded transition ${
                !isTester
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={isTester}
            >
              일괄 등록
            </button>
          </div>
        </div>
        <div className="flex justify-end mb-3 md:mb-4">
          <input
            type="text"
            placeholder="ID 또는 이름으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs md:px-3 md:py-2 md:text-sm shadow-sm w-full sm:w-auto md:w-64 focus:ring-1 md:focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="hidden md:table-header-group bg-gray-50 text-gray-600 uppercase text-xs md:text-sm leading-normal">
              <tr>
                {tableHeaders.map(({ label, field, thClassName }) => (
                  <th
                    key={label}
                    className={`py-3 px-4 font-semibold border-b border-gray-200 ${
                      thClassName || "md:text-left"
                    }`}
                    onClick={() => handleSort(field)}
                  >
                    {label}
                    {field &&
                      field !== "actions" &&
                      sortField === field &&
                      (sortDir === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="block md:table-row-group text-[0.65rem] md:text-sm text-gray-700">
              {users.dtoList.length === 0 ? (
                <tr className="block md:table-row">
                  <td
                    colSpan={tableHeaders.length}
                    className="block md:table-cell py-6 text-center text-gray-400"
                  >
                    사용자 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                users.dtoList.map((user) => (
                  <tr
                    key={user.userId}
                    className="block w-full mb-2 border border-gray-200 rounded-lg shadow-sm px-2 py-1.5 
                               md:table-row md:shadow-none md:rounded-none md:border-0 md:border-b md:hover:bg-gray-50 md:p-0"
                  >
                    {tableHeaders.map((header) => (
                      <td
                        key={`${user.userId}-${header.field}`}
                        data-label={header.label}
                        className={`
                          block text-left pt-0.5 pb-0.5 relative
                          md:table-cell md:py-3 md:px-4 md:align-middle
                          ${header.tdClassName || "md:text-left"}
                          ${
                            header.field === "userName"
                              ? "order-first font-semibold text-blue-600 text-sm pb-1 mb-1 border-b md:order-none md:font-normal md:text-gray-700 md:text-sm md:border-b-0"
                              : "text-gray-600 md:text-gray-700"
                          } 
                        `}
                        onMouseEnter={() => {
                          if (header.field === "userName") {
                            setHoveredUser(user);
                          }
                        }}
                        onMouseLeave={() => {
                          if (header.field === "userName") {
                            setHoveredUser(null);
                          }
                        }}
                      >
                        {header.field !== "userName" &&
                          header.field !== "actions" && (
                            <span className="font-medium md:hidden mr-1 text-gray-500 text-[0.6rem]">
                              {header.label}:{" "}
                            </span>
                          )}

                        {header.field !== "actions" ? (
                          <span
                            className={`break-words ${
                              header.field === "userName"
                                ? ""
                                : "text-[0.65rem] md:text-sm"
                            }`}
                          >
                            {" "}
                            {/* md:whitespace-nowrap 제거됨 */}
                            {renderUserValue(user, header)}
                          </span>
                        ) : (
                          <div
                            className={`flex flex-row items-center space-x-1 pt-0.5 md:pt-0 ${
                              header.tdClassName &&
                              header.tdClassName.includes("md:text-center")
                                ? "md:justify-center"
                                : "md:justify-start"
                            } ${isTester ? "opacity-50" : ""}`}
                          >
                            <button
                              onClick={() => !isTester && setEditUser(user)}
                              disabled={isTester}
                              className={`w-auto text-white px-1.5 py-0.5 text-[0.6rem] rounded md:px-2 md:py-1 md:text-xs transition ${
                                !isTester
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                            >
                              수정
                            </button>
                            <button
                              onClick={() => !isTester && handleDelete(user)}
                              disabled={isTester}
                              className={`w-auto text-white px-1.5 py-0.5 text-[0.6rem] rounded md:px-2 md:py-1 md:text-xs transition ${
                                !isTester
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                            >
                              삭제
                            </button>
                          </div>
                        )}

                        {header.field === "userName" &&
                          hoveredUser?.userId === user.userId && (
                            <div className="hidden md:block absolute top-0 left-full ml-2 w-20 h-20 md:w-24 md:h-24 bg-white border border-gray-300 rounded-md shadow-lg z-20 overflow-hidden">
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
              fetchUsers(currentPage);
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
