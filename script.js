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
  let thresholded = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.adaptiveThreshold(gray, thresholded, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 11, 5);

  cv.imshow(canvas, thresholded);
  src.delete(); gray.delete();

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
