
console.log("Website sekolah berhasil dijalankan.");

/* =========================================================
   PENGIRIMAN KRITIK DAN SARAN
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formKritikSaran");
  const iframe = document.getElementById("frameKritikSaran");
  const tombol = document.getElementById("tombolKirimSaran");
  const halaman = document.getElementById("halamanSaran");
  const waktuLokal = document.getElementById("waktuLokalSaran");
  const pesan = document.getElementById("pesanSaran");
  const penghitung = document.getElementById("hitungKarakterSaran");
  const status = document.getElementById("statusKritikSaran");

  if (!form || !iframe || !tombol) {
    console.error("Form kritik dan saran tidak ditemukan.");
    return;
  }

  const teksTombol =
    tombol.querySelector(".teks-tombol-saran");

  const teksAwal = teksTombol
    ? teksTombol.textContent
    : tombol.textContent;

  let sedangMengirim = false;
  let timerPengiriman = null;

  function ubahTombol(mengirim) {
    tombol.disabled = mengirim;
    tombol.classList.toggle("mengirim", mengirim);

    if (teksTombol) {
      teksTombol.textContent = mengirim
        ? "Sedang mengirim..."
        : teksAwal;
    } else {
      tombol.textContent = mengirim
        ? "Sedang mengirim..."
        : teksAwal;
    }
  }

  function tampilkanStatus(jenis, isi) {
    if (!status) return;

    status.className = "status-saran " + jenis;
    status.textContent = isi;
  }

  /* Menghitung jumlah karakter */
  if (pesan && penghitung) {
    pesan.addEventListener("input", function () {
      penghitung.textContent =
        pesan.value.length + "/2500 karakter";
    });
  }

  /* Ketika formulir dikirim */
  form.addEventListener("submit", function (event) {
    const urlWebApp = form.getAttribute("action") || "";

    if (
      !urlWebApp.startsWith("https://script.google.com/") ||
      !urlWebApp.endsWith("/exec")
    ) {
      event.preventDefault();

      alert(
        "URL Web App Google Apps Script belum benar."
      );

      return;
    }

    if (!form.checkValidity()) {
      return;
    }

    if (sedangMengirim) {
      event.preventDefault();
      return;
    }

    if (halaman) {
      halaman.value = window.location.href;
    }

    if (waktuLokal) {
      waktuLokal.value = new Date().toLocaleString(
        "id-ID",
        {
          dateStyle: "full",
          timeStyle: "medium"
        }
      );
    }

    sedangMengirim = true;
    ubahTombol(true);

    if (status) {
      status.className = "status-saran";
      status.textContent = "";
    }

    clearTimeout(timerPengiriman);

    /* Jika tidak ada respons selama 30 detik */
    timerPengiriman = setTimeout(function () {
      if (!sedangMengirim) return;

      sedangMengirim = false;
      ubahTombol(false);

      tampilkanStatus(
        "gagal",
        "Pengiriman belum berhasil dikonfirmasi."
      );

      alert(
        "Pengiriman terlalu lama. Silakan periksa koneksi internet dan coba kembali."
      );
    }, 30000);
  });

  /*
   * Iframe selesai dimuat setelah Apps Script
   * selesai menjalankan doPost().
   */
  iframe.addEventListener("load", function () {
    if (!sedangMengirim) {
      return;
    }

    sedangMengirim = false;
    clearTimeout(timerPengiriman);
    ubahTombol(false);

    tampilkanStatus(
      "berhasil",
      "Kritik dan saran berhasil dikirim."
    );

    alert(
      "Kritik dan saran akan ditinjau oleh sekolah. Terima kasih."
    );

    form.reset();

    if (penghitung) {
      penghitung.textContent = "0/2500 karakter";
    }
  });
});
