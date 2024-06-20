const WEBHOOK_URL = "DISCORD_WEBHOOK_URL_KAMU";
const CLASS_IDS = ["id1","id2"]; // cari tahu id class nya pakai function daftarkelas()
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_FIELD_VALUE_LENGTH = 1024;
const TIME_ZONE = "Asia/Makassar"; 

function kirimpesan(message, header = null) {
  if (header) {
    headerPesan(header);
  }

  if (message.description && message.description.length > MAX_DESCRIPTION_LENGTH) {
    message.description = message.description.substring(0, MAX_DESCRIPTION_LENGTH - 3) + "...";
  }

  if (message.fields) {
    message.fields.forEach(field => {
      if (field.value && field.value.length > MAX_FIELD_VALUE_LENGTH) {
        field.value = field.value.substring(0, MAX_FIELD_VALUE_LENGTH - 3) + "...";
      }
    });
  }

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ embeds: [message] }),
    muteHttpExceptions: true
  };

  Logger.log(JSON.stringify(options.payload)); // Log pesan sebelum dikirim untuk debugging
  var cekRespon = UrlFetchApp.fetch(WEBHOOK_URL, options);
  var kodeRespon = cekRespon.getResponseCode();
  var responseBody;

  try {
    responseBody = JSON.parse(cekRespon.getContentText());
  } catch (e) {
    Logger.log('Error parsing JSON respon: ' + e.message);
    responseBody = null;
  }

  Logger.log(responseBody); // Log respons untuk debugging

  if (kodeRespon === 429 && responseBody) { 
    var a = responseBody.retry_after * 1000; 
    Logger.log(`Rate terbatas. Mencoba kembali setelah ${a} milidetik.`);
    Utilities.sleep(a); 
    kirimpesan(message); 
  }
}

function headerPesan(content) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ content: content }),
    muteHttpExceptions: true
  };

  var cekRespon = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log(`Send message cekRespon: ${cekRespon.getResponseCode()}`);
}

function formatDueDate(dueDate, dueTime) {
  if (!dueDate) {
    return 'Tidak ada batas waktu';
  }

  var year = dueDate.year ? dueDate.year.toString().padStart(4, '0') : '0000';
  var month = dueDate.month ? dueDate.month.toString().padStart(2, '0') : '00';
  var day = dueDate.day ? dueDate.day.toString().padStart(2, '0') : '00';

  var dateStr = `${year}-${month}-${day}`;
  if (dueTime) {
    var hours = dueTime.hours ? dueTime.hours.toString().padStart(2, '0') : '00';
    var minutes = dueTime.minutes ? dueTime.minutes.toString().padStart(2, '0') : '00';
    var dateTimeStr = `${dateStr}T${hours}:${minutes}:00.000Z`; 
    var dateTime = new Date(dateTimeStr);
    var localDateTime = Utilities.formatDate(dateTime, TIME_ZONE, 'yyyy-MM-dd HH:mm');
    return localDateTime;
  } else {
    return `${dateStr} (Tidak ada waktu spesifiknya)`;
  }
}

function cariKelas() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastUpdate = scriptProperties.getProperty('lastUpdate') || 0;
  const waktuSekarang = new Date().getTime();

  CLASS_IDS.forEach(courseId => {
    var kelas = Classroom.Courses.get(courseId);
    var namaKelas = kelas.name;

    // Fetch announcements
    var announcements = Classroom.Courses.Announcements.list(courseId).announcements || [];
    announcements.forEach(announcement => {
      if (new Date(announcement.updateTime).getTime() > lastUpdate) {
        headerPesan("# Pengumuman");
        var files = announcement.materials || [];
        var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");

        var message = {
          "title": `Pengumuman Baru di ${namaKelas}`,
          "description": announcement.text || 'Tidak ada teks pengumuman',
          "color": 15105570,
          "footer": {
            "text": "Pengumuman Google Classroom"
          }
        };

        if (fileList) {
          message.fields = [{"name": "Files", "value": fileList || "Tidak ada file", "inline": false}];
        }

        kirimpesan(message);
        Utilities.sleep(300); // fungsi jeda biar ga kena limit
      }
    });

    // Fetch kelas materials
    var materials = Classroom.Courses.CourseWorkMaterials.list(courseId).courseWorkMaterial || [];
    materials.forEach(material => {
      if (new Date(material.updateTime).getTime() > lastUpdate) {
        headerPesan("# Materi");
        var materialLink = `https://classroom.google.com/u/0/c/${courseId}/m/${material.id}`;
        var files = material.materials || [];
        var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");

        var message = {
          "title": `Materi Baru di ${namaKelas}`,
          "description": `[${material.title}](${materialLink})` || 'Tidak ada judul materi',
          "color": 3447003,
          "fields": [
            {"name": "Deskripsi", "value": material.description || 'Tidak ada deskripsi', "inline": false}
          ],
          "footer": {
            "text": "Materi Google Classroom"
          }
        };

        if (fileList) {
          message.fields.push({"name": "Files", "value": fileList || "Tidak ada file", "inline": false});
        }

        kirimpesan(message);
        Utilities.sleep(300); // fungsi jeda biar ga kena limit
      }
    });

    // Fetch coursework
    var coursework = Classroom.Courses.CourseWork.list(courseId).courseWork || [];
    coursework.forEach(work => {
      if (new Date(work.updateTime).getTime() > lastUpdate) {
        headerPesan("# Tugas");
        var workLink = `https://classroom.google.com/u/0/c/${courseId}/a/${work.id}`;
        var files = work.materials || [];
        var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");
        var dueDateStr = formatDueDate(work.dueDate, work.dueTime);

        var message = {
          "title": `Tugas Baru di ${namaKelas}`,
          "description": `[${work.title}](${workLink})` || 'Tidak ada judul tugas',
          "color": 15844367,
          "fields": [
            {"name": "Deskripsi", "value": work.description || 'Tidak ada deskripsi', "inline": false},
            {"name": "Batas Waktu", "value": dueDateStr, "inline": false}
          ],
          "footer": {
            "text": "Tugas Google Classroom"
          }
        };

        if (fileList) {
          message.fields.push({"name": "Files", "value": fileList || "Tidak ada file", "inline": false});
        }

        kirimpesan(message);
        Utilities.sleep(300); // fungsi jeda biar ga kena limit
      }
    });
  });

  scriptProperties.setProperty('lastUpdate', waktuSekarang);
}

function main() {
  cariKelas();
}

function daftarkelas() {
  try {
    var courses = Classroom.Courses.list();
    if (courses.courses && courses.courses.length > 0) {
      Logger.log('Kursus:');
      courses.courses.forEach(kelas => {
        Logger.log(`${kelas.name} (ID: ${kelas.id})`);
      });
    } else {
      Logger.log('Tidak ada kursus yang ditemukan.');
    }
  } catch (e) {
    Logger.log('Kesalahan: ' + e.message);
  }
}
