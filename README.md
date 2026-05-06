# 🤖 AI Summary Buddy

**AI Summary Buddy** เป็นเว็บแอปพลิเคชันที่ใช้ AI ในการช่วยสรุปใจความสำคัญจากข้อความหรือบทความต่างๆ เพื่อให้คุณอ่านเนื้อหาได้รวดเร็วและกระชับมากยิ่งขึ้น (สามารถปรับแก้ไขคำอธิบายนี้ให้ตรงกับแอปของคุณได้)

🌍 **Live Demo:** [https://ai-summary-buddy.vercel.app](https://ai-summary-buddy.vercel.app)

---

## 📂 โครงสร้างของโปรเจกต์ (Project Structure)

โปรเจกต์นี้ถูกออกแบบมาในรูปแบบ Client-Server แบบเรียบง่าย:

- `/public`: เก็บไฟล์ Front-end ทั้งหมด (HTML, CSS, JavaScript แบบฝั่งไคลเอนต์)
- `server.js`: ไฟล์ Back-end เซิร์ฟเวอร์หลัก (Node.js) ที่ทำหน้าที่รับส่งข้อมูลและเรียกใช้ AI API
- `package.json`: จัดการรายการ Dependencies ของ Node.js
- `vercel.json`: ไฟล์การตั้งค่าสำหรับการ Deploy ขึ้นระบบ Vercel Serverless Functions

---

## ✨ ฟีเจอร์หลัก (Features)

- 📝 สรุปข้อความและ pdf ให้กระชับ
- ⚡ ประมวลผลรวดเร็วผ่าน AI
- 🌐 ส่วนติดต่อผู้ใช้ (UI) ใช้งานง่าย รองรับการแสดงผลบนเว็บ
- 🚀 พร้อมสำหรับการ Deploy ผ่านแพลตฟอร์ม Vercel

---

## 🛠️ วิธีการติดตั้งและรันโปรเจกต์บนเครื่อง (Local Setup)

หากคุณต้องการรันโปรเจกต์นี้ในเครื่องของคุณเอง ให้ทำตามขั้นตอนดังนี้:

**สิ่งที่ต้องมี (Prerequisites):**
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 16 หรือสูงกว่า)

**ขั้นตอนการรัน:**
1. Clone โปรเจกต์นี้ลงมาที่เครื่องของคุณ:
   ```bash
   git clone https://github.com/nogard-ft/AI-summary-buddy.git
2. เข้าไปที่โฟลเดอร์ของโปรเจกต์:
    ```bash
    cd AI-summary-buddy
3. ติดตั้ง Dependencies ที่จำเป็น:
    ```bash
    npm install
4. สร้างไฟล์ ``` .env ``` (หากมีการใช้ API Key สำหรับ AI เช่น OpenAI API):
    ```bash
    API_KEY=your_api_key_here
    PORT=3000
5. เริ่มต้นการทำงานของเซิร์ฟเวอร์:
    ```bash
    npm start
6. เปิดเบราว์เซอร์แล้วไปที่: ``` http://localhost:3000 ```
---

## 🚀 การ Deploy ขึ้นเซิร์ฟเวอร์ (Deployment)

โปรเจกต์นี้ได้ตั้งค่า `vercel.json` ไว้เรียบร้อยแล้ว ทำให้คุณสามารถนำไป Deploy บน [Vercel](https://vercel.com/) ได้ฟรีและง่ายดาย:

1. สมัครสมาชิกและเข้าสู่ระบบ **Vercel**
2. กดปุ่ม **Add New...** > **Project**
3. ทำการ Import โปรเจกต์ `AI-summary-buddy` จาก GitHub Repository ของคุณ
4. ในหน้า Configure Project ก่อนกด Deploy ให้เปิดหัวข้อ **Environment Variables**
5. เขียนชื่อ `` ลงช่อง `key` และใส่ `key` ในไฟล์ `.env` ของคุณลงไปในช่อง `value`
6. กดปุ่ม **Deploy** แล้วรอระบบดำเนินการ เมื่อเสร็จสิ้นคุณจะได้ URL เว็บของคุณ

---
## 🔥 ติดตั้ง firebase
1. เข้าไปที่เว็บ https://console.firebase.google.com/
2. จิ้มไปที่ Security แล้วคลิ้กไปที่ Authentication
3. กด Get started แล้วคลิ้กไปที่ settings บนแถบด้านบน
4. คลิ้กไปที่ Authorized domains
5. กดปุ่ม Add domain
6. พิมพ์ URL เว็บของคุณลงไป
7. กดไปที่ Sign-in method ในแถบด้านบน
8. ในหัวข้อ Sign-in providers ให้กดไปที่ Google
9. กดปุ่มสวิตช์ Enable ที่มุมขวาบน
10. ใส่ email ตัวเองลงช่อง Support email for project
11. กดปุ่ม Save
12. กลับไปที่หน้าหลักแล้วกด Add project
13. พอเข้ามาในหน้าโปรเจกต์ของคุณแล้ว ให้ดูตรงกลางหน้าจอ จะมีไอคอนกลมๆ หลายอัน ให้คลิกที่ไอคอน `</>` (Web) เพื่อลงทะเบียนเว็บแอป
14. ตั้งชื่อแอป แล้วกด Register app
15. รอสักครู่ ระบบจะโชว์โค้ดที่มีคำว่า `const firebaseConfig = { ... }` ขึ้นมา ให้คุณ Copy โค้ดส่วนนี้เก็บไว้
16. เข้าไปที่ไฟล์ script.js ใน folder public
17. แทนที่บรรทัดที่ 5-12 ด้วย firebaseConfig ของคุณ
18. เข้าไปที่ firestore 
19. กด create database
20. กด next ให้หมดตอนถึง configure ให้กด start in test mode แล้วกด create
21. กลับเข้าไปที่ project ใน vercel แล้วกดเข้าไปที่ domain พร้อมใช้งาน
---