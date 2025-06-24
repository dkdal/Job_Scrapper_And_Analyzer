const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://kapoordhruv22:kapoordhruv22@dividend.j2tui.mongodb.net/");

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  summary: String,
  date: String,
});

const Job = mongoose.model("Job", jobSchema);

// Scrape jobs from Indeed
app.get("/scrape", async (req, res) => {
  try {
    const url = "https://www.indeed.com/jobs?q=software+developer&l=Canada";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jobs = [];

    $(".job_seen_beacon").each((_, element) => {
      const title = $(element).find("h2.jobTitle").text().trim();
      const company = $(element).find(".companyName").text().trim();
      const location = $(element).find(".companyLocation").text().trim();
      const summary = $(element).find(".job-snippet").text().trim();
      const date = $(element).find(".date").text().trim();

      if (title && company) {
        jobs.push({ title, company, location, summary, date });
      }
    });

    await Job.insertMany(jobs);
    res.status(200).json({ message: "Scraped and saved", count: jobs.length });
  } catch (err) {
    console.error(err);
    res.status(500).send("Scraping failed");
  }
});

// Get all jobs
app.get("/jobs", async (req, res) => {
  const jobs = await Job.find().limit(100);
  res.json(jobs);
});

// Basic keyword frequency
app.get("/analysis", async (req, res) => {
  const jobs = await Job.find();
  const keywordMap = {};

  jobs.forEach(job => {
    const words = job.title.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) {
        keywordMap[word] = (keywordMap[word] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  res.json({ topKeywords: sorted });
});

app.listen(5000, () => console.log("Server started on http://localhost:5000"));
