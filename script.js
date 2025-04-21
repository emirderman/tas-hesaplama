let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let resultsDiv = document.getElementById("results");

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });
    video.srcObject = stream;
  } catch (err) {
    console.error("Kamera açılamadı:", err);
    resultsDiv.innerText = "Kamera erişimi sağlanamadı.";
  }
}

function captureImage() {
  let ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  let thresholded = new cv.Mat();
  let morph = new cv.Mat();

  // Griye çevir
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  // Gürültü azalt
  cv.GaussianBlur(gray, blurred, new cv.Size(3, 3), 0);

  // Kontrastlı hale getir
  cv.adaptiveThreshold(blurred, thresholded, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 15, 4);

  // Şekilleri netleştir (dilate-erode)
  let kernel = cv.Mat.ones(2, 2, cv.CV_8U);
  cv.morphologyEx(thresholded, morph, cv.MORPH_CLOSE, kernel);

  // Görüntüyü ekrana bastır
  cv.imshow(canvas, morph);

  // OCR başlat
  Tesseract.recognize(canvas.toDataURL(), 'eng', {
    tessedit_char_whitelist: '0123456789'
  }).then(({ data: { text } }) => {
    const cleaned = text.replace(/[^0-9\s]/g, '').trim();
    resultsDiv.innerText = cleaned ? `📋 Sayılar: ${cleaned}` : "Hiçbir sayı algılanamadı.";
  }).catch(err => {
    console.error(err);
    resultsDiv.innerText = "Tanıma sırasında hata oluştu.";
  });

  // Belleği temizle
  src.delete(); gray.delete(); blurred.delete(); thresholded.delete(); morph.delete(); kernel.delete();
}

  // OCR başlat
  Tesseract.recognize(canvas.toDataURL(), 'eng', {
    tessedit_char_whitelist: '0123456789'
  }).then(({ data: { text } }) => {
    const cleaned = text.replace(/[^0-9\s]/g, '').trim();
    resultsDiv.innerText = cleaned ? `📋 Sayılar: ${cleaned}` : "Hiçbir sayı algılanamadı.";
  }).catch(err => {
    console.error(err);
    resultsDiv.innerText = "Tanıma sırasında hata oluştu.";
  });

  thresholded.delete();
}

function onOpenCvReady() {
  startCamera();
}
