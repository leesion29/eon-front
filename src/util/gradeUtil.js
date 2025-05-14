export const convertGradeLabel = (grade) => {
    const map = {
      A_PLUS: "A+",
      A0: "A",
      B_PLUS: "B+",
      B0: "B",
      C_PLUS: "C+",
      C0: "C",
      D_PLUS: "D+",
      D0: "D",
      F: "F",
    };
    return map[grade] || grade;
  };