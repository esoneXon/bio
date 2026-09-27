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

  // Ubah status tombol agar tidak bisa diklik berkali-kali
  tombolSubmit.disabled = true;
  tombolSubmit.textContent = "Mengirim data...";

  // Gunakan FormData untuk mengambil seluruh input secara otomatis
  const formData = new FormData(formKuis);
  
  // Ubah input menjadi format Object JSON agar mudah dikirim ke Firebase
  const dataKuesioner = Object.fromEntries(formData.entries());
  
  // Tambahkan pencatat waktu otomatis dari server Firebase
  dataKuesioner.waktu_submit = serverTimestamp();

  try {
    // Simpan data ke Firestore di koleksi "jawaban_responden"
    await addDoc(collection(db, "jawaban_responden"), dataKuesioner);

    alert("Berhasil! Jawaban kuesioner Anda telah terkirim.");
    formKuis.reset(); // Kosongkan form kembali setelah berhasil
  } catch (error) {
    console.error("Terjadi kesalahan: ", error);
    alert("Gagal mengirim kuesioner. Coba periksa koneksi internet Anda.");
  } finally {
    // Kembalikan tombol seperti semula
    tombolSubmit.disabled = false;
    tombolSubmit.textContent = "Kirim Kuesioner";
  }
});
