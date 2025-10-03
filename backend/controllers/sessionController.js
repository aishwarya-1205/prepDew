const Session = require("../models/Session");
const Question = require("../models/Question");

exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } =
      req.body;

    const userId = req.user._id; // Keep using _id for consistency

    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        });
        return question._id;
      })
    );

    session.questions = questionDocs;
    await session.save();

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error("Error in createSession:", error); // Add logging
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    console.log("getMySessions called, user:", req.user); // Debug log

    // Use _id consistently
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("questions");

    console.log("Found sessions:", sessions.length); // Debug log

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error in getMySessions:", error); // Add logging
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Alternative function name if you want "get-all-sessions" route
exports.getAllSessions = exports.getMySessions; // Alias for the same function

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .exec();

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Error in getSessionById:", error); // Add logging
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Use _id consistently
    if (session.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this session" });
    }

    // First delete all questions linked to this session
    await Question.deleteMany({ session: session._id });

    // Then delete the session
    await session.deleteOne();

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSession:", error); // Add logging
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
