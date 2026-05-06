require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.post('/api/summarize', async (req, res) => {
    const text = req.body.text;
    const tone = req.body.tone || "ทั่วไป";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ error: "หา API Key ไม่เจอในไฟล์ .env" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    
    let toneInstruction = "แบ่งเป็นหัวข้อย่อยๆ และเน้นใจความสำคัญ"; 
    if (tone === "สั้นกระชับ") toneInstruction = "เน้นสรุปให้สั้น กระชับ ขอเฉพาะเนื้อหาเน้นๆ ไม่เอาน้ำ";
    else if (tone === "ละเอียด") toneInstruction = "สรุปอย่างละเอียด อธิบายเคลียร์ๆ พร้อมยกตัวอย่างให้เห็นภาพ";
    else if (tone === "bullet") toneInstruction = "สรุปออกมาเป็นข้อๆ (Bullet points) ให้อ่านง่าย สบายตาที่สุด";
    else if (tone === "วัยรุ่น") toneInstruction = "ใช้ภาษาวัยรุ่น เล่าให้ฟังแบบเป็นกันเอง สนุกสนาน แต่อ่านแล้วจำได้ทันที";

    const prompt = `คุณคือผู้ช่วยสรุปเลกเชอร์ ช่วยสรุปเนื้อหาต่อไปนี้ให้ที โดยมีเงื่อนไขคือ: ${toneInstruction} \n\nเนื้อหาที่ต้องสรุป:\n${text}`;

    for (const modelName of modelsToTry) {
        try {
            console.log(`🚀 กำลังลองใช้โมเดล: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const summary = result.response.text();

            return res.json({ 
                summary: summary,
                modelUsed: modelName
            });

        } catch (error) {
            console.error(`❌ โมเดล ${modelName} มีปัญหา:`, error.message);
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                return res.status(500).json({ error: "AI ทุกตัวไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่ภายหลัง" });
            }
            continue; 
        }
    }
});

app.listen(port, () => {
    console.log(`🟢 เซิร์ฟเวอร์ทำงานแล้วที่ http://localhost:${port}`);
});