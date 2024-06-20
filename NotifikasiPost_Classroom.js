const WEBHOOK_URL = "https://discord.com/api/webhooks/1253050435603009707/dx4CWG9QL81tWINibZtcLHS4ObwvtucLN81hUHJvCsbMeCR0qQZ2OtiUsJoEQubhWqCM";
const CLASS_IDS = ["654150146383"]; // Tambahkan ID kelas yang ingin Anda ambil datanya
const MAX_DESCRIPTION_LENGTH = 4096;
const MAX_FIELD_VALUE_LENGTH = 1024;
const TIME_ZONE = "Asia/Jakarta"; // Atur zona waktu yang diinginkan

function kirimPesanEmbed(message, header = null) {
  if (header) {
    kirimPesanBiasa(header);
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

  Logger.log(JSON.stringify(options.payload));
  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  var responseCode = response.getResponseCode();
  var responseBody;

  try {
    responseBody = JSON.parse(response.getContentText());
  } catch (e) {
    Logger.log('Error parsing JSON response: ' + e.message);
    responseBody = null;
  }

  Logger.log(responseBody);

  if (responseCode === 429 && responseBody) {
    var retryAfter = responseBody.retry_after * 1000;
    Logger.log(`Rate terbatas. Mencoba kembali setelah ${retryAfter} milidetik.`);
    Utilities.sleep(retryAfter);
    kirimPesanEmbed(message);
  }
}

function kirimPesanBiasa(content) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ content: content }),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log(`Send message response: ${response.getResponseCode()}`);
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
    return `${dateStr} (Tidak waktu spesifiknya)`;
  }
}

function cariKelas() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastUpdate = scriptProperties.getProperty('lastUpdate') || 0;
  const currentTime = new Date().getTime();

  CLASS_IDS.forEach(courseId => {
    var course = Classroom.Courses.get(courseId);
    var courseName = course.name;

    var latestItem = null;

    // Fetch announcements
    var announcements = Classroom.Courses.Announcements.list(courseId).announcements || [];
    announcements.forEach(announcement => {
      if (new Date(announcement.updateTime).getTime() > lastUpdate) {
        if (!latestItem || new Date(announcement.updateTime).getTime() > new Date(latestItem.updateTime).getTime()) {
          latestItem = {
            type: 'announcement',
            data: announcement
          };
        }
      }
    });

    // Fetch course materials
    var materials = Classroom.Courses.CourseWorkMaterials.list(courseId).courseWorkMaterial || [];
    materials.forEach(material => {
      if (new Date(material.updateTime).getTime() > lastUpdate) {
        if (!latestItem || new Date(material.updateTime).getTime() > new Date(latestItem.data.updateTime).getTime()) {
          latestItem = {
            type: 'material',
            data: material
          };
        }
      }
    });

    // Fetch coursework
    var coursework = Classroom.Courses.CourseWork.list(courseId).courseWork || [];
    coursework.forEach(work => {
      if (new Date(work.updateTime).getTime() > lastUpdate) {
        if (!latestItem || new Date(work.updateTime).getTime() > new Date(latestItem.data.updateTime).getTime()) {
          latestItem = {
            type: 'coursework',
            data: work
          };
        }
      }
    });

    if (latestItem) {
      switch (latestItem.type) {
        case 'announcement':
          var announcement = latestItem.data;
          kirimPesanBiasa("# Pengumuman");
          var files = announcement.materials || [];
          var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");

          var message = {
            "title": `Pengumuman Baru di ${courseName}`,
            "description": announcement.text || 'Tidak ada teks pengumuman',
            "color": 15105570,
            "footer": {
              "text": "Pengumuman Google Classroom"
            }
          };

          if (fileList) {
            message.fields = [{"name": "Files", "value": fileList || "Tidak ada file", "inline": false}];
          }

          kirimPesanEmbed(message);
          break;

        case 'material':
          var material = latestItem.data;
          kirimPesanBiasa("# Materi");
          var materialLink = `https://classroom.google.com/u/0/c/${courseId}/m/${material.id}`;
          var files = material.materials || [];
          var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");

          var message = {
            "title": `Materi Baru di ${courseName}`,
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

          kirimPesanEmbed(message);
          break;

        case 'coursework':
          var work = latestItem.data;
          kirimPesanBiasa("# Tugas");
          var workLink = `https://classroom.google.com/u/0/c/${courseId}/a/${work.id}`;
          var files = work.materials || [];
          var fileList = files.map(file => file.driveFile ? `[${file.driveFile.driveFile.title}](${file.driveFile.driveFile.alternateLink})` : "").join("\n");
          var dueDateStr = formatDueDate(work.dueDate, work.dueTime);

          var message = {
            "title": `Tugas Baru di ${courseName}`,
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

          kirimPesanEmbed(message);
          break;
      }
    } else {
      kirimPesanBiasa("Tidak ada post terbaru");
    }
  });

  scriptProperties.setProperty('lastUpdate', currentTime);
}

function main() {
  cariKelas();
}

function daftarKelas() {
  try {
    var courses = Classroom.Courses.list();
    if (courses.courses && courses.courses.length > 0) {
      Logger.log('Kursus:');
      courses.courses.forEach(course => {
        Logger.log(`${course.name} (ID: ${course.id})`);
      });
    } else {
      Logger.log('Tidak ada kursus yang ditemukan.');
    }
  } catch (e) {
    Logger.log('Kesalahan: ' + e.message);
  }
}
