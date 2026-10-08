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
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWErOEhDXiCyOYh3bggDRLMF7w4xImiKg",
  authDomain: "tanyaaja-17b48.firebaseapp.com",
  databaseURL: "https://tanyaaja-17b48.firebaseio.com",
  projectId: "tanyaaja-17b48",
  storageBucket: "tanyaaja-17b48.appspot.com",
  messagingSenderId: "416065878381",
  appId: "1:416065878381:web:8672bd86cccce067694264",
  measurementId: "G-DSZ87SCW64"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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
let currentUser = null;
let isSubmitted = false;

// DOM Elements
const screenLoading = document.getElementById('screen-loading');
const screenLogin = document.getElementById('screen-login');
const screenIntro = document.getElementById('screen-intro');
const screenQuiz = document.getElementById('screen-quiz');
const screenOutro = document.getElementById('screen-outro');
const screenBlocked = document.getElementById('screen-blocked');

const btnLoginGoogle = document.getElementById('btn-login-google');
const btnMulai = document.getElementById('btn-mulai');
const btnNext = document.getElementById('btn-next');
const questionText = document.getElementById('question-text');
const inputArea = document.getElementById('input-area');
const progressBar = document.getElementById('progress-bar');
const alphabet = ['A', 'B', 'C', 'D', 'E'];

// Fungsi Pindah Layar
function tampilkanScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// Efek Suara Klik (Web Audio API)
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
  } catch (e) {}
}

// Cek Pengisian per Akun (1x Respon)
async function checkAccountRestriction(uid) {
  try {
    const q = query(collection(db, "jawaban_responden"), where("user_uid", "==", uid));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (err) {
    console.error("Gagal memeriksa pembatasan akun:", err);
    return false;
  }
}

// Tangkap Error Hasil Redirect Login
getRedirectResult(auth).catch((error) => {
  console.error("Error redirect login:", error);
  alert("Gagal login dengan Google. Pastikan domain tempat kuis dibuka sudah didaftarkan di Authorized Domains Firebase.");
});

// Listener Status Auth Firebase
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const hasSubmitted = await checkAccountRestriction(user.uid);
    
    if (hasSubmitted) {
      document.getElementById('blocked-email').innerText = user.email;
      tampilkanScreen('screen-blocked');
      isSubmitted = true;
    } else {
      const firstName = user.displayName ? user.displayName.split(" ")[0] : "";
      document.getElementById('user-display-name').innerText = firstName;
      tampilkanScreen('screen-intro');
    }
  } else {
    tampilkanScreen('screen-login');
  }
});

// Tombol Login Google
btnLoginGoogle.addEventListener('click', () => {
  btnLoginGoogle.disabled = true;
  btnLoginGoogle.innerText = "Memproses...";
  try {
    signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Login gagal", error);
    alert("Terjadi kesalahan saat memulai login.");
    btnLoginGoogle.disabled = false;
    btnLoginGoogle.innerHTML = `<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo"> Lanjutkan dengan Google`;
  }
});

// Logika Navigasi Lanjut Soal / Submit
async function handleNextStep() {
  if (currentStep === 0 && answersData['demo_1'] === 'Tidak') {
    selesaikanKuis();
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
      answersData.user_uid = currentUser.uid;
      answersData.user_email = currentUser.email;
      answersData.user_name = currentUser.displayName;
      answersData.waktu_submit = serverTimestamp();

      await addDoc(collection(db, "jawaban_responden"), answersData);
      selesaikanKuis();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim jawaban. Periksa koneksi Anda.");
      btnNext.disabled = false;
      btnNext.innerText = "Selanjutnya";
    }
  }
}

function selesaikanKuis() {
  isSubmitted = true;
  tampilkanScreen('screen-outro');
  history.pushState(null, null, window.location.pathname);
}

// Render Pertanyaan Kuis
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
      
      btn.onclick = () => {
        playClickSound();
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answersData[q.id] = opt;

        // Auto-next setelah 200ms
        setTimeout(() => { handleNextStep(); }, 200);
      };

      inputArea.appendChild(btn);
    });
  } else if (q.type === 'number') {
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

// Event Listeners Navigasi & Keyboard
btnMulai.addEventListener('click', () => {
  playClickSound();
  currentStep = 0;
  tampilkanScreen('screen-quiz');
  history.pushState({ step: currentStep }, "", "?soal=" + currentStep);
  renderQuestion();
});

btnNext.addEventListener('click', () => {
  playClickSound();
  handleNextStep();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (document.getElementById('screen-intro').classList.contains('active')) {
      btnMulai.click();
    } else if (document.getElementById('screen-quiz').classList.contains('active') && !btnNext.disabled && questions[currentStep].type === 'number') {
      btnNext.click();
    }
  }
});

window.addEventListener('popstate', () => {
  if (isSubmitted || !currentUser || document.getElementById('screen-blocked').classList.contains('active')) {
    window.location.replace("about:blank");
    return;
  }

  if (history.state && history.state.step !== undefined) {
    currentStep = history.state.step;
    tampilkanScreen('screen-quiz');
    renderQuestion();
  } else {
    currentStep = 0;
    tampilkanScreen('screen-intro');
  }
});
