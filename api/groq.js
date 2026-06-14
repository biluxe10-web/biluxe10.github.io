export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await groqResponse.json();

    console.log("Groq Status:", groqResponse.status);
    console.log("Groq Response:", JSON.stringify(data));

    return res.status(groqResponse.status).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
