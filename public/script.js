import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmnIwec6sS6AUM1SahaUFFKwW5K1gGm9I",
  authDomain: "ai-summary-buddy.firebaseapp.com",
  projectId: "ai-summary-buddy",
  storageBucket: "ai-summary-buddy.firebasestorage.app",
  messagingSenderId: "701478129065",
  appId: "1:701478129065:web:66e879c53005b3e61c48b8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userImage = document.getElementById('userImage');

const summarizeBtn = document.getElementById('summarizeBtn');
const inputText = document.getElementById('inputText');
const summaryTone = document.getElementById('summaryTone'); 
const resultBox = document.getElementById('resultBox');
const summaryText = document.getElementById('summaryText');
const loading = document.getElementById('loading');
const historyList = document.getElementById('historyList');
const favSidebar = document.getElementById('favSidebar');
const favSidebarBtn = document.getElementById('favSidebarBtn');
const closeFav = document.getElementById('closeFav');
const favList = document.getElementById('favList');


let currentUser = null;

// ==========================================
//  ระบบ Dark / Light Theme
// ==========================================
// แก้ไขส่วน Theme Toggle ให้ทำงานได้ดีขึ้น
const themeToggle = document.getElementById('themeToggle');

function updateThemeUI(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
    }
}

// เช็ค Theme เริ่มต้น
const currentTheme = localStorage.getItem('theme');
updateThemeUI(currentTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
});

// ==========================================
// 1. ระบบ Authentication
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        userName.textContent = user.displayName;
        userImage.src = user.photoURL;
        loadHistoryFromCloud();
    } else {
        currentUser = null;
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

googleLoginBtn.addEventListener('click', async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (error) { alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ"); }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        if (favSidebar) favSidebar.classList.add('hidden');
        if (favList) favList.innerHTML = '';
        
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    } catch (error) {
        console.error(error);
    }
});

// ==========================================
// 2. ระบบดึงข้อมูล ลบ และติดดาว (Firestore)
// ==========================================
async function loadHistoryFromCloud() {
    if (!currentUser) return;
    historyList.innerHTML = 'กำลังโหลดประวัติ...';
    
    try {
        const q = query(collection(db, "users", currentUser.uid, "history"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        updateFavoriteSidebar(querySnapshot);
        
        historyList.innerHTML = ''; 
        if(querySnapshot.empty) {
            historyList.innerHTML = '<p style="color:#888; text-align:center;">ยังไม่มีประวัติการสรุปครับ</p>';
            return;
        }

        querySnapshot.forEach((documentSnapshot) => {
            const data = documentSnapshot.data();
            const docId = documentSnapshot.id; 
            
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const isFav = data.isFavorite || false;
            if (isFav) div.classList.add('is-favorite');
            
            const favIcon = isFav ? '⭐' : '☆';
            const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString('th-TH') : 'กำลังบันทึก...';
            const toneBadge = data.tone ? `<span style="background:#007bff; color:white; padding:2px 5px; border-radius:3px; font-size:10px;">${data.tone}</span>` : '';
            
            div.innerHTML = `
                <div class="history-header">
                    <span class="history-date">${dateStr} ${toneBadge}</span>
                    <div class="history-actions">
                        <button class="fav-btn" data-id="${docId}" data-fav="${isFav}" title="เพิ่มในรายการโปรด">${favIcon}</button>
                        <button class="del-btn" data-id="${docId}" title="ลบทิ้ง">🗑️</button>
                    </div>
                </div>
                <strong>หัวข้อ:</strong> ${data.title}...
                <div class="history-content">${marked.parse(data.summary)}</div>
            `;
            historyList.appendChild(div);
        });

        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const currentFav = e.target.getAttribute('data-fav') === 'true';
                await toggleFavorite(id, currentFav);
            });
        });

        document.querySelectorAll('.del-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if(confirm('คุณแน่ใจหรือไม่ที่จะลบประวัตินี้ออกจากคลาวด์แบบถาวร?')) {
                    await deleteHistoryItem(id);
                }
            });
        });

    } catch (error) {
        historyList.innerHTML = 'เกิดข้อผิดพลาดในการดึงข้อมูล';
    }
}

async function toggleFavorite(docId, currentStatus) {
    try {
        const docRef = doc(db, "users", currentUser.uid, "history", docId);
        await updateDoc(docRef, { isFavorite: !currentStatus });
        loadHistoryFromCloud(); 
    } catch (error) { console.error("Error updating favorite", error); }
}

async function deleteHistoryItem(docId) {
    try {
        const docRef = doc(db, "users", currentUser.uid, "history", docId);
        await deleteDoc(docRef);
        loadHistoryFromCloud(); 
    } catch (error) { console.error("Error deleting document", error); }
}

async function saveToCloud(summary, originalText, selectedTone) {
    if (!currentUser) return;
    try {
        await addDoc(collection(db, "users", currentUser.uid, "history"), {
            title: originalText.substring(0, 40).replace(/\n/g, ' '),
            summary: summary,
            tone: selectedTone, 
            isFavorite: false,  
            createdAt: serverTimestamp() 
        });
        loadHistoryFromCloud();
    } catch (error) { alert("ไม่สามารถบันทึกประวัติลงคลาวด์ได้"); }
}

// เปิด-ปิด Sidebar
favSidebarBtn.addEventListener('click', () => {
    favSidebar.classList.toggle('hidden');
});

closeFav.addEventListener('click', () => {
    favSidebar.classList.add('hidden');
});

// คลิกข้างนอก Sidebar ให้ปิด (Optional)
document.addEventListener('click', (e) => {
    if (!favSidebar.contains(e.target) && !favSidebarBtn.contains(e.target)) {
        favSidebar.classList.add('hidden');
    }
});

function updateFavoriteSidebar(querySnapshot) {
    favList.innerHTML = '';
    let count = 0;

    querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isFavorite) {
            count++;
            const item = document.createElement('div');
            item.className = 'fav-mini-item';
            item.innerHTML = `<strong>📄 ${data.title || 'ไม่มีชื่อ'}</strong>`;
            
            item.onclick = () => {
                const target = document.querySelector(`[data-id="${docSnap.id}"]`);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (window.innerWidth < 768) favSidebar.classList.add('hidden');
            };
            favList.appendChild(item);
        }
    });

    if (count === 0) {
        favList.innerHTML = '<div style="text-align:center; font-size:12px; color:gray; padding:20px;">ไม่มีรายการโปรด</div>';
    }
}
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        favSidebarBtn.classList.remove('hidden'); // แสดงปุ่มดาวเมื่อล็อกอิน
        userName.textContent = user.displayName;
        userImage.src = user.photoURL;
        loadHistoryFromCloud();
    } else {
        currentUser = null;
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
        favSidebarBtn.classList.add('hidden'); // ซ่อนปุ่มดาวเมื่อออกจากระบบ
    }
});
// ==========================================
// 3. ระบบ AI สรุปเนื้อหา
// ==========================================
summarizeBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    const tone = summaryTone.value; 

    if (!text) return alert('กรุณาใส่เนื้อหาที่ต้องการสรุปก่อนครับ!');

    resultBox.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, tone: tone }) 
        });

        const data = await response.json();

        if (response.ok) {
            summaryText.innerHTML = marked.parse(data.summary);
            resultBox.classList.remove('hidden');
            inputText.value = ''; 
            await saveToCloud(data.summary, text, tone); 
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.error);
        }
    } catch (error) {
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้');
    } finally {
        loading.classList.add('hidden');
    }
});

// ==========================================
// 4. ระบบอ่านไฟล์ PDF
// ==========================================
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
const pdfUpload = document.getElementById('pdfUpload');
const fileNameDisplay = document.getElementById('fileName');

pdfUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = `⏳ กำลังอ่านไฟล์: ${file.name}...`;
    fileNameDisplay.style.color = '#007bff';
    inputText.value = ''; 
    inputText.placeholder = 'กำลังสกัดข้อความจาก PDF...';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
        }
        inputText.value = fullText;
        fileNameDisplay.textContent = `✅ ดึงข้อความสำเร็จ! (${pdf.numPages} หน้า)`;
        fileNameDisplay.style.color = '#28a745';
        inputText.placeholder = 'วางเนื้อหา หรืออัปโหลดไฟล์ PDF เพื่อดึงข้อความอัตโนมัติ...';
    } catch (error) {
        alert("ไม่สามารถอ่านไฟล์ PDF นี้ได้ครับ");
        fileNameDisplay.textContent = `❌ อ่านไฟล์ผิดพลาด`;
        fileNameDisplay.style.color = '#dc3545';
    }
});

// ==========================================
// 5. ระบบคัดลอกข้อความ
// ==========================================
const copyBtn = document.getElementById('copyBtn');
copyBtn.addEventListener('click', () => {
    const textToCopy = summaryText.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ คัดลอกสำเร็จ!';
        copyBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.style.backgroundColor = ''; 
        }, 2000);
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`🚀 เซิร์ฟเวอร์ทำงานแล้วที่ http://localhost:${port}`);
    });
}

module.exports = app;