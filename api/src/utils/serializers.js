/** One consistent shape for users and books across every endpoint. */
export const publicUser = (u) => ({
  _id: String(u._id),
  username: u.username,
  email: u.email,
  avatar: u.avatar || "",
  role: u.role,
  createdAt: u.createdAt,
});

const publicOwner = (owner) => {
  if (!owner) return null;
  if (owner._id) return { _id: String(owner._id), username: owner.username, avatar: owner.avatar || "" };
  return { _id: String(owner), username: "", avatar: "" };
};

/** Never exposes the owner's email address. */
export const publicBook = (b) => ({
  _id: String(b._id),
  title: b.title,
  author: b.author,
  category: b.category,
  condition: b.condition,
  exchangeType: b.exchangeType,
  status: b.status || "available",
  description: b.description,
  university: b.university,
  college: b.college,
  images: (b.images || []).map((img) => ({ _id: String(img._id), url: img.url })),
  owner: publicOwner(b.owner),
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});
