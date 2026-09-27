import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWErOEhDXiCyOYh3bggDRLMF7w4xImiKg",
  authDomain: "tanyaaja-17b48.firebaseapp.com",
  databaseURL: "https://tanyaaja-17b48.firebaseio.com",
  projectId: "tanyaaja-17b48",
  storageBucket: "tanyaaja-17b48.appspot.com",
  messagingSenderId: "416065878381",
  appId: "1:416065878381:web:8672bd86cccce067694264"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const optionsLikert = ["Sangat Tidak Setuju (STS)", "Tidak Setuju (TS)", "Netral (N)", "Setuju (S)", "Sangat Setuju (SS)"];
const questions = [
  { id: 'demo_1', text: 'Apakah Anda pernah berbelanja di Indomaret Bengkong Kolam 11 minimal 2 kali?', type: 'choice', options: ['Ya', 'Tidak'] },
  { id: 'demo_2', text: 'Jenis Kelamin Anda?', type: 'choice', options: ['Laki-laki', 'Perempuan'] },
  { id: 'demo_3', text: 'Berapa usia Anda saat ini?', type: 'number', placeholder: 'Ketik usia Anda (Contoh: 25)' },
  { id: 'demo_4', text: 'Apa pekerjaan Anda saat ini?', type: 'choice', options: ['Pelajar/Mahasiswa', 'Karyawan Swasta', 'Wiraswasta', 'Ibu Rumah Tangga', 'Lainnya'] },
  { id: 'q1', text: 'Produk makanan/minuman yang dijual di gerai ini selalu segar dan tidak kedaluwarsa.', type: 'choice', options: optionsLikert },
  { id: 'q2', text: 'Variasi dan ketersediaan produk harian yang saya butuhkan di gerai ini tergolong lengkap.', type: 'choice', options: optionsLikert },
  { id: 'q3', text: 'Kemasan produk fisik yang dipajang di rak dalam kondisi baik.', type: 'choice', options: optionsLikert },
  { id: 'q4', text: 'Fasilitas gerai (AC, bersih, terang) membuat saya nyaman.', type: 'choice', options: optionsLikert },
  { id: 'q5', text: 'Proses transaksi di kasir dilayani dengan cepat, tepat, dan antrean teratur.', type: 'choice', options: optionsLikert },
  { id: 'q6', text: 'Karyawan sigap dan tanggap membantu ketika saya kesulitan mencari barang.', type: 'choice', options: optionsLikert },
  { id: 'q7', text: 'Karyawan memberikan informasi harga promo secara jujur sesuai label.', type: 'choice', options: optionsLikert },
  { id: 'q8', text: 'Karyawan menyapa, senyum, dan bersikap ramah.', type: 'choice', options: optionsLikert },
  { id: 'q9', text: 'Pengalaman berbelanja di gerai ini sesuai dengan harapan saya.', type: 'choice', options: optionsLikert },
  { id: 'q10', text: 'Secara keseluruhan, saya merasa puas dengan produk dan layanan di gerai ini.', type: 'choice', options: optionsLikert },
  { id: 'q11', text: 'Saya merasa keputusan memilih belanja di gerai ini sudah tepat.', type: 'choice', options: optionsLikert },
  { id: 'q12', text: 'Saya akan terus kembali berbelanja di gerai ini di masa depan.', type: 'choice', options: optionsLikert },
  { id: 'q13', text: 'Saya tetap memilih gerai ini meskipun ada minimarket pesaing lain di sekitar.', type: 'choice', options: optionsLikert },
  { id: 'q14', text: 'Saya bersedia merekomendasikan gerai ini kepada keluarga/teman.', type: 'choice', options: optionsLikert }
];

let currentStep = 0;
let answersData = {};
let userIP = "";
const userAgent = navigator.userAgent;
let isSubmitted = false;

const screenIntro = document.getElementById('screen-intro');
const screenQuiz = document.getElementById('screen-quiz');
const screenOutro = document.getElementById('screen-outro');
const screenBlocked = document.getElementById('screen-blocked');

const btnMulai = document.getElementById('btn-mulai');
const btnNext = document.getElementById('btn-next');
const questionText = document.getElementById('question-text');
const inputArea = document.getElementById('input-area');
const progressBar = document.getElementById('progress-bar');

const alphabet = ['A', 'B', 'C', 'D', 'E'];

// FITUR SUARA: Membuat Suara Klik Menggunakan Web Audio API Bawaan Browser
function playClickSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    console.warn("Audio tidak didukung atau diblokir browser:", e);
  }
}

// 1. Ambil IP Publik
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (err) {
    console.warn("Gagal mengambil IP:", err);
    return "UNKNOWN_IP";
  }
}

// 2. Cek Pembatasan 1x Respon
async function checkSubmissionRestriction() {
  if (localStorage.getItem("indomaret_submitted") === "true") {
    tampilkanBlocked();
    return true;
  }

  userIP = await getUserIP();

  try {
    const q = query(
      collection(db, "jawaban_responden"),
      where("ip_address", "==", userIP),
      where("user_agent", "==", userAgent)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      localStorage.setItem("indomaret_submitted", "true");
      tampilkanBlocked();
      return true;
    }
  } catch (err) {
    console.error("Gagal memeriksa pembatasan Firestore:", err);
  }

  return false;
}

function tampilkanBlocked() {
  screenIntro.classList.remove('active');
  screenQuiz.classList.remove('active');
  screenOutro.classList.remove('active');
  screenBlocked.classList.add('active');
  isSubmitted = true;
}

function tampilkanOutro() {
  screenQuiz.classList.remove('active');
  screenIntro.classList.remove('active');
  screenOutro.classList.add('active');
  
  isSubmitted = true;
  localStorage.setItem("indomaret_submitted", "true");
  history.pushState(null, null, window.location.pathname);
}

// FITUR: Navigasi Lanjut Soal / Submit
async function handleNextStep() {
  if (currentStep === 0 && answersData['demo_1'] === 'Tidak') {
    tampilkanOutro();
    return;
  }

  if (currentStep < questions.length - 1) {
    currentStep++;
    history.pushState({ step: currentStep }, "", "?soal=" + currentStep);
    renderQuestion();
  } else {
    btnNext.disabled = true;
    btnNext.innerText = "Mengirim...";
    btnNext.style.display = 'block';
    
    try {
      answersData.ip_address = userIP;
      answersData.user_agent = userAgent;
      answersData.waktu_submit = serverTimestamp();

      await addDoc(collection(db, "jawaban_responden"), answersData);
      tampilkanOutro();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim jawaban. Periksa koneksi Anda.");
      btnNext.disabled = false;
      btnNext.innerText = "Selanjutnya";
    }
  }
}

// Handle tombol enter
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (screenIntro.classList.contains('active')) {
      btnMulai.click();
    } else if (screenQuiz.classList.contains('active') && !btnNext.disabled && questions[currentStep].type === 'number') {
      btnNext.click();
    }
  }
});

// Handle tombol Back browser
window.addEventListener('popstate', (event) => {
  if (isSubmitted || localStorage.getItem("indomaret_submitted") === "true") {
    window.location.replace("about:blank");
    return;
  }

  if (event.state && event.state.step !== undefined) {
    currentStep = event.state.step;
    screenIntro.classList.remove('active');
    screenOutro.classList.remove('active');
    screenQuiz.classList.add('active');
    renderQuestion();
  } else {
    currentStep = 0;
    screenQuiz.classList.remove('active');
    screenOutro.classList.remove('active');
    screenIntro.classList.add('active');
  }
});

btnMulai.addEventListener('click', () => {
  playClickSound();
  screenIntro.classList.remove('active');
  screenQuiz.classList.add('active');
  currentStep = 0;
  
  history.pushState({ step: currentStep }, "", "?soal=" + currentStep);
  renderQuestion();
});

btnNext.addEventListener('click', () => {
  playClickSound();
  handleNextStep();
});

function renderQuestion() {
  const q = questions[currentStep];
  questionText.innerText = q.text;
  inputArea.innerHTML = '';
  
  progressBar.innerHTML = '';
  for (let i = 0; i < questions.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' + (i <= currentStep ? ' active' : '');
    progressBar.appendChild(dot);
  }

  if (q.type === 'choice') {
    // Sembunyikan tombol selanjutnya karena berpindah otomatis saat opsi ditekan
    btnNext.style.display = 'none';

    q.options.forEach((opt, index) => {
      const btn = document.createElement('div');
      btn.className = 'option-btn';
      
      const label = document.createElement('div');
      label.className = 'option-label';
      label.innerText = alphabet[index];
      
      const textNode = document.createTextNode(opt);
      
      btn.appendChild(label);
      btn.appendChild(textNode);
      
      if (answersData[q.id] === opt) {
        btn.classList.add('selected');
      }
      
      // FITUR: Suara Klik & Otomatis Lanjut
      btn.onclick = () => {
        playClickSound();
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answersData[q.id] = opt;

        // Jeda 200ms agar efek visual tombol & suara sempat terasa
        setTimeout(() => {
          handleNextStep();
        }, 200);
      };

      inputArea.appendChild(btn);
    });
  } else if (q.type === 'number') {
    // Tampilkan tombol selanjutnya khusus untuk pertanyaan isian angka
    btnNext.style.display = 'block';
    btnNext.disabled = true;

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = q.placeholder;
    
    if (answersData[q.id]) {
      input.value = answersData[q.id];
      btnNext.disabled = false;
    }

    input.oninput = (e) => {
      answersData[q.id] = e.target.value;
      btnNext.disabled = e.target.value.trim() === '';
    };
    inputArea.appendChild(input);
    
    setTimeout(() => input.focus(), 100); 
  }
}

// Inisialisasi awal
window.addEventListener('DOMContentLoaded', async () => {
  await checkSubmissionRestriction();
});
