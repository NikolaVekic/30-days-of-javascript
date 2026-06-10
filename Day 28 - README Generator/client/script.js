const form = document.getElementById("readme-form");
const output = document.getElementById("output");
const status = document.getElementById("status");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

let latestMarkdown = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const payload = {
    projectName: formData.get("projectName")?.toString().trim(),
    description: formData.get("description")?.toString().trim(),
    techStack: formData.get("techStack")?.toString().trim(),
    features: formData.get("features")?.toString().trim(),
    installation: formData.get("installation")?.toString().trim(),
    usage: formData.get("usage")?.toString().trim(),
    license: formData.get("license")?.toString().trim(),
    tone: formData.get("tone")?.toString().trim(),
  };

  output.textContent = "Generating README...";
  status.textContent = "Talking to the API. Please don’t bully localhost.";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;

  try {
    const response = await fetch("http://localhost:3000/generate-readme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Something went wrong.");
    }

    latestMarkdown = data.markdown || "";
    output.textContent = latestMarkdown;
    status.textContent = "README generated successfully.";
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  } catch (error) {
    output.textContent = "Failed to generate README.";
    status.textContent = error.message || "Something went wrong.";
    latestMarkdown = "";
  }
});

copyBtn.addEventListener("click", async () => {
  if (!latestMarkdown) return;

  try {
    await navigator.clipboard.writeText(latestMarkdown);
    status.textContent = "Copied to clipboard.";
  } catch {
    status.textContent = "Copy failed. Your clipboard chose violence.";
  }
});

downloadBtn.addEventListener("click", () => {
  if (!latestMarkdown) return;

  const blob = new Blob([latestMarkdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "README.md";
  a.click();

  URL.revokeObjectURL(url);
  status.textContent = "README.md downloaded.";
});
