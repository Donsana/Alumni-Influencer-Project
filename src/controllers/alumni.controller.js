import Profile from "../models/profile.model.js";

// Retrieve alumni records using optional filters from query parameters
// Populates user email from the User collection while keeping profile data separate
export const getAlumni = async (req, res) => {
  try {
    const { programme, year, industry } = req.query;

// Build dynamic MongoDB filter object based on selected frontend filters
    const match = {};
    if (programme) match.programme = programme;
    if (year) match.graduationYear = Number(year);
    if (industry) match.industry = industry;

    const data = await Profile.find(match)
      .populate("userId", "email")
      .select("name programme industry graduationYear")
      .limit(100);

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};