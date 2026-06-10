var form = document.getElementById("form");
var moodInput = document.getElementById("mood");
var button = document.getElementById("btn");
var message = document.getElementById("msg");

var palette = document.getElementById("palette");

var color1 = document.getElementById("c1");
var color2 = document.getElementById("c2");
var color3 = document.getElementById("c3");

var box1 = document.getElementById("box1");
var box2 = document.getElementById("box2");
var box3 = document.getElementById("box3");

var gradBox = document.getElementById("gradBox");
var gradText = document.getElementById("gradText");

var lastGradient = ""; // "linear-gradient(...);"

function setLoading(isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "..." : "Generate";
}

function setMessage(text) {
  message.textContent = text || "";
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  setMessage("Copied ✅");
}

function setColors(colors) {
  var a = colors[0];
  var b = colors[1];
  var c = colors[2];

  color1.textContent = a;
  color2.textContent = b;
  color3.textContent = c;

  box1.style.background = a;
  box2.style.background = b;
  box3.style.background = c;
}

function easeBackgroundTo(gradientString) {
  // Crossfade: put new gradient on ::before layer, fade it in, then commit to --bg
  document.documentElement.style.setProperty("--bg-next", gradientString);
  document.body.classList.add("bg-fade");

  setTimeout(function () {
    document.documentElement.style.setProperty("--bg", gradientString);
    document.body.classList.remove("bg-fade");
  }, 720);
}

box1.addEventListener("click", function () {
  copyText(color1.textContent);
});
box2.addEventListener("click", function () {
  copyText(color2.textContent);
});
box3.addEventListener("click", function () {
  copyText(color3.textContent);
});
gradBox.addEventListener("click", function () {
  copyText(lastGradient);
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  var mood = moodInput.value.trim();
  if (!mood) return setMessage("Type a mood.");

  setMessage("");
  setLoading(true);

  try {
    var response = await fetch("/api/gradient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: mood }),
    });

    var data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");

    if (!data.colors || data.colors.length !== 3 || !data.gradient) {
      throw new Error("Bad response from server.");
    }

    // show palette smoothly (first time)
    palette.classList.add("show");

    setColors(data.colors);

    lastGradient = data.gradient.endsWith(";")
      ? data.gradient
      : data.gradient + ";";
    gradText.textContent = lastGradient;

    easeBackgroundTo(data.gradient);

    setMessage("Click a color (or the gradient) to copy.");
  } catch (err) {
    setMessage("Error: " + err.message);
  }

  setLoading(false);
});
