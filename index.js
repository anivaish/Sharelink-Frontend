const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector("#browseBtn");
const fileInput = document.querySelector("#fileInput");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");
const toast = document.querySelector(".toast");

const baseURL = "https://sharelink-xxkc.onrender.com";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize=1000*1024*1024  //1GB SIZE

dropZone.addEventListener("dragover", (e) => {
  if (!dropZone.classList.contains("dragged"))
    dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", (e) => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

browseBtn.addEventListener("click", (e) => {
  fileInput.click();
  if (!dropZone.classList.contains("dragged"))
    dropZone.classList.add("dragged");
});

fileInput.addEventListener("change", (e) => {
  uploadFile();
});

document.onclick=function(e)
{
  if(e.target.className==="body")
  if (dropZone.classList.contains("dragged"))
      dropZone.classList.remove("dragged");
}
copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Link Copied");
});

const uploadFile = () => {
  if (fileInput.files.length > 1) {
    showToast("Upload Only 1 File");
    fileInput.value = ""; // reset the input
    return;
  }
  if (fileInput.files[0].size > maxAllowedSize) {
    showToast("Max File size is 1GB");
    fileInput.value = ""; // reset the input
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("myfile", file);

  //show the uploader
  progressContainer.style.display = "block";

  // upload file
  const xhr = new XMLHttpRequest();

  // listen for upload progress
  xhr.upload.onprogress = (event) => {
    // find the percentage of uploaded
    let percent = Math.round((100 * event.loaded) / event.total);
    console.log(percent);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  // handle error
  xhr.upload.onerror = function () {
    showToast(`Error in upload: ${xhr.status}.`);
    fileInput.value = ""; // reset the input
  };

  //   // listen for response which will give the link
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
      if (dropZone.classList.contains("dragged"))
        dropZone.classList.remove("dragged");
    }
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  fileInput.value = ""; // reset the input
  // status.innerText = "Uploaded";

  // remove the disabled attribute from form btn & make text send
  emailForm[2].removeAttribute("disabled");
  emailForm[2].innerText = "Send";

  progressContainer.style.display = "none";
  const { file: url } = JSON.parse(res);
  console.log(url);
  fileURL.value = url;
  sharingContainer.style.display = "block";
};

// Email logic
emailForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop submission

  // disable the button
  emailForm[2].setAttribute("disabled", "true");
  emailForm[2].innerText = "Sending...";

  const url = fileURL.value;

  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent");
        sharingContainer.style.display = "none"; // hide the box
      }
    });
});

let toastTimer;
// the toast function
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
