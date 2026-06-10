const apiURL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const currentURL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&";
const apiKey = "7dfc47d8ef02b633706a073a30b764e8";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search-btn");
const currentBtn = document.querySelector(".current-btn");
const weatherIcon = document.querySelector(".weather-icon");

const checkWeather = async (city) => {
  const response = await fetch(apiURL + city + `&appid=${apiKey}`);
  const data = await response.json();

  if (data.cod === "404") {
    document.querySelector(".city").innerHTML = data.message;
  } else {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML =
      Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + "km/h";

    weatherIcon.src = "images/" + data.weather[0].main.toLowerCase() + ".png";
    document.querySelector(".weather").style.display = "block";
  }
};

const currentWeather = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;
    const response = await fetch(
      currentURL + `lat=${latitude}&lon=${longitude}&appid=` + apiKey
    );
    const data = await response.json();

    if (data.cod === "404") {
      document.querySelector(".city").innerHTML = data.message;
    } else {
      document.querySelector(".city").innerHTML = data.name;
      document.querySelector(".temp").innerHTML =
        Math.round(data.main.temp) + "°C";
      document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
      document.querySelector(".wind").innerHTML = data.wind.speed + "km/h";
      searchBox.value = data.name;

      weatherIcon.src = "images/" + data.weather[0].main.toLowerCase() + ".png";
      document.querySelector(".weather").style.display = "block";
    }
  } catch (error) {
    console.error("Error getting current position:", error);
  }
};

searchBtn.onclick = () => {
  checkWeather(searchBox.value);
};

currentBtn.onclick = currentWeather;

// Event listener for keypress event
document.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && document.activeElement === searchBox) {
    checkWeather(searchBox.value);
  }
});
