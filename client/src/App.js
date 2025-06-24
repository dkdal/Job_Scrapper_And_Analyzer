import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

function App() {
  const [jobs, setJobs] = useState([]);
  const [analysis, setAnalysis] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/jobs").then(res => setJobs(res.data));
    axios.get("http://localhost:5000/analysis").then(res => setAnalysis(res.data.topKeywords));
  }, []);

  const data = {
    labels: analysis.map(item => item[0]),
    datasets: [
      {
        label: "Top Keywords in Job Titles",
        data: analysis.map(item => item[1]),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Job Postings</h1>
      <button onClick={() => axios.get("http://localhost:5000/scrape")}>Scrape Jobs</button>
      <h2>Jobs Found: {jobs.length}</h2>
      <ul>
        {jobs.slice(0, 5).map((job, idx) => (
          <li key={idx}>
            <b>{job.title}</b> at {job.company} – {job.location}
          </li>
        ))}
      </ul>
      <h2>Analysis</h2>
      <div style={{ maxWidth: 600 }}>
        <Bar data={data} />
      </div>
    </div>
  );
}

export default App;
