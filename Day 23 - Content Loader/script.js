document.addEventListener("DOMContentLoaded", () => {
  const data = {
    headerImg: "./penguin.jpg",
    title: "Penguins of Africa",
    excerpt:
      "Meet the African penguin, a coastal bird known for its sleek black-and-white plumage.",
    profileImg: "./profile.png",
    name: "Nikola Vekic",
    date: "May 09, 2025",
  };

  const header = document.getElementById("header");
  const titleEl = document.getElementById("title");
  const excerptEl = document.getElementById("excerpt");
  const profileImg = document.getElementById("profile_img");
  const nameEl = document.getElementById("name");
  const dateEl = document.getElementById("date");

  setTimeout(() => {
    header.innerHTML = `<img src="${data.headerImg}" alt="Penguins">`;
    header.classList.remove("animated-bg");

    titleEl.textContent = data.title;
    titleEl.classList.remove("animated-bg", "animated-bg-text");

    excerptEl.textContent = data.excerpt;
    excerptEl.classList.remove("animated-bg", "animated-bg-text");

    profileImg.innerHTML = `<img src="${data.profileImg}" alt="Profile">`;
    profileImg.classList.remove("animated-bg");

    nameEl.textContent = data.name;
    nameEl.classList.remove("animated-bg", "animated-bg-text");

    dateEl.textContent = data.date;
    dateEl.classList.remove("animated-bg", "animated-bg-text");
  }, 2000);
});
