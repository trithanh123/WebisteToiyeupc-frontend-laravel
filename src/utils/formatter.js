
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "";
  return amount.toLocaleString("vi-VN") + " đ";
};

export const truncateText = (text, maxLength = 60) => {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
