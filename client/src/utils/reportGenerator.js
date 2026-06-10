import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "./dateFormat.js";

const generateReport = (data, type, timeframe) => {
  const { books, users } = data;

  const filterByTimeframe = (items) => {
    if (!items || !Array.isArray(items)) return [];
    if (timeframe === "all") return items;

    const now = new Date();
    const timeframes = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    };

    return items.filter((item) => new Date(item.createdAt) >= timeframes[timeframe]);
  };

  const filteredBooks = filterByTimeframe(books || []);
  const filteredUsers = filterByTimeframe(users || []);

  const ownerId = (book) => {
    const o = book.owner;
    if (!o) return null;
    return typeof o === "object" ? o._id : o;
  };

  const reports = {
    overview: () => ({
      title: "Overview report",
      timestamp: formatDateTimeDDMMYYYY(new Date()),
      timeframe,
      data: {
        totalBooks: filteredBooks.length,
        totalUsers: filteredUsers.length,
        exchangeStats: {
          exchange: filteredBooks.filter((b) => b.exchangeType === "exchange").length,
          free: filteredBooks.filter((b) => b.exchangeType === "free").length,
        },
        userStats: {
          admins: filteredUsers.filter((u) => u.role === "admin").length,
          regularUsers: filteredUsers.filter((u) => u.role === "user").length,
        },
      },
    }),
    properties: () => ({
      title: "Books analysis report",
      timestamp: formatDateTimeDDMMYYYY(new Date()),
      timeframe,
      data: {
        totalCount: filteredBooks.length,
        byCondition: {
          New: filteredBooks.filter((b) => b.condition === "New").length,
          Good: filteredBooks.filter((b) => b.condition === "Good").length,
          Used: filteredBooks.filter((b) => b.condition === "Used").length,
        },
        books: filteredBooks.map((b) => ({
          id: b._id,
          title: b.title,
          author: b.author,
          university: b.university,
          college: b.college,
          category: b.category,
          condition: b.condition,
          exchangeType: b.exchangeType,
          createdAt: b.createdAt ? formatDateDDMMYYYY(b.createdAt) : "",
        })),
      },
    }),
    users: () => ({
      title: "User statistics report",
      timestamp: formatDateTimeDDMMYYYY(new Date()),
      timeframe,
      data: {
        totalUsers: filteredUsers.length,
        byRole: {
          admins: filteredUsers.filter((u) => u.role === "admin").length,
          users: filteredUsers.filter((u) => u.role === "user").length,
        },
        userList: filteredUsers.map((u) => ({
          id: u._id,
          username: u.username,
          email: u.email,
          role: u.role,
          booksCount: (books || []).filter((b) => String(ownerId(b)) === String(u._id)).length,
          joinedAt: u.createdAt ? formatDateDDMMYYYY(u.createdAt) : "",
        })),
      },
    }),
  };

  return reports[type]();
};

const downloadReport = (reportData) => {
  const jsonString = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportData.title.toLowerCase().replace(/\s+/g, "-")}-${reportData.timeframe}-${formatDateDDMMYYYY(new Date()).replace(/\//g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export { generateReport, downloadReport };
