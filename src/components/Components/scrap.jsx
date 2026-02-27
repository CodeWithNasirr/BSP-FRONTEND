import React, { useState } from "react";
import { Container, Button, TextField, Typography, Box, CircularProgress } from "@mui/material";
import axios from "axios";

const WhatsAppScraper = () => {
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const[count,setcount]=useState([])


  const startWhatsApp = async () => {
    setLoading(true);
    try {
      await axios.get("http://127.0.0.1:8000/api/start/");
      alert("WhatsApp Web Started. Please scan QR code."); 
    } catch (error) {
      console.error("Error starting WhatsApp:", error);
    }
    setLoading(false);
  };
  const closeWhatsApp = async () => {
    setLoading(true);
    try {
      await axios.get("http://127.0.0.1:8000/api/close/");
      alert("WhatsApp Web Closed. "); 
    } catch (error) {
      console.error("Error starting WhatsApp:", error);
    }
    setLoading(false);
  };

  const scrapeNumbers = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/scrape/");
      setNumbers(response.data.numbers);
      setcount(response.data.total_numbers);

      console.log(response.data.numbers)
    } catch (error) {
      console.error("Error scraping numbers:", error);
    }
    setLoading(false);
  };

  const downloadNumbers = async () => {
    window.location.href = "http://127.0.0.1:8000/api/downloads/";
  };

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={4}>
        <Typography variant="h4">WhatsApp Group Scraper</Typography>
        <Button variant="contained" color="primary" onClick={startWhatsApp} disabled={loading} sx={{ mt: 2,mx:2 }}>
          {loading ? <CircularProgress size={24} /> : "Start WhatsApp Web"}
        </Button>
     
        <Button variant="contained" color="error" onClick={closeWhatsApp} disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : "Close WhatsApp Web"}
        </Button><br />
     


        <Button variant="contained" color="secondary" onClick={scrapeNumbers} disabled={loading} sx={{ mt: 5 }}>
          {loading ? <CircularProgress size={24} /> : "Scrape Numbers"}
        </Button>

        {Array.isArray(numbers) && numbers.length > 0 &&  (
          <Box mt={2} >
            <Typography variant="h6">Extracted Numbers:{count}</Typography>
            <TextField className="max-h-[200px] overflow-y-auto" multiline fullWidth value={numbers.join("\n")} variant="outlined" />
            <Button variant="contained" color="success" onClick={downloadNumbers} sx={{ mt: 2 }}>
              Download Excel
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default WhatsAppScraper;
