const uploadApiUrl = "https://p8b0um8v81.execute-api.eu-north-1.amazonaws.com/s3uploaderdemoyt";
const downloadApiUrl = "https://u00mudd2ri.execute-api.eu-north-1.amazonaws.com/s3downloaderdemoapi";
const bucket = "demouploadfromapilamda"; // your actual bucket name

// Attach event listeners
document.getElementById('uploadBtn').addEventListener('click', uploadFile);
document.getElementById('downloadBtn').addEventListener('click', downloadFile);

// Upload file to S3 via Lambda
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const statusText = document.getElementById("status");

  if (!fileInput.files.length) {
    alert("Please select a file first.");
    return;
  }

  const file = fileInput.files[0];
  const base64 = await toBase64(file);

  const payload = {
    filename: file.name,
    filedata: base64
  };

  try {
    const response = await fetch(uploadApiUrl, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (response.ok) {
      statusText.textContent = `✅ Upload successful! (${result.message})`;
      console.log("Response:", result);
    } else {
      statusText.textContent = `❌ Upload failed: ${result.error || 'Unknown error'}`;
    }
  } catch (error) {
    console.error("Upload error:", error);
    statusText.textContent = "❌ Upload failed: " + error.message;
  }
}

// Download file from S3 via Lambda
async function downloadFile() {
  const fileKey = document.getElementById("downloadInput").value;
  const statusText = document.getElementById("status");

  if (!fileKey) {
    alert("Please enter the filename to download.");
    return;
  }

  try {
    const response = await fetch(`${downloadApiUrl}?bucketname=${bucket}&image=${encodeURIComponent(fileKey)}`);
    if (!response.ok) throw new Error("File not found or error downloading");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileKey;
    document.body.appendChild(a);
    a.click();
    a.remove();

    statusText.textContent = `✅ Download started for ${fileKey}`;
  } catch (error) {
    console.error("Download error:", error);
    statusText.textContent = `❌ Download failed: ${error.message}`;
  }
}




// Helper: convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
  });
}

