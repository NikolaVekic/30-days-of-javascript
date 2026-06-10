document.addEventListener("DOMContentLoaded", () => {
  const celsius = document.getElementById("celsius");
  const fahrenheit = document.getElementById("fahrenheit");
  const kelvin = document.getElementById("kelvin");

  const round = (n) => (Number.isFinite(n) ? n.toFixed(2) : "");

  let isUpdating = false;

  function clearAll() {
    celsius.value = "";
    fahrenheit.value = "";
    kelvin.value = "";
  }

  function fromCelsius(c) {
    fahrenheit.value = round((c * 9) / 5 + 32);
    kelvin.value = round(c + 273.15);
  }

  function fromFahrenheit(f) {
    const c = ((f - 32) * 5) / 9;
    celsius.value = round(c);
    kelvin.value = round(c + 273.15);
  }

  function fromKelvin(k) {
    const c = k - 273.15;
    celsius.value = round(c);
    fahrenheit.value = round((c * 9) / 5 + 32);
  }

  celsius.addEventListener("input", () => {
    if (isUpdating) return;
    const v = celsius.value.trim();
    if (v === "") return clearAll();

    const c = Number(v);
    if (!Number.isFinite(c)) return;

    isUpdating = true;
    fromCelsius(c);
    isUpdating = false;
  });

  fahrenheit.addEventListener("input", () => {
    if (isUpdating) return;
    const v = fahrenheit.value.trim();
    if (v === "") return clearAll();

    const f = Number(v);
    if (!Number.isFinite(f)) return;

    isUpdating = true;
    fromFahrenheit(f);
    isUpdating = false;
  });

  kelvin.addEventListener("input", () => {
    if (isUpdating) return;
    const v = kelvin.value.trim();
    if (v === "") return clearAll();

    const k = Number(v);
    if (!Number.isFinite(k)) return;

    isUpdating = true;
    fromKelvin(k);
    isUpdating = false;
  });
});
