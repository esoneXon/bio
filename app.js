// 1. Import modul Firebase (versi 10 terbaru)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Konfigurasi Firebase Anda
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

// 3. Inisialisasi Firebase dan Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Tangani saat form dikirim
const formKuis = document.getElementById('formKuis');
const tombolSubmit = document.getElementById('tombolSubmit');

formKuis.addEventListener('submit', async (e) => {
  e.preventDefault(); // Mencegah halaman reload

  // Ubah status tombol
  tombolSubmit.disabled = true;
  tombolSubmit.textContent = "Mengirim data...";

  // Ambil nilai dari input form (pastikan ID ini sama dengan yang ada di index.html)
  const inputNama = document.getElementById('nama').value;
  const inputJawaban1 = document.getElementById('jawaban1').value;

  try {
    // Simpan data ke Firestore di koleksi "jawaban_responden"
    await addDoc(collection(db, "jawaban_responden"), {
      nama: inputNama,
      jawaban_1: inputJawaban1,
      waktu_submit: serverTimestamp()
    });

    alert("Berhasil! Jawaban Anda telah terkirim.");
    formKuis.reset(); // Kosongkan form kembali
  } catch (error) {
    console.error("Terjadi kesalahan: ", error);
    alert("Gagal mengirim jawaban. Coba periksa koneksi internet Anda.");
  } finally {
    // Kembalikan tombol seperti semula
    tombolSubmit.disabled = false;
    tombolSubmit.textContent = "Kirim Jawaban";
  }
});
