import { BetaAnalyticsDataClient } from "@google-analytics/data";

export const getAnalyticsData = async (req, res) => {
  try {
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA4_CLIENT_EMAIL,
        private_key: process.env.GA4_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
    });
    const PROPERTY_ID = process.env.GA4_PROPERTY_ID;
    const [response] = await client.runReport({
      property: `properties/${PROPERTY_ID}`,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }],
      dateRanges: [{ startDate: startDate, endDate: "today" }],
    });

    res.status(200).json(response.rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching GA data");
  }
};
