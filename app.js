import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Konfigurasi Firebase Anda
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

// Data Pertanyaan
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

// State Management
let currentStep = 0;
let answersData = {};

// Elemen DOM
const screenIntro = document.getElementById('screen-intro');
const screenQuiz = document.getElementById('screen-quiz');
const screenOutro = document.getElementById('screen-outro');
const btnMulai = document.getElementById('btn-mulai');
const btnNext = document.getElementById('btn-next');
const questionText = document.getElementById('question-text');
const inputArea = document.getElementById('input-area');
const progressBar = document.getElementById('progress-bar');

// Label A, B, C, D, E untuk tombol
const alphabet = ['A', 'B', 'C', 'D', 'E'];

// Mulai Kuis
btnMulai.addEventListener('click', () => {
  screenIntro.classList.remove('active');
  screenQuiz.classList.add('active');
  renderQuestion();
});

// Render Pertanyaan
function renderQuestion() {
  const q = questions[currentStep];
  questionText.innerText = q.text;
  inputArea.innerHTML = '';
  btnNext.disabled = true;
  
  // Update Progress Bar
  progressBar.innerHTML = '';
  for (let i = 0; i < questions.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot' + (i <= currentStep ? ' active' : '');
    progressBar.appendChild(dot);
  }

  // Render Input Type
  if (q.type === 'choice') {
    q.options.forEach((opt, index) => {
      const btn = document.createElement('div');
      btn.className = 'option-btn';
      
      const label = document.createElement('div');
      label.className = 'option-label';
      label.innerText = alphabet[index];
      
      const textNode = document.createTextNode(opt);
      
      btn.appendChild(label);
      btn.appendChild(textNode);
      
      btn.onclick = () => {
        // Hilangkan style selected dari semua opsi
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        // Tambahkan style selected ke yang diklik
        btn.classList.add('selected');
        // Simpan jawaban (Ubah Teks STS, dll menjadi angka untuk database, atau simpan teksnya langsung. Di sini kita simpan teksnya langsung)
        answersData[q.id] = opt;
        btnNext.disabled = false;
      };
      inputArea.appendChild(btn);
    });
  } else if (q.type === 'number') {
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = q.placeholder;
    input.oninput = (e) => {
      answersData[q.id] = e.target.value;
      btnNext.disabled = e.target.value.trim() === '';
    };
    inputArea.appendChild(input);
  }
}

// Tombol Next / Submit
btnNext.addEventListener('click', async () => {
  // Aturan khusus: Jika Q1 dijawab "Tidak", langsung hentikan
  if (currentStep === 0 && answersData['demo_1'] === 'Tidak') {
    tampilkanOutro();
    return;
  }

  // Pindah ke pertanyaan berikutnya atau submit
  if (currentStep < questions.length - 1) {
    currentStep++;
    renderQuestion();
  } else {
    // Tombol di akhir kuis ditekan (Submit)
    btnNext.disabled = true;
    btnNext.innerText = "Mengirim...";
    
    try {
      answersData.waktu_submit = serverTimestamp();
      await addDoc(collection(db, "jawaban_responden"), answersData);
      tampilkanOutro();
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim jawaban. Periksa koneksi Anda.");
      btnNext.disabled = false;
      btnNext.innerText = "Submit Answer";
    }
  }
});

function tampilkanOutro() {
  screenQuiz.classList.remove('active');
  screenOutro.classList.add('active');
}
