const mbs = document.querySelector("#mbs");
const gbs = document.querySelector("#gbs");
const testing = document.querySelector("#testing");
const button = document.querySelector("#button");

const testImage =
  "https://images.unsplash.com/photo-1742855751015-5bda25456249?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==";
const fallbackSize = 1538120; // bytes

async function testSpeed() {
  try {
    testing.innerText = "Testing...";
    // Prevent caching with a cache-buster query param
    const url = `${testImage}&cb=${Date.now()}`;
    const startTime = performance.now();
    const response = await fetch(url);

    const contentLength =
      Number(response.headers.get("content-length")) || fallbackSize;

    await response.blob(); // Download the image

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;

    const bitsLoaded = contentLength * 8;
    const speedBps = bitsLoaded / duration;
    // Convert to Mbps using 1,000,000 bits per Mbps:
    const speedMbps = speedBps / 1000000;
    // For GB/s, further divide by 1000:
    const speedGbps = speedMbps / 1000;

    mbs.innerText = `Speed in Mbps: ${speedMbps.toFixed(0)}`;
    gbs.innerText = `Speed in GB/s: ${speedGbps.toFixed(2)}`;
    testing.innerText = "Test Complete";
  } catch (error) {
    testing.innerText = "Error during the test";
    console.error("Speed test error:", error);
  }
}

button.addEventListener("click", testSpeed);
