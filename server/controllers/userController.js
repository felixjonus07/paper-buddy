const Fee = require('../models/Fee');
const User = require('../models/User');

const getMyFees = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('groups');
    const groupIds = user.groups.map(g => g._id);

    // Get fees assigned to the user directly, or assigned to any of their groups
    const fees = await Fee.find({
      $or: [
        { assignedToUser: req.user._id },
        { assignedToGroup: { $in: groupIds } }
      ]
    }).populate('assignedToGroup', 'name');

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyFees };
