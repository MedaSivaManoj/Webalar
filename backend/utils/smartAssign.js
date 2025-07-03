const User = require("../models/user");
const Task = require("../models/Task");

const smartAssign = async () => {
  const users = await User.find();
  const counts = await Promise.all(
    users.map(async (user) => {
      const count = await Task.countDocuments({
        assignedTo: user._id,
        status: { $ne: "Done" },
      });
      return { user, count };
    })
  );

  const leastBusy = counts.reduce((a, b) => (a.count < b.count ? a : b));
  return leastBusy.user;
};

module.exports = smartAssign;
