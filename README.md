# Introduction

Hai, kembali lagi dengan beragam tools yang bermanfaat. Kadang kalau ga dapat informasi dari google classroom itu *bete banget* karena ketinggalan informasi gitu. Nah maka dari itu aku membuat sebuah script google apps untuk mempermudah hal tersebut, tapi dengan third apps **Discord** untuk membuatnya mudah diakses. 

# How to Use

## Notifikasi Post

Fitur untuk script ini adalah memberitahukan setiap ada post baru di classroom kalian, misal ada material baru, announcement baru, dan tugas baru.

1. Buka [**Google Apps Script**](https://script.google.com/) dibrowser kalian masing-masing.
2. Klik tombol **`New Project / Project Baru`** (*disarankan memberikan nama project*)
3. Masukkan kode tersebut dan **`Save 💾`**
4. Edit terlebih dahulu masukkan Webhook Discord URL nya pakai webhook channel kalian ([klik aku kalau tidak tahu caranya](https://hookdeck.com/webhooks/platforms/how-to-get-started-with-discord-webhooks))
5. Edit bagian ID nya, untuk mengetahui idnya pilih dulu function `daftarKelas` dan tekan tombol **`Run ▶`**
6. Jika sudah simpan ID yang diberikan, dan taruh ID nya di array `const kelas`.
7. Pilih function **`main`** dan tekan tombol **`Run ▶`** (*jika ingin mencoba*)
8. Tambahkan *Trigger/Pemicu* menunya ada disebelah kiri.
9. Klik tombol **`➕ Tambahkan Pemicu`** (*berwarna biru/blue*).
10. Pengaturan/Settings :

```html
<Fungsi / Function> - main 
<Nama Penerapan> - Head
<Sumber Acara> - dipicu oleh waktu
<Pemicu Berdasarkan Waktu> - Timer menit
<Interval Menit> - Setiap 5 menit
<Pemberitahuan Notifikasi Kegagalan> - Beri tahu saya setiap hari
```
![image](https://github.com/miezlearning/classroom-discord/assets/129609799/ad9a0362-5036-47e9-9066-e845b7352309)


11. Dan selesai, konfigurasinya terinstall dengan baik.


## Semua Post

Maksudnya adalah, mengambil semua data yang ada diclassroom seperti material, announcement, dan tugas.

1. Buka [**Google Apps Script**](https://script.google.com/) dibrowser kalian masing-masing.
2. Klik tombol **`New Project / Project Baru`** (*disarankan memberikan nama project*)
3. Masukkan kode tersebut dan **`Save 💾`**
4. Edit terlebih dahulu masukkan Webhook Discord URL nya pakai webhook channel kalian ([klik aku kalau tidak tahu caranya](https://hookdeck.com/webhooks/platforms/how-to-get-started-with-discord-webhooks))
5. Edit bagian ID nya, untuk mengetahui idnya pilih dulu function `daftarKelas` dan tekan tombol **`Run ▶`**
6. Jika sudah simpan ID yang diberikan, dan taruh ID nya di array `const kelas`.
7. Pilih function **`main`** dan tekan tombol **`Run ▶`** (*jika ingin mencoba*)
