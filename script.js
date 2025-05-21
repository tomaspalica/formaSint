const jacketList = document.querySelector(".jacket__list");

const select = document.querySelector(".jacket__list-select");
const selected = document.querySelector(".jacket__list-selected");
const optionsContainer = document.querySelector(".jacket__list-options");
const options = document.querySelectorAll(".jacket__list-option");
const modal = document.querySelector(".modal");
const menuModalOpen = document.querySelector(".nav__menu-button");
const jacketModal = document.querySelector(".jacket__modal");
const heartList = document.querySelectorAll(".heart-icon");
const heroSection = document.getElementById("hero-section");
const featuredSection = document.getElementById("featured-section");
const porductSection = document.getElementById("jacket-section");
const navLinks = document.querySelectorAll(".nav__link-list a");
const metaDescription = document.querySelector("#dynamic-description");
let pageNumber = 1;
let pageSize = 14;
let throttleTimer;
let loading = false;
let firstBanner = true;

//  changes heart-icon on hover and on click
heartList.forEach((heart) => {
  heart.dataset.liked = "false";

  heart.addEventListener("mouseenter", () => {
    if (heart.dataset.liked === "false") {
      heart.src = "images/heartFill.svg";
    }
  });

  heart.addEventListener("mouseleave", () => {
    if (heart.dataset.liked === "false") {
      heart.src = "images/heart.svg";
    }
  });

  heart.addEventListener("click", () => {
    const isLiked = heart.dataset.liked === "true";
    heart.dataset.liked = (!isLiked).toString();
    heart.src = !isLiked ? "images/heartFill.svg" : "images/heart.svg";
  });
});

// ***************************************************utils****************************************************************//
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

// lazy loading
const listObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !loading) {
        createJacketList();
      }
    });
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  }
);
// oberver changes meta description and title
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const topSection = visible[0].target;
          const id = topSection.id;
          history.replaceState(null, null, "#" + id);
          const title = topSection.getAttribute("data-title");
          const description = topSection.getAttribute("data-description");

          if (title) document.title = title;

          if (metaDescription && description) {
            metaDescription.setAttribute("content", description);
          }
        }
      }
    });
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 0.4,
  }
);

// swipe --------------------
const swiper = new Swiper(".swiper", {
  slidesPerView: "auto",

  loop: true,
  navigation: {
    nextEl: ".featured__button-next",
  },
  scrollbar: {
    el: ".swiper-scrollbar",
  },
  breakpoints: {
    // 100: {
    //   spaceBetween: 16,
    // },
    600: {
      slidesPerView: "auto",
    },
    1025: {
      slidesPerView: 4,
    },
  },
});

const throttle = (callback, time) => {
  if (throttleTimer) return;
  throttleTimer = true;
  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

// function that fetches data from api--------------
const fetchData = async (pageSize, pageNumber) => {
  const result = await fetch(
    `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
  return result.data;
};
const indexBanner = () => {
  const width = window.innerWidth;
  if (width < 1024) return 3;
  return 4;
};
//*******************************************************************************************************************/

// function that creates jacket list -----------------------------------------------------------------
const createJacketList = async (pageSize = 14, pageNumber = 1) => {
  if (loading) return;
  loading = true;
  const bannerIndex = indexBanner();
  const result = await fetchData(pageSize, pageNumber);

  result.forEach((el, index) => {
    const jacket = document.createElement("li");
    jacket.classList.add("jacket__list-img-box");
    jacket.innerHTML = `<div data-id=${el.id} class="jacket__list-img-id">ID: ${el.id}</div><img loading="lazy" class="jacket__list-img" src="${el.image}"  alt="profesjonalna kurtka alpinistyczna"/>`;
    jacket.addEventListener("click", () => {
      const jacketModalContent = document.createElement("div");
      jacketModalContent.classList.add("jacket__modal-content");
      jacketModalContent.innerHTML = `<div class="modal__header-close jacket__modal-close">
            <div class="modal__header-close-img-wrapper">
              <img
                data-value="close"
                loading="lazy"
                src="images/iconX.svg"
                alt=""
              />
            </div>
            <div data-value="close">CLOSE</div>
          </div>
          <div data-id=${el.id} class="jacket__modal-img-id">ID: ${el.id}</div>
          <img loading="lazy" class="jacket__modal-img" src="${el.image}" alt="sportowiec zjeżdzający na nartach w turkusowej kurtce" />`;
      jacketModal.replaceChildren(jacketModalContent);

      jacketModal.classList.add("active");
    });
    jacketList.appendChild(jacket);
    if (index === bannerIndex && firstBanner) {
      const banner = document.createElement("li");
      banner.classList.add("jacket__list-banner");
      banner.innerHTML = `<div class="banner-headline-wrapper">
      <h2 class="banner-headline-name">FORMAS'INT.</h2>
      <p class="banner-headline-info">You'll look and feel like the champion.</p>
      </div>
      <button class="banner-button">CHECK THIS OUT<div class="banner-img-wrapper"><img loading="lazy" src="images/buttonArrow.svg" /></div></button>`;
      jacketList.appendChild(banner);
      firstBanner = false;
    }
  });
  loading = false;
  listObserver.disconnect();
};
// ---------------------------------------------------------------------------

// infinity scroll -----------------------------------------------------------
window.addEventListener("scroll", () => {
  throttle(() => {
    if (
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight
    ) {
      pageNumber += 1;
      createJacketList(pageSize, pageNumber);
    }
  }, 1000);
});
const handleResize = debounce((resizeEvent) => {
  jacketList.innerHTML = "";
  firstBanner = true;
  createJacketList();
}, 1000);
window.addEventListener("resize", handleResize);
// ----------------------------------------------------------------------------

// Select----------------------------------------------------------------------
const optionsArray = [14, 24, 36];
select.addEventListener("click", function () {
  let index = 0;
  select.classList.toggle("jacket__list-select-active");
  if (optionsContainer.innerHTML === "") {
    optionsArray.forEach((option) => {
      if (option === pageSize) {
        return;
      }
      const optionEl = document.createElement("div");

      optionEl.classList.add("jacket__list-option");
      optionEl.setAttribute("data-value", option);
      optionEl.innerText = option;
      // licze index by dodać border pomiędzy pierwszym i drugim elementem selekta który będzie, nie uzywam index w foreach aby nie tworzyła mi się kreska w elemencie który nie będzie istnieć w DOM
      if (index == 0) {
        optionEl.classList.add("product-list-first-option");
      }
      index = +1;

      optionsContainer.appendChild(optionEl);

      optionEl.addEventListener("click", () => {
        selected.textContent = option;
        selected.setAttribute("data-value", option);

        select.classList.remove("jacket__list-select-active");
        jacketList.innerHTML = "";
        firstBanner = true;
        pageNumber = 1;
        pageSize = option;
        createJacketList(pageSize, pageNumber);
      });
    });
  } else {
    optionsContainer.innerHTML = "";
  }
});

document.addEventListener("click", (e) => {
  if (!select.contains(e.target)) {
    optionsContainer.innerHTML = "";
    select.classList.remove("jacket__list-select-active");
  }
});
// ---------------------------------------------------------------------------

// modal----------------------------------------------------------------------
const modalClose = (e) => {
  if (e.target.getAttribute("data-value") === "close") {
    e.currentTarget.classList.remove("active");
  }
};
modal.addEventListener("click", modalClose);
menuModalOpen.addEventListener("click", () => {
  modal.classList.add("active");
});

jacketModal.addEventListener("click", modalClose);

const sections = [heroSection, featuredSection, porductSection];
// ---------------------------------------------------------------------------

// highlights links in header when section is in view ------------------------

function checkSection() {
  let currentIndex = -1;

  sections.forEach((section, index) => {
    if (window.scrollY + 200 >= section.offsetTop) {
      currentIndex = index;
    }
  });

  navLinks.forEach((link, index) => {
    if (index === currentIndex) {
      link.classList.add("nav__active");
    } else {
      link.classList.remove("nav__active");
    }
  });
}
window.addEventListener("scroll", checkSection);

listObserver.observe(jacketList);
sections.forEach((section) => {
  observer.observe(section);
});
