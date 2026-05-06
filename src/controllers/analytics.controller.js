import Profile from "../models/profile.model.js";
import Bid from "../models/bid.model.js";
import Usage from "../models/usage.model.js";

// Analytics controller provides aggregated data for dashboard charts,
// exports, custom reports, and university decision-making insights

// 1. Job titles distribution
export const getJobStats = async (req, res) => {

  const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
  const match = {};
  if (programme) match.programme = programme;
  if (year) match.graduationYear = Number(year);
  if (industry) match.industry = industry;

// Aggregate profile records and group them into chart-friendly label/count format
  const data = await Profile.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$jobTitle", "Not Specified"] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json(data);
};

// 2. Certifications count per provider
export const getCertificationStats = async (req, res) => {

  const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
  const match = {};
  if (programme) match.programme = programme;
  if (year) match.graduationYear = Number(year);
  if (industry) match.industry = industry;

  const data = await Profile.aggregate([
    { $match: match },
    { $unwind: "$certifications" },
    {
      $group: {
        _id: { $ifNull: ["$certifications.provider", "Not Specified"] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json(data);
};

// 3. Top companies (employment)
export const getCompanyStats = async (req, res) => {

  const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
  const match = {};
  if (programme) match.programme = programme;
  if (year) match.graduationYear = Number(year);
  if (industry) match.industry = industry;

  const data = await Profile.aggregate([
    { $match: match },
    { $unwind: "$employment" },
    {
      $group: {
        _id: { $ifNull: ["$employment.company", "Not Specified"] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json(data);
};

// 4. Bid trends (OPTIONAL FILTER — leave as is or extend later)
export const getBidTrends = async (req, res) => {
  const data = await Bid.aggregate([
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
};

// 5. API usage stats
export const getUsageStatsAll = async (req, res) => {
  const data = await Usage.aggregate([
    {
      $group: {
        _id: "$endpoint",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.json(data);
};
// 6. Industry distribution
export const getIndustryStats = async (req, res) => {
  const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
  const match = {};
  if (programme) match.programme = programme;
  if (year) match.graduationYear = Number(year);
  if (industry) match.industry = industry;

  const data = await Profile.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$industry", "Not Specified"] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json(data);
};

export const getYearStats = async (req, res) => {
  const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
  const match = {};
  if (programme) match.programme = programme;
  if (year) match.graduationYear = Number(year);
  if (industry) match.industry = industry;

  const data = await Profile.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$graduationYear", "Not Specified"] },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
};
// Generate dashboard summary metrics used by cards and custom reports
export const getSummaryStats = async (req, res) => {
  try {
    const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
    const match = {};
    if (programme) match.programme = programme;
    if (year) match.graduationYear = Number(year);
    if (industry) match.industry = industry;

    // Total Alumni
    const totalAlumni = await Profile.countDocuments(match);

    // Total Certifications
    const certs = await Profile.aggregate([
      { $match: match },
      { $unwind: { path: "$certifications", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $cond: [{ $ifNull: ["$certifications", false] }, 1, 0] } }
        }
      }
    ]);

    // Total Employment Records
    const jobs = await Profile.aggregate([
      { $match: match },
      { $unwind: { path: "$employment", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          total: { $sum: { $cond: [{ $ifNull: ["$employment", false] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      totalAlumni,
      totalCerts: certs[0]?.total || 0,
      totalJobs: jobs[0]?.total || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Aggregate alumni locations to support geographic distribution analysis
export const getLocationStats = async (req, res) => {
  try {
    const { programme, year, industry } = req.query;

// Build reusable filter object so analytics can be filtered by programme, year, and industry
    const match = {};
    if (programme) match.programme = programme;
    if (year) match.graduationYear = Number(year);
    if (industry) match.industry = industry;

    const data = await Profile.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ["$location", "Not Specified"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};