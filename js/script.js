
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
/* =========================================================
   PENGUMUMAN OTOMATIS DARI GOOGLE SPREADSHEET
   Tempelkan di bagian paling bawah js/script.js.
   ========================================================= */

(function () {
  "use strict";

  /*
   * Ganti URL berikut dengan URL deployment Apps Script
   * yang berakhir dengan /exec.
   */
  const URL_WEB_APP_PENGUMUMAN =
    "https://script.google.com/macros/s/AKfycbwZUx2O4ti5I_u4SqBvyNzZLDkfxNLQ5hHTkv9q6YT1aOw13ta683VhO7u6eqRsqo7SpQ/exec";

  const JUMLAH_PENGUMUMAN = 6;
  const WAKTU_TUNGGU = 15000;

  document.addEventListener(
    "DOMContentLoaded",
    function () {
      const daftar = document.getElementById(
        "daftarPengumumanOtomatis"
      );

      const status = document.getElementById(
        "statusPengumumanOtomatis"
      );

      const tombolMuatUlang = document.getElementById(
        "tombolMuatUlangPengumuman"
      );

      if (!daftar || !status) {
        return;
      }

      let timer = null;
      let elemenScript = null;

      function ubahStatus(teks, jenis) {
        status.textContent = teks;
        status.className =
          "status-pengumuman-otomatis" +
          (jenis ? " " + jenis : "");
      }

      function tampilkanLoading() {
        daftar.setAttribute("aria-busy", "true");
        daftar.replaceChildren();

        const kotak = document.createElement("div");
        kotak.className = "pengumuman-loading";

        const spinner = document.createElement("span");
        spinner.className =
          "pengumuman-loading-spinner";

        const teks = document.createElement("p");
        teks.textContent =
          "Sedang memuat pengumuman...";

        kotak.append(spinner, teks);
        daftar.appendChild(kotak);

        ubahStatus(
          "Mengambil pengumuman terbaru...",
          ""
        );
      }

      function tampilkanKosong() {
        daftar.replaceChildren();

        const kotak = document.createElement("div");
        kotak.className =
          "pengumuman-pesan pengumuman-kosong";

        const judul = document.createElement("h3");
        judul.textContent =
          "Belum ada pengumuman aktif";

        const isi = document.createElement("p");
        isi.textContent =
          "Silakan periksa kembali pada waktu berikutnya.";

        kotak.append(judul, isi);
        daftar.appendChild(kotak);

        ubahStatus(
          "Belum ada pengumuman yang ditampilkan.",
          "status-kosong"
        );
      }

      function tampilkanGagal(pesan) {
        daftar.replaceChildren();

        const kotak = document.createElement("div");
        kotak.className =
          "pengumuman-pesan pengumuman-gagal";

        const judul = document.createElement("h3");
        judul.textContent =
          "Pengumuman belum dapat dimuat";

        const isi = document.createElement("p");
        isi.textContent =
          pesan ||
          "Periksa koneksi internet lalu tekan Muat Ulang.";

        kotak.append(judul, isi);
        daftar.appendChild(kotak);

        ubahStatus(
          "Gagal mengambil pengumuman.",
          "status-gagal"
        );
      }

      function buatKartu(item) {
        const artikel = document.createElement("article");
        artikel.className = "kotak-pengumuman";
        artikel.dataset.id = item.id || "";

        const tanggal = document.createElement("div");
        tanggal.className = "tanggal";

        const hari = document.createElement("strong");
        hari.textContent = item.hari || "--";

        const bulanTahun = document.createElement("span");
        bulanTahun.textContent =
          (item.bulan || "") +
          " " +
          (item.tahun || "");

        tanggal.append(hari, bulanTahun);

        const isiPengumuman =
          document.createElement("div");

        isiPengumuman.className =
          "isi-pengumuman isi-pengumuman-otomatis";

        const meta = document.createElement("div");
        meta.className = "meta-pengumuman-otomatis";

        const kategori = document.createElement("span");
        kategori.className =
          "kategori-pengumuman-otomatis";
        kategori.textContent =
          item.kategori || "Umum";

        const tanggalLengkap =
          document.createElement("time");
        tanggalLengkap.textContent =
          item.tanggalLengkap || "";

        meta.append(kategori, tanggalLengkap);

        const judul = document.createElement("h3");
        judul.textContent =
          item.judul || "Pengumuman Sekolah";

        const isi = document.createElement("p");
        isi.textContent = item.isi || "";

        isiPengumuman.append(meta, judul, isi);

        if (
          item.tautan &&
          /^https?:\/\//i.test(item.tautan)
        ) {
          const tautan = document.createElement("a");
          tautan.className =
            "tautan-pengumuman-otomatis";
          tautan.href = item.tautan;
          tautan.target = "_blank";
          tautan.rel = "noopener noreferrer";
          tautan.textContent =
            item.teksTombol ||
            "Baca Selengkapnya";

          isiPengumuman.appendChild(tautan);
        }

        artikel.append(tanggal, isiPengumuman);

        return artikel;
      }

      function tampilkanData(data) {
        daftar.replaceChildren();

        data.forEach(function (item) {
          daftar.appendChild(buatKartu(item));
        });

        daftar.setAttribute("aria-busy", "false");

        ubahStatus(
          data.length +
            " pengumuman terbaru ditampilkan.",
          "status-berhasil"
        );
      }

      function bersihkanPermintaan() {
        clearTimeout(timer);

        if (
          elemenScript &&
          elemenScript.parentNode
        ) {
          elemenScript.parentNode.removeChild(
            elemenScript
          );
        }

        elemenScript = null;
      }

      window.terimaPengumumanSekolah =
        function (respons) {
          bersihkanPermintaan();

          if (
            !respons ||
            respons.berhasil !== true
          ) {
            tampilkanGagal(
              respons && respons.pesan
                ? respons.pesan
                : "Respons server tidak valid."
            );
            return;
          }

          const data = Array.isArray(
            respons.pengumuman
          )
            ? respons.pengumuman
            : [];

          if (data.length === 0) {
            tampilkanKosong();
            return;
          }

          tampilkanData(data);
        };

      function muatPengumuman() {
        if (
          !URL_WEB_APP_PENGUMUMAN.startsWith(
            "https://script.google.com/"
          ) ||
          !URL_WEB_APP_PENGUMUMAN.endsWith(
            "/exec"
          )
        ) {
          tampilkanGagal(
            "URL Web App pengumuman belum dipasang di script.js."
          );
          return;
        }

        bersihkanPermintaan();
        tampilkanLoading();

        const parameter =
          "?callback=terimaPengumumanSekolah" +
          "&limit=" +
          encodeURIComponent(
            JUMLAH_PENGUMUMAN
          ) +
          "&nocache=" +
          Date.now();

        elemenScript =
          document.createElement("script");

        elemenScript.src =
          URL_WEB_APP_PENGUMUMAN + parameter;

        elemenScript.async = true;

        elemenScript.onerror = function () {
          bersihkanPermintaan();

          tampilkanGagal(
            "Koneksi ke layanan pengumuman gagal."
          );
        };

        document.body.appendChild(
          elemenScript
        );

        timer = setTimeout(function () {
          bersihkanPermintaan();

          tampilkanGagal(
            "Waktu pengambilan data terlalu lama."
          );
        }, WAKTU_TUNGGU);
      }

      if (tombolMuatUlang) {
        tombolMuatUlang.addEventListener(
          "click",
          muatPengumuman
        );
      }

      muatPengumuman();
    }
  );
})();
