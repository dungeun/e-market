(function ($) {
  "use strict";
  // Preloader
  $(document).ready(function () {
    $("#container").addClass("loaded");
    if ($("#container").hasClass("loaded")) {
      $("#preloader")
        .delay(1000)
        .queue(function () {
          $(this).remove();
          gsap.to("header", {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
          });
          gsap.to(".breadcrumb__nav", {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          });
        });
    }
  });

  // Counter active
  if ("counterUp" in window) {
    const skill_counter = window.counterUp.default;
    const skill_cb = (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting && !el.classList.contains("is-visible")) {
          skill_counter(el, {
            duration: 1500,
            delay: 16,
          });
          el.classList.add("is-visible");
        }
      });
    };

    const IO = new IntersectionObserver(skill_cb, {
      threshold: 1,
    });

    const els = document.querySelectorAll(".t-counter");
    els.forEach((el) => {
      IO.observe(el);
    });
  }

  // Mobile Menu JS
  const mobileMenuActivation = () => {
    const closeButton = $(".hamburger-menu-close");
    const overlay = $(".orvio__overlay");
    const allSubmenus = $(".orvio__submenu");
    const allToggleButtons = $(".orvio__toggle-btn");

    const collapseAllSubmenus = () => {
      allSubmenus.slideUp().removeClass("orvio__active");
      allToggleButtons.removeClass("orvio__active");
    };

    closeButton.add(overlay).click(function () {
      const offcanvasInstance = bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasRight"));
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    });

    const linksWithSubmenu = $(".orvio__nav-link").filter(function () {
      return $(this).next(".orvio__submenu").length > 0;
    });

    linksWithSubmenu.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $this = $(this);
      const submenu = $this.next(".orvio__submenu");
      const toggleBtn = $this.find(".orvio__toggle-btn");

      if ($this.parents(".orvio__submenu").length === 0) {
        allSubmenus.not(submenu).slideUp().removeClass("orvio__active");
        allToggleButtons.not(toggleBtn).removeClass("orvio__active");
      } else {
        $this.closest(".orvio__submenu-item").siblings().find(".orvio__submenu").slideUp().removeClass("orvio__active");
        $this.closest(".orvio__submenu-item").siblings().find(".orvio__toggle-btn").removeClass("orvio__active");
      }
      submenu.slideToggle(function () {
        const isVisible = submenu.is(":visible");
        submenu.toggleClass("orvio__active", isVisible);
        toggleBtn.toggleClass("orvio__active", isVisible);

        if (isVisible) {
          submenu.find(".orvio__submenu-item").each(function (index) {
            $(this).css({
              animation: `fadeInDown 0.3s ease forwards ${0.1 * index}s`,
              opacity: "0",
            });
          });
        }
      });
    });

    // Listen for the Bootstrap offcanvas close event to reset the menu
    const offcanvasElement = document.getElementById("offcanvasRight");
    if (offcanvasElement) {
      offcanvasElement.addEventListener("hidden.bs.offcanvas", function () {
        collapseAllSubmenus();
      });
    }
  };
  mobileMenuActivation();

  // Brand slider JS
  const brandsSlider = document.querySelector(".brands__slider");
  if (brandsSlider) {
    var brands_slider = new Swiper(brandsSlider, {
      slidesPerView: "auto",
      loop: true,
      autoplay: true,
      spaceBetween: 130,
      speed: 5000,
      autoplay: {
        delay: 1,
      },

      spaceBetween: 40,
      breakpoints: {
        576: {
          spaceBetween: 60,
        },
        768: {
          spaceBetween: 90,
        },
        1024: {
          spaceBetween: 130,
        },
      },
    });
  }

  // Blog slider JS
  const blogSixSlider = () => {
    const blogSixSlider = document.querySelector(".blog-6__slider");
    const blogSixNavigation = document.querySelector(".blog-6__navigation");

    if (!blogSixSlider && !blogSixNavigation) {
      return;
    }

    if (blogSixSlider) {
      var blog_slider = new Swiper(blogSixSlider, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        // autoplay: true,
        speed: 1000,
        // autoplay: {
        //   delay: 1000,
        // },
        navigation: {
          nextEl: blogSixNavigation.querySelector(".next-btn"),
          prevEl: blogSixNavigation.querySelector(".prev-btn"),
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
          1199: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },
      });
    }
  };
  blogSixSlider();
  // Blog slider JS
  const testimonialFiveSlider = () => {
    const testimonialFiveSlider = document.querySelector(".testimonial-5__slider");
    const testimonialFiveNavigation = document.querySelector(".testimonial-5__navigation");

    if (!testimonialFiveSlider && !testimonialFiveNavigation) {
      return;
    }

    if (testimonialFiveSlider) {
      var blog_slider = new Swiper(testimonialFiveSlider, {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        // autoplay: true,
        speed: 1000,
        // autoplay: {
        //   delay: 1000,
        // },
        navigation: {
          nextEl: testimonialFiveNavigation.querySelector(".next-btn"),
          prevEl: testimonialFiveNavigation.querySelector(".prev-btn"),
        },
      });
    }
  };
  testimonialFiveSlider();

  const textSliderHomeFive = () => {
    const textSlider = document.querySelector(".hero-five__text-slider");

    if (!textSlider) {
      return; // Stop if the element doesn't exist
    }

    new Swiper(textSlider, {
      slidesPerView: "auto",
      spaceBetween: 25,
      loop: true,
      speed: 5000,
      allowTouchMove: false,
      autoplay: {
        delay: 1,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },
      768: {
        spaceBetween: 50,
      },
    });
  };

  textSliderHomeFive();

  // Hero Two Gallery Slider JS
  const heroTwoGallerySlider = document.querySelector(".hero-two__gallery-slider");
  if (heroTwoGallerySlider) {
    var hero_two_gallery_slider = new Swiper(heroTwoGallerySlider, {
      slidesPerView: "auto",
      loop: true,
      autoplay: true,
      speed: 5000,
      autoplay: {
        delay: 1,
      },
      spaceBetween: 15,
    });
  }

  // Brands Three Slider JS
  const brandsThreeSlider = document.querySelector(".brands-3__slider");
  if (brandsThreeSlider) {
    var brands_slider = new Swiper(brandsThreeSlider, {
      slidesPerView: "auto",
      loop: true,
      autoplay: true,
      spaceBetween: 20,
      speed: 5000,
      autoplay: {
        delay: 1,
      },
    });
  }

  // Footer Two Marquee JS
  const footerTwoMarquee = document.querySelector(".footer-two__marquee");
  if (footerTwoMarquee) {
    var brands_slider = new Swiper(footerTwoMarquee, {
      slidesPerView: "auto",
      loop: true,
      spaceBetween: 130,
      speed: 15000,
      autoplay: {
        delay: 1,
      },

      spaceBetween: 50,
      breakpoints: {
        768: {
          spaceBetween: 100,
        },
      },
    });
  }

  // Text Slider JS
  const textSlider = document.querySelector(".text__slider");
  if (textSlider) {
    var brands_slider = new Swiper(textSlider, {
      slidesPerView: "auto",
      loop: true,
      autoplay: true,
      spaceBetween: 20,
      speed: 5000,
      autoplay: {
        delay: 1,
      },
    });
  }

  // Testimonial Two Thumb Sliders JS
  const testimonialTwoThumbSliders = document.querySelectorAll(".testimonial-2__thumb-slider");
  if (testimonialTwoThumbSliders && testimonialTwoThumbSliders.length > 0) {
    testimonialTwoThumbSliders.forEach(function (slider) {
      const isV2 = slider.classList.contains("v2");

      new Swiper(slider, {
        direction: "vertical",
        loop: true,
        slidesPerView: "auto",
        spaceBetween: 15,
        watchOverflow: true,
        speed: 3500,
        autoplay: {
          delay: 1,
          reverseDirection: isV2,
        },
        breakpoints: {
          1199: {
            spaceBetween: 25,
          },
        },
      });
    });
  }

  // Testimonial Two Slider JS
  const testimonialTwoSlider = document.querySelector(".testimonial-2__slider");
  const testimonialTwoPagination = document.querySelector(".testimonial-2__slider-pagination");
  if (testimonialTwoSlider && testimonialTwoPagination) {
    const testimonialSwiper = new Swiper(testimonialTwoSlider, {
      loop: true,
      speed: 600,
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
        el: testimonialTwoPagination,
        clickable: true,
      },
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
    });
  }

  // Testimonial Slider JS
  const testimonialSlider = document.querySelector(".testimonial__slider");
  const testimonialPagination = document.querySelector(".testimonial__pagination");
  if (testimonialSlider && testimonialPagination) {
    const swiper = new Swiper(testimonialSlider, {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 10,
      speed: 3000,
      // speed: 400,
      autoplay: {
        delay: 1,
        disableOnInteraction: false,
      },
      pagination: {
        el: testimonialPagination,
        type: "progressbar",
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1500: {
          slidesPerView: 2.5,
          spaceBetween: 20,
          centeredSlides: true,
        },
      },
    });
  }

  const testimonialThreeSlider = () => {
    const sliderContainer = document.querySelector(".testimonial-3__slider");
    const sliderNavigation = document.querySelector(".testimonial-3__navigation");

    if (!sliderContainer && !sliderNavigation) {
      return;
    }

    const swiper = new Swiper(sliderContainer, {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 1500,
      grabCursor: true,
      centeredSlides: true,
      navigation: {
        nextEl: sliderNavigation.querySelector(".button-next"),
        prevEl: sliderNavigation.querySelector(".button-prev"),
      },
    });
  };
  testimonialThreeSlider();

  const heroFourSlider = () => {
    const sliderContainer = document.querySelector(".hero-four__slider");
    const sliderPagination = document.querySelector(".hero-four__pagination");

    if (!sliderContainer && !sliderPagination) {
      return;
    }

    const swiper = new Swiper(sliderContainer, {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 3000,
      grabCursor: true,
      centeredSlides: true,

      autoplay: {
        delay: 500,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      },

      pagination: {
        el: sliderPagination,
        clickable: true,
      },

      breakpoints: {
        992: {
          slidesPerView: 1.2,
        },
      },
    });
  };
  heroFourSlider();

  const featuredSlider = () => {
    // 1. Validate if the slider container exists on the page.
    const sliderContainer = document.querySelector(".featured__slider");
    const sliderPagination = document.querySelector(".featured__pagination");

    if (!sliderContainer && !sliderPagination) {
      return;
    }

    // 2. If validation passes, initialize the slider.
    const swiper = new Swiper(sliderContainer, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 3000,
      grabCursor: true,

      autoplay: {
        delay: 1,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      pagination: {
        el: sliderPagination,
        clickable: true,
      },

      breakpoints: {
        576: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 2.4,
          centeredSlides: true,
        },
        1199: {
          slidesPerView: 3.5,
        },
        1299: {
          slidesPerView: 3.8,
        },
      },
    });
  };
  featuredSlider();

  const initializeProductImageSwitcher = () => {
    const productItems = document.querySelectorAll(".best-sells__item");

    if (!productItems.length > 0) return;
    productItems.forEach((item) => {
      const images = item.querySelectorAll(".item-thumb img");
      const colorSpans = item.querySelectorAll(".item-color-variation span");

      if (!images || !colorSpans) return;

      // 1. Initially, make the first image active if it exists
      if (images.length > 0) {
        images.forEach((img) => img.classList.remove("active"));
        images[0].classList.add("active");
      }

      // 2. Add a click event listener to each color span
      colorSpans.forEach((span, index) => {
        span.addEventListener("mouseenter", () => {
          if (images[index]) {
            images.forEach((img) => img.classList.remove("active"));
            images[index].classList.add("active");
          }
        });
      });
    });
  };
  initializeProductImageSwitcher();

  const startCountdown = () => {
    const counter = document.querySelector(".counter-clock");
    if (!counter) return;

    const dateStr = counter.getAttribute("data-upcoming-date");
    if (!dateStr) return;

    const [day, month, year] = dateStr.split("-");
    const targetDate = new Date(`${year}-${month}-${day}T00:00:00`);
    let interval;

    function updateCountdown() {
      const now = new Date();
      const timeLeft = targetDate - now;

      if (timeLeft <= 0) {
        counter.querySelector(".days").textContent = "00";
        counter.querySelector(".hours").textContent = "00";
        counter.querySelector(".minutes").textContent = "00";
        counter.querySelector(".seconds").textContent = "00";
        clearInterval(interval);
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
      const seconds = Math.floor((timeLeft / 1000) % 60);

      counter.querySelector(".days").textContent = String(days).padStart(2, "0");
      counter.querySelector(".hours").textContent = String(hours).padStart(2, "0");
      counter.querySelector(".minutes").textContent = String(minutes).padStart(2, "0");
      counter.querySelector(".seconds").textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    interval = setInterval(updateCountdown, 1000);
  };
  startCountdown();

  const handleSwatchClickColor = () => {
    const swatches = document.querySelectorAll(".color-swatches .swatch");
    const selectedColorText = document.querySelector(".option-group .option-label .selected-option");

    if (!swatches.length > 0 || !selectedColorText) return;
    swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => {
        swatches.forEach((s) => s.classList.remove("active"));
        swatch.classList.add("active");

        const color = swatch.getAttribute("title");
        if (selectedColorText) selectedColorText.textContent = color;
      });
    });
  };
  handleSwatchClickColor();

  const handleSizeSelection = () => {
    const sizeButtons = document.querySelectorAll(".size-selector .size-btn");
    const selectedSizeText = document.querySelectorAll(".option-group .option-label .selected-option")[1]; // second .selected-option

    if (!sizeButtons.length > 0 || !selectedSizeText) return;

    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        sizeButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");

        const size = button.textContent.trim();
        if (selectedSizeText) selectedSizeText.textContent = size;
      });
    });
  };
  handleSizeSelection();

  const handleQuantityChange = () => {
    const quantityWrapper = document.querySelector(".quantity-selector");

    if (!quantityWrapper) return;

    const decreaseBtn = quantityWrapper.querySelector(".decrement");
    const increaseBtn = quantityWrapper.querySelector(".increment");
    const input = quantityWrapper.querySelector(".quantity-input");

    if (!decreaseBtn || !increaseBtn || !input) return;

    decreaseBtn.addEventListener("click", () => {
      let currentValue = parseInt(input.value, 10) || 1;
      if (currentValue > 1) {
        input.value = currentValue - 1;
      }
    });

    increaseBtn.addEventListener("click", () => {
      let currentValue = parseInt(input.value, 10) || 1;
      input.value = currentValue + 1;
    });

    input.addEventListener("input", () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) {
        input.value = 1;
      }
    });
  };

  handleQuantityChange();

  const setupSearchPopup = () => {
    const searchBtn = document.querySelector(".menu-btns .search");
    const popup = document.querySelector(".popup-search-box");
    const closeBtn = document.querySelector(".searchClose");

    if (!searchBtn || !popup || !closeBtn) return;

    searchBtn.addEventListener("click", () => {
      popup.classList.add("show");
    });

    closeBtn.addEventListener("click", () => {
      popup.classList.remove("show");
    });
  };
  setupSearchPopup();

  // Set Hover Active Class JS
  const setHoverActiveClass = (listenerSelector, targetSelector, activeClass = "active") => {
    if (typeof listenerSelector !== "string" || typeof targetSelector !== "string") {
      return;
    }

    const listeners = document.querySelectorAll(listenerSelector);

    if (listeners.length === 0) {
      return;
    }

    let currentActiveItem = listeners[0].querySelector(targetSelector);
    if (!currentActiveItem) {
      currentActiveItem = listeners[0];
    }
    currentActiveItem.classList.add(activeClass);

    listeners.forEach((listener) => {
      const targetElement = listener.querySelector(targetSelector) || listener;

      listener.addEventListener("mouseenter", function () {
        if (currentActiveItem && currentActiveItem !== targetElement) {
          currentActiveItem.classList.remove(activeClass);
        }
        targetElement.classList.add(activeClass);
        currentActiveItem = targetElement;
      });
    });
  };
  setHoverActiveClass(".work-process__item", ".work-process__item", "active");
  setHoverActiveClass(".service__item", ".service__item", "active");
  setHoverActiveClass(".team__item", ".team__item", "active");

  // Set Background Images JS
  const setBackgroundImages = () => {
    var elements = document.querySelectorAll("[data-bg-src]");
    if (elements?.length > 0) {
      elements.forEach(function (element) {
        var src = element.getAttribute("data-bg-src");
        element.style.backgroundImage = "url(" + src + ")";
        element.classList.add("background-image");
        element.removeAttribute("data-bg-src");
      });
    }
  };
  setBackgroundImages();

  // Set Current Year JS
  const setCurrentYear = () => {
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll(".current-year");
    if (yearElements?.length > 0) {
      yearElements.forEach((el) => {
        el.textContent = currentYear;
      });
    }
  };
  setCurrentYear();

  // Work TwoHover Activation JS
  const workTwoHoverActivation = () => {
    const items = document.querySelectorAll(".work-2__item");

    if (items.length > 0) {
      items.forEach((item) => {
        item.addEventListener("mouseenter", function () {
          if (!this.classList.contains("active")) {
            const activeItem = document.querySelector(".work-2__item.active");
            if (activeItem) {
              activeItem.classList.remove("active");
            }
            this.classList.add("active");
          }
        });
      });
    }
  };
  workTwoHoverActivation();

  // Dynamic Width Height JS
  const dynamicWidthHeight = () => {
    const links = document.querySelectorAll(".dynamic-width");

    links.forEach((link) => {
      const span = link.querySelector("span");
      if (span) {
        const spanWidth = span.offsetWidth;
        const spanHeight = span.offsetHeight;
        link.style.width = spanWidth + "px";
        link.style.height = spanHeight + "px";
      }
    });
  };
  dynamicWidthHeight();

  // Fill Lines With Spans  JS
  const fillLinesWithSpans = () => {
    const contentBox = document.querySelector(".content-box");
    const linesContainer = document.querySelector(".lines");

    if (!contentBox || !linesContainer) return;

    linesContainer.innerHTML = "";
    const gap = parseInt(linesContainer.getAttribute("data-gaps")) || 8;
    const spanWidth = 1;
    const contentBoxWidth = contentBox.offsetWidth;
    const totalSpans = Math.floor((contentBoxWidth + gap) / (spanWidth + gap));
    // Create and append spans
    for (let i = 0; i < totalSpans; i++) {
      const span = document.createElement("span");
      linesContainer.appendChild(span);
    }
  };
  fillLinesWithSpans();

  // Blog Filter JS
  const blogFilter = () => {
    const gridContainer = $(".filter-item-row");

    if (gridContainer.length > 0) {
      gridContainer.imagesLoaded(function () {
        let masonrySettings = {};
        let gutterValue = 0;

        if ($(window).width() >= 1200) {
          gutterValue = 30;
        } else if ($(window).width() >= 768) {
          gutterValue = 20;
        } else {
          gutterValue = 10;
        }

        if (gridContainer.hasClass("blog-3__masonry")) {
          masonrySettings = {
            columnWidth: ".filter-item",
            gutter: gutterValue,
            isFitWidth: true,
          };
        } else {
          masonrySettings = {
            columnWidth: ".filter-item",
          };
        }

        // --- New Logic for Initial Filter ---
        const filterMenu = $(".filter-menu-active");
        let initialFilterValue = "*";

        if (filterMenu.find('button[data-filter="*"]').length === 0) {
          initialFilterValue = filterMenu.find("button:first").attr("data-filter");
        }
        filterMenu.find("button").removeClass("active");
        filterMenu.find(`button[data-filter="${initialFilterValue}"]`).addClass("active");
        // --- End of New Logic ---

        const $grid = gridContainer.isotope({
          itemSelector: ".filter-item",
          percentPosition: true,
          masonry: masonrySettings,
          filter: initialFilterValue,
        });

        filterMenu.on("click", "button", function () {
          const filterValue = $(this).attr("data-filter");
          $grid.isotope({ filter: filterValue });
        });

        $grid.on("layoutComplete", function () {
          ScrollTrigger.refresh();
        });

        // $(".filter-menu").on("click", function (event) {
        //   event.preventDefault();
        //   $(this).addClass("active").siblings(".active").removeClass("active");
        // });
        // This is the corrected and combined handler
        filterMenu.on("click", "button", function (event) {
          event.preventDefault();
          $(this).addClass("active").siblings(".active").removeClass("active");
          const filterValue = $(this).attr("data-filter");
          $grid.isotope({ filter: filterValue });
        });
      });
    }
  };
  blogFilter();

  // Letter Showcase JS
  const letterShowcase = () => {
    const letterShowcaseSlider = document.querySelector(".letter-showcase__slider");
    const bulletsUl = document.querySelector(".bullets ul");
    const sliderImages = document.querySelector(".slider-images ul");

    if (letterShowcaseSlider && bulletsUl && sliderImages && typeof Swiper !== "undefined") {
      const lnx = document.querySelectorAll(".swiper-slide .slide-content .title");

      // Proceed only if there are titles to create bullets from.
      if (lnx.length > 0) {
        lnx.forEach(function (item) {
          var txt = item.textContent.charAt(0);
          var li = document.createElement("li");
          li.classList.add("magnetize");
          li.setAttribute("data-dist", "1");

          var span = document.createElement("span");
          span.setAttribute("data-cursor-type", "medium");
          span.textContent = txt;

          li.appendChild(span);
          bulletsUl.appendChild(li);
        });

        // Safely add initial 'focus' class only if the elements exist
        const firstBullet = bulletsUl.querySelector("li:first-child");
        const firstSliderImage = document.querySelector(".slider-images ul li:first-child");

        if (firstBullet) {
          firstBullet.classList.add("focus");
        }
        if (firstSliderImage) {
          firstSliderImage.classList.add("focus");
        }

        // Initialize Swiper
        const swiper = new Swiper(".letter-showcase__slider", {
          speed: 1000,
          direction: "vertical",
          slidesPerView: "auto",
          simulateTouch: false,
          mousewheel: true,
          on: {
            slideChange: function () {
              const aktifindex = swiper.activeIndex;
              const coord = aktifindex * -55;

              const allBullets = document.querySelectorAll(".bullets ul li");
              const allSliderImages = document.querySelectorAll(".slider-images ul li");

              allBullets.forEach(function (item) {
                item.classList.remove("focus");
              });
              allSliderImages.forEach(function (item) {
                item.classList.remove("focus");
              });

              // Check if the elements exist at the active index before adding class
              if (allBullets[aktifindex]) {
                allBullets[aktifindex].classList.add("focus");
              }
              if (allSliderImages[aktifindex]) {
                allSliderImages[aktifindex].classList.add("focus");
              }

              bulletsUl.style.marginTop = coord + "px";

              const videos = document.querySelectorAll(".slider-images video");
              videos.forEach(function (video) {
                video.pause();
              });

              const focusedVideo = document.querySelector(".slider-images .focus video");
              if (focusedVideo) {
                focusedVideo.play();
              }
            },
          },
        });

        const bulletListItems = document.querySelectorAll(".bullets ul li");
        bulletListItems.forEach(function (item, index) {
          item.addEventListener("click", function () {
            swiper.slideTo(index);
          });
        });
      }
    }
  };
  letterShowcase();

  // Magnetize Func JS
  const magnetizeFunc = () => {
    if ($(window).width() >= 1024) {
      $(document).on("mousemove touch", function (e) {
        $(".magnetize").each(function () {
          magnetize(this, e);
        });
      });

      function magnetize(el, e) {
        var mX = e.pageX,
          mY = e.pageY;
        const item = $(el);

        const customDist = item.data("dist") * 20 || 120;
        const centerX = item.offset().left + item.width() / 2;
        const centerY = item.offset().top + item.height() / 2;

        var deltaX = Math.floor(centerX - mX) * -0.45;
        var deltaY = Math.floor(centerY - mY) * -0.45;

        var distance = calculateDistance(item, mX, mY);

        if (distance < customDist) {
          TweenMax.to(item, 0.5, { y: deltaY, x: deltaX });
          item.addClass("magnet");
        } else {
          TweenMax.to(item, 0.6, { y: 0, x: 0, scale: 1 });
          item.removeClass("magnet");
        }
      }

      function calculateDistance(elem, mouseX, mouseY) {
        return Math.floor(Math.sqrt(Math.pow(mouseX - (elem.offset().left + elem.width() / 2), 2) + Math.pow(mouseY - (elem.offset().top + elem.height() / 2), 2)));
      }
    }
  };
  magnetizeFunc();

  // Creative ThumbSlider JS
  const creativeThumbSlider = () => {
    const creativeThumbBackgroundDisplay = document.querySelector(".creative-thumb__background");
    const showcaseTitle = document.querySelector(".creative-thumb-title");
    const creativeThumbSlider = document.querySelector(".creative-thumb__slider");
    const creativeThumbPagination = document.querySelector(".creative-thumb__pagination");

    // --- CORE LOGIC ---
    function updateShowcase(swiper) {
      const activeVisualIndex = swiper.activeIndex + 1;
      const activeSlide = swiper.slides[activeVisualIndex];
      if (!activeSlide) return;

      // --- Update Visual Classes and Nudge Neighbors ---
      const nudgeAmount = 25; // The amount to push neighboring slides

      swiper.slides.forEach((slide, index) => {
        slide.classList.remove("custom-active-slide");
        // Reset any previous nudges
        slide.style.transform = "";
      });

      // Add active class to the correct slide
      activeSlide.classList.add("custom-active-slide");

      // Nudge the slide *before* the active one to the left
      const prevSlide = swiper.slides[activeVisualIndex - 1];
      if (prevSlide) {
        prevSlide.style.transform = `translateX(-${nudgeAmount}px)`;
      }

      // Nudge the slide *after* the active one to the right
      const nextSlide = swiper.slides[activeVisualIndex + 1];
      if (nextSlide) {
        nextSlide.style.transform = `translateX(${nudgeAmount}px)`;
      }

      // --- Update Background and Title ---
      const title = activeSlide.dataset.title;
      const bgUrl = activeSlide.dataset.src;
      creativeThumbBackgroundDisplay.style.backgroundImage = `url('${bgUrl}')`;

      if (showcaseTitle.textContent !== title) {
        showcaseTitle.style.opacity = "0";
        setTimeout(() => {
          showcaseTitle.textContent = title;
          showcaseTitle.style.opacity = "1";
        }, 300);
      }
    }

    // --- STARTUP ---
    // No need to initialize slides from JS anymore.

    // Initialize Swiper
    const swiper = new Swiper(creativeThumbSlider, {
      slidesPerView: 3,
      spaceBetween: 0,
      loop: true,
      mousewheel: true,
      grabCursor: true,
      speed: 1000,
      pagination: {
        el: creativeThumbPagination,
        type: "progressbar",
      },
      breakpoints: {
        768: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
      },
      breakpoints: {
        992: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
      },
      on: {
        init: function () {
          updateShowcase(this);
        },
        slideChange: function () {
          updateShowcase(this);
        },
        transitionEnd: function () {
          updateShowcase(this);
        },
      },
    });
  };
  creativeThumbSlider();

  // GSAP Smooth Scrolling
  var device_width = window.screen.width;
  if (device_width > 767) {
    gsap.config({
      nullTargetWarn: false,
    });
    const smoother = ScrollSmoother.create({
      smooth: 0.9,
      effects: device_width < 1025 ? false : true,
      smoothTouch: 0.1,
      normalizeScroll: {
        allowNestedScroll: true,
      },
      ignoreMobileResize: true,
    });
  }

  // Enable Smooth Scrolling With GSAP
  const enableSmoothScrollingWithGSAP = (offset = 70, duration = 0.2, ease = "power2.inOut") => {
    const anchors = document.querySelectorAll('a[href^="#"]');

    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();

          gsap.to(window, {
            duration: duration,
            scrollTo: {
              y: targetElement,
              offsetY: offset,
            },
            ease: ease,
          });
        }
      });
    });
  };
  enableSmoothScrollingWithGSAP();

  // Hero Video Animation
  const introductionVideo = document.querySelector(".introduction__video");

  if (introductionVideo) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const videoWrapper = introductionVideo.querySelector("video");

      if (videoWrapper) {
        let tp_hero = gsap.timeline({
          scrollTrigger: {
            trigger: introductionVideo,
            start: "top 70",
            pin: true,
            markers: false,
            scrub: 1,
            pinSpacing: true,
            end: "bottom top",
            invalidateOnRefresh: true,
          },
        });

        tp_hero.to(videoWrapper, {
          width: "100%",
          duration: 1.5,
          ease: "power2.inOut",
        });

        return () => {
          tp_hero.kill();
        };
      }
    });
  }

  // Work Three Item Animation GSAP
  const workThreeItemAnimation = () => {
    gsap.utils.toArray(".work-3__item").forEach((item, index) => {
      const isEven = index % 2 === 0;
      const xStart = isEven ? "100vw" : "-100vw";

      if (window.innerWidth >= 1024) {
        const titleLink = item.querySelector(".title a");
        if (titleLink) {
          gsap.fromTo(
            titleLink,
            {
              x: xStart,
            },
            {
              x: "0%",
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom 50%",
                scrub: 0.5,
                toggleActions: "play none none reverse",
                markers: false,
              },
            }
          );
        }
      }
    });
  };
  workThreeItemAnimation();

  // Hero Two Animation GSAP
  const heroTwoAnimation = () => {
    if (window.screen.width >= 1200) {
      const galleryContainer = document.querySelector(".hero-two__gallery");
      const headerSection = document.querySelector(".hero-two__content");
      const thumbnails = document.querySelectorAll(".hero-two__gallery > .thumbnail");
      const backgroundImages = document.querySelectorAll(".background-img");
      let initialSize;
      let currentSizeMap = [];

      if (galleryContainer && headerSection && thumbnails && backgroundImages) {
        const baseSizeMap = [
          [220, 200, 180, 160, 140, 120, 100, 90, 80, 75],
          [180, 220, 180, 160, 140, 120, 110, 100, 90, 80],
          [160, 180, 220, 180, 160, 140, 120, 110, 100, 80],
          [140, 160, 180, 220, 180, 160, 140, 120, 100, 100],
          [120, 140, 160, 180, 220, 180, 160, 140, 120, 100],
          [100, 120, 140, 160, 180, 220, 180, 160, 140, 120],
          [100, 100, 110, 120, 140, 180, 220, 180, 160, 140],
          [80, 90, 100, 120, 140, 160, 180, 220, 180, 160],
          [60, 70, 80, 100, 120, 140, 160, 180, 220, 180],
          [75, 80, 90, 100, 110, 120, 140, 160, 180, 220],
        ];

        const setupSizes = () => {
          const screenWidth = window.innerWidth;

          if (screenWidth >= 1800) {
            const galleryContainerWidth = galleryContainer.offsetWidth;
            initialSize = galleryContainerWidth / thumbnails.length;
            // initialSize = 140;
          } else if (screenWidth >= 1200) {
            initialSize = 110;
          }

          const scale = initialSize / 140;
          currentSizeMap = baseSizeMap.map((row) => row.map((size) => size * scale));

          gsap.set(thumbnails, { width: initialSize, height: initialSize });
        };
        setupSizes();
        window.addEventListener("resize", setupSizes());

        const handleMouseOver = (e) => {
          const hoveredIndex = parseInt(e.currentTarget.dataset.index, 10);

          gsap.to(headerSection, { opacity: 0, duration: 0.4 });
          backgroundImages.forEach((bg, index) => {
            gsap.to(bg, {
              opacity: index === hoveredIndex ? 1 : 0,
              duration: 0.4,
            });
          });

          thumbnails.forEach((thumb) => thumb.classList.remove("hovered"));
          e.currentTarget.classList.add("hovered");

          const currentHoverMap = currentSizeMap[hoveredIndex];
          if (!currentHoverMap) return;

          thumbnails.forEach((thumb, index) => {
            const size = currentHoverMap[index] || initialSize;
            gsap.to(thumb, { width: size, height: size, duration: 0.3 });
          });
        };

        const handleMouseLeave = () => {
          gsap.to(headerSection, { opacity: 1, duration: 0.4 });
          gsap.to(backgroundImages, { opacity: 0, duration: 0.4 });
          gsap.to(thumbnails, {
            width: initialSize,
            height: initialSize,
            duration: 0.3,
          });
          thumbnails.forEach((thumb) => thumb.classList.remove("hovered"));
        };

        thumbnails.forEach((thumbnail) => {
          thumbnail.addEventListener("mouseover", handleMouseOver);
        });
        galleryContainer.addEventListener("mouseleave", handleMouseLeave);
      }
    }
  };
  heroTwoAnimation();

  // Animate Counter GSAP
  const animateCounter = (element, target) => {
    const counter = { value: 0 };
    gsap.to(counter, {
      duration: 1.5,
      value: target,
      ease: "power2.out",
      onUpdate: function () {
        element.textContent = Math.round(counter.value) + "%";
      },
    });
  };

  // Animate Skills GSAP
  const animateSkills = () => {
    let tl = gsap.timeline({ paused: true });
    tl.kill();
    tl = gsap.timeline();
    gsap.set(".progress-bar", { width: "0%" });
    gsap.set(".skill-percentage", { opacity: 0, right: "100%" });
    gsap.set(".skill-item", { opacity: 0, x: -50 });

    // Skill items fade/slide in
    tl.to(
      ".skill-item",
      {
        duration: 0.6,
        opacity: 1,
        x: 0,
        stagger: 0.2,
        ease: "power2.out",
      },
      "-=0.4"
    );

    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar, index) => {
      const percentage = parseInt(bar.getAttribute("data-percentage"));
      const percentageElement = bar.parentElement.querySelector(".skill-percentage");

      tl.to(
        bar,
        {
          duration: 1.5,
          width: percentage + "%",
          ease: "power3.out",
        },
        index === 0 ? "+=0.2" : "-=1.3"
      ).to(
        percentageElement,
        {
          duration: 1.5,
          right: 100 - percentage + "%",
          opacity: 1,
          ease: "power3.out",
          onStart: function () {
            animateCounter(percentageElement, percentage);
          },
        },
        "-=1.5"
      );
    });
  };

  // Skill Scroll Trigger GSAP
  const SkillScrollTrigger = () => {
    ScrollTrigger.create({
      trigger: ".user-info.skills",
      start: "top 80%",
      onEnter: () => animateSkills(),
      once: true,
    });
  };
  SkillScrollTrigger();

  // Sticky Section GSAP
  let stickySection = gsap.matchMedia();
  const gsapSectionSticky = () => {
    stickySection.add("(min-width: 992px)", () => {
      if ($(".gsap-p-sticky-wrapper").length > 0) {
        ScrollTrigger.create({
          trigger: ".gsap-p-sticky-wrapper",
          start: "top 15px",
          end: "bottom 103%",
          pin: ".gsap-p-sticky",
          pinSpacing: true,
        });
      }
    });
  };
  gsapSectionSticky();

  // Create Sticky ScrollTrigger GSAP
  const createStickyScrollTrigger = (endValue) => {
    if ($(".gsap-sticky-wrapper").length > 0) {
      ScrollTrigger.create({
        trigger: ".gsap-sticky-wrapper",
        start: "top 15px",
        end: `bottom ${endValue}`,
        pin: ".gsap-sticky",
        pinSpacing: true,
      });
    }
  };

  stickySection.add("(min-width: 992px)", () => {
    createStickyScrollTrigger("300%");
  });

  // Horaizental Scrolling GSAP
  const horaizentalScrolling = () => {
    let horizontalSection = document.querySelector(".work-process__items");
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      if (horizontalSection) {
        gsap.to(".work-process__items", {
          x: () => horizontalSection.scrollWidth * -1,
          xPercent: 100,
          scrollTrigger: {
            trigger: ".work-process__items",
            start: "top 20%",
            end: "+=2000px",
            pin: ".work-process.section",
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        });
      }
    });
  };
  horaizentalScrolling();

  // Vertical Showcase GSAP
  const verticalShowcase = () => {
    const verticalShowcase = document.querySelector(".vertical-showcase__slider");
    const verticalShowcaseNavigation = document.querySelector(".vertical-showcase__navigation");

    if (verticalShowcase && verticalShowcaseNavigation) {
      const titles = gsap.utils.toArray(".vertical-showcase__slider .title");
      const charsArray = titles.map((title) => new SplitText(title, { type: "chars" }).chars);

      // 1. SET DEFAULT STATE FOR ALL SLIDES
      gsap.set(charsArray, {
        opacity: 0,
        filter: "blur(10px)",
        y: 10,
      });

      var swiper = new Swiper(verticalShowcase, {
        slidesPerView: 1,
        loop: true,
        speed: 1000,
        // mousewheel: true,
        navigation: {
          nextEl: verticalShowcaseNavigation.querySelector(".button-next"),
          prevEl: verticalShowcaseNavigation.querySelector(".button-prev"),
        },
        on: {
          init: function (swiper) {
            // ANIMATE THE FIRST ACTIVE SLIDE
            const activeChars = charsArray[swiper.realIndex];
            gsap.to(activeChars, {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
            });
          },
          slideChange: function (swiper) {
            // 👇 THIS IS THE KEY CHANGE
            // 1. First, immediately reset ALL titles to the inactive state.
            gsap.set(charsArray, {
              opacity: 0,
              filter: "blur(10px)",
              y: 10,
            });

            // 2. Then, animate ONLY the new active slide's title into view.
            const activeChars = charsArray[swiper.realIndex];
            gsap.to(activeChars, {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
            });
          },
        },
      });
    }
  };
  verticalShowcase();

  // split Instance Text Effect GSAP
  let splitInstance;
  const tp_text_invert = () => {
    if (splitInstance) {
      splitInstance.revert();
    }
    splitInstance = new SplitText(".tp_text_invert", { type: "lines" });
    splitInstance.lines.forEach((target) => {
      gsap.to(target, {
        backgroundPositionX: 0,
        ease: "none",
        scrollTrigger: {
          trigger: target,
          scrub: 1,
          start: "top 85%",
          end: "bottom center",
        },
      });
    });
  };
  tp_text_invert();

  // fadeAnim GSAP
  const fadeAnim = () => {
    // Fade-in animation for elements with the class "fade-anim"
    let fadeArray_items = document.querySelectorAll(".fade-anim");
    if (fadeArray_items.length > 0) {
      let mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const fadeArray = gsap.utils.toArray(".fade-anim");
        fadeArray.forEach((item, i) => {
          var fade_direction = "bottom";
          var onscroll_value = 1;
          var duration_value = 1.15;
          var fade_offset = 50;
          var delay_value = 0.15;
          var ease_value = "power2.out";
          if (item.getAttribute("data-offset")) {
            fade_offset = item.getAttribute("data-offset");
          }
          if (item.getAttribute("data-duration")) {
            duration_value = item.getAttribute("data-duration");
          }
          if (item.getAttribute("data-direction")) {
            fade_direction = item.getAttribute("data-direction");
          }
          if (item.getAttribute("data-on-scroll")) {
            onscroll_value = item.getAttribute("data-on-scroll");
          }
          if (item.getAttribute("data-delay")) {
            delay_value = item.getAttribute("data-delay");
          }
          if (item.getAttribute("data-ease")) {
            ease_value = item.getAttribute("data-ease");
          }
          let animation_settings = {
            opacity: 0,
            ease: ease_value,
            duration: duration_value,
            delay: delay_value,
          };
          if (fade_direction == "top") {
            animation_settings["y"] = -fade_offset;
          }
          if (fade_direction == "left") {
            animation_settings["x"] = -fade_offset;
          }
          if (fade_direction == "bottom") {
            animation_settings["y"] = fade_offset;
          }
          if (fade_direction == "right") {
            animation_settings["x"] = fade_offset;
          }
          if (onscroll_value == 1) {
            animation_settings["scrollTrigger"] = {
              trigger: item,
              start: "top 85%",
            };
          }
          gsap.from(item, animation_settings);
        });
      });
    }
  };
  fadeAnim();

  // Text Invert With Scroll
  const split = new SplitText(".text-invert", { type: "lines" });
  split.lines.forEach((target) => {
    gsap.to(target, {
      backgroundPositionX: 0,
      ease: "none",
      scrollTrigger: {
        trigger: target,
        scrub: 1,
        start: "top 85%",
        end: "bottom center",
      },
    });
  });

  if (document.querySelectorAll(".char-anim").length > 0) {
    var animation_char_come_items = document.querySelectorAll(".char-anim");
    animation_char_come_items.forEach((item) => {
      var stagger_value = 0.05;
      var translateX_value = 20;
      var translateY_value = false;
      var onscroll_value = 1;
      var data_delay = 0.1;
      var data_duration = 1;
      var ease_value = "power2.out";

      if (item.getAttribute("data-stagger")) {
        stagger_value = item.getAttribute("data-stagger");
      }
      if (item.getAttribute("data-translateX")) {
        translateX_value = item.getAttribute("data-translateX");
      }
      if (item.getAttribute("data-translateY")) {
        translateY_value = item.getAttribute("data-translateY");
      }
      if (item.getAttribute("data-on-scroll")) {
        onscroll_value = item.getAttribute("data-on-scroll");
      }
      if (item.getAttribute("data-delay")) {
        data_delay = item.getAttribute("data-delay");
      }
      if (item.getAttribute("data-ease")) {
        ease_value = item.getAttribute("data-ease");
      }
      if (item.getAttribute("data-duration")) {
        data_duration = item.getAttribute("data-duration");
      }

      if (onscroll_value == 1) {
        if (translateX_value > 0 && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: data_duration,
            delay: data_delay,
            x: translateX_value,
            autoAlpha: 0,
            stagger: stagger_value,
            ease: ease_value,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          });
        }
        if (translateY_value > 0 && !translateX_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: data_duration,
            delay: data_delay,
            y: translateY_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          });
        }
        if (translateX_value && translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 2,
            delay: data_delay,
            y: translateY_value,
            x: translateX_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          });
        }
        if (!translateX_value && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            x: 50,
            autoAlpha: 0,
            stagger: stagger_value,
            ease: ease_value,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
            },
          });
        }
      } else {
        if (translateX_value > 0 && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            x: translateX_value,
            ease: ease_value,
            autoAlpha: 0,
            stagger: stagger_value,
          });
        }
        if (translateY_value > 0 && !translateX_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            y: translateY_value,
            autoAlpha: 0,
            ease: ease_value,
            stagger: stagger_value,
          });
        }
        if (translateX_value && translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            y: translateY_value,
            x: translateX_value,
            ease: ease_value,
            autoAlpha: 0,
            stagger: stagger_value,
          });
        }
        if (!translateX_value && !translateY_value) {
          let split_char = new SplitText(item, {
            type: "chars, words",
          });
          gsap.from(split_char.chars, {
            duration: 1,
            delay: data_delay,
            ease: ease_value,
            x: 50,
            autoAlpha: 0,
            stagger: stagger_value,
          });
        }
      }
    });

    let revealContainers = document.querySelectorAll(".return");

    revealContainers.forEach((container) => {
      let image = container.querySelector("img");
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          toggleActions: "restart none none reset",
        },
      });

      tl.set(container, { autoAlpha: 1 });
      tl.from(container, 1.5, {
        xPercent: -100,
        ease: Power2.out,
      });
      tl.from(image, 1.5, {
        xPercent: 100,
        scale: 1.3,
        delay: -1.5,
        ease: Power2.out,
      });
    });
  }

  // BoxesRight Fade Animation GSAP
  const boxesRight = document.querySelectorAll(".fade-right-item");
  if (boxesRight.length > 0) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      gsap.from(boxesRight, {
        x: "100%",
        duration: 1.5,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          scrub: 5,
          trigger: ".fade-right-section",
          start: "top 100%",
          end: "bottom 80%",
          toggleActions: "play none none reverse",
          markers: false,
        },
      });
    });
  }

  // BoxesLeft Fade Animation GSAP
  const boxesLeft = document.querySelectorAll(".fade-left-item");
  if (boxesLeft.length > 0) {
    gsap.from(boxesLeft, {
      x: "-100%",
      duration: 1.5,
      stagger: 0.3,
      ease: "power2.out",
      scrollTrigger: {
        scrub: 5,
        trigger: ".fade-left-section",
        start: "top 100%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
        markers: false,
      },
    });
  }

  // GSAP title animation
  const orvio_title_anim = document.querySelectorAll(".orvio_title_anim");
  if (orvio_title_anim.length > 0) {
    let mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      let splitTitleLines = gsap.utils.toArray(".orvio_title_anim");
      splitTitleLines.forEach((splitTextLine) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: splitTextLine,
            start: "top 90%",
            end: "bottom 60%",
            scrub: false,
            markers: false,
            toggleActions: "play none none reverse",
          },
        });

        const itemSplitted = new SplitText(splitTextLine, {
          type: "words, lines",
        });
        gsap.set(splitTextLine, { perspective: 400 });
        itemSplitted.split({ type: "lines" });
        tl.from(itemSplitted.lines, {
          duration: 1,
          delay: 0.3,
          opacity: 0,
          rotationX: -80,
          force3D: true,
          transformOrigin: "top center -50",
          stagger: 0.1,
        });
      });
    });
  }

  // pin on bottom
  var pin_on_bottom = document.querySelectorAll(".pin-on-bottom");
  pin_on_bottom.forEach((el) => {
    gsap.to(el, {
      paddingBottom: "2000px",
      ease: "none",
      scrollTrigger: {
        trigger: el,
        pin: true,
        start: "bottom 90%",
        end: "bottom top",
        pinSpacing: false,
        scrub: 3,
        markers: false,
      },
    });
  });

  var animation_text = function () {
    if ($(".split-text").length > 0) {
      var st = $(".split-text");
      if (st.length === 0) return;
      gsap.registerPlugin(SplitText, ScrollTrigger);
      st.each(function (index, el) {
        const $el = $(el);
        const $target = $el.find("p, a").length > 0 ? $el.find("p, a")[0] : el;
        const hasClass = $el.hasClass.bind($el);
        const pxl_split = new SplitText($target, {
          type: "words, chars",
          lineThreshold: 0.5,
          linesClass: "split-line",
        });
        let split_type_set = pxl_split.chars;
        gsap.set($target, { perspective: 400 });

        const settings = {
          scrollTrigger: {
            trigger: $target,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
          duration: 0.9,
          stagger: 0.02,
          ease: "power3.out",
        };

        if (hasClass("effect-fade")) settings.opacity = 0;

        if (hasClass("split-lines-transform") || hasClass("split-lines-rotation-x")) {
          pxl_split.split({
            type: "lines",
            lineThreshold: 0.5,
            linesClass: "split-line",
          });
          split_type_set = pxl_split.lines;
          settings.opacity = 0;
          settings.stagger = 0.5;
          if (hasClass("split-lines-rotation-x")) {
            settings.rotationX = -120;
            settings.transformOrigin = "top center -50";
          } else {
            settings.yPercent = 100;
            settings.autoAlpha = 0;
          }
        }

        if (hasClass("split-words-scale")) {
          pxl_split.split({ type: "words" });
          split_type_set = pxl_split.words;
          split_type_set.forEach((elw, index) => {
            gsap.set(
              elw,
              {
                opacity: 0,
                scale: index % 2 === 0 ? 0 : 2,
                force3D: true,
                duration: 0.1,
                ease: "power3.out",
                stagger: 0.02,
              },
              index * 0.01
            );
          });
          gsap.to(split_type_set, {
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
            },
            rotateX: "0",
            scale: 1,
            opacity: 1,
          });
        } else if (hasClass("effect-blur-fade")) {
          pxl_split.split({ type: "words" });
          split_type_set = pxl_split.words;
          gsap.fromTo(
            split_type_set,
            { opacity: 0, filter: "blur(10px)", y: 20 },
            {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: $target,
                start: "top 86%",
                toggleActions: "play none none reverse",
              },
            }
          );
        } else {
          gsap.from(split_type_set, settings);
        }
      });
    }
  };
  animation_text();

  // const setupMouseMoveAnimation = () => {
  //   const containers = document.querySelectorAll(".move-box-wrap");

  //   if (containers.length === 0) {
  //     return;
  //   }

  //   containers.forEach((container) => {
  //     const moveItems = container.querySelectorAll(".move-item");
  //     if (moveItems.length === 0) {
  //       return;
  //     }
  //     gsap.set(moveItems, { x: 0, y: 0 });
  //     const maxMovement = 20;

  //     container.addEventListener("mousemove", (e) => {
  //       const rect = container.getBoundingClientRect();
  //       const mouseX = e.clientX - rect.left;
  //       const mouseY = e.clientY - rect.top;

  //       const moveX = (mouseX / rect.width - 0.5) * 1.8 * maxMovement;
  //       const moveY = (mouseY / rect.height - 0.5) * 1.8 * maxMovement;

  //       moveItems.forEach((item) => {
  //         gsap.to(item, {
  //           x: moveX,
  //           y: moveY,
  //           duration: 0.3,
  //           ease: "power2.out",
  //         });
  //       });
  //     });

  //     container.addEventListener("mouseleave", () => {
  //       gsap.to(moveItems, {
  //         x: 0,
  //         y: 0,
  //         duration: 0.5,
  //         ease: "power2.out",
  //       });
  //     });
  //   });
  // };

  // setupMouseMoveAnimation();

  const setupMouseMoveAnimation = () => {
    const containers = document.querySelectorAll(".move-box-wrap");

    if (containers.length === 0) {
      return;
    }

    containers.forEach((container) => {
      const moveItems = container.querySelectorAll(".move-item");
      if (moveItems.length === 0) {
        return;
      }

      gsap.set(moveItems, { x: 0, y: 0 });
      const maxMovement = 20;

      // Create unique movement patterns for each item
      const itemPatterns = Array.from(moveItems).map((item, index) => {
        const angle = (index * 45) % 360; // Different base angles: 0°, 45°, 90°, 135°, etc.
        const intensity = 0.5 + ((index * 0.3) % 1.5); // Different movement intensities
        const phase = (index * Math.PI) / 4; // Different phase offsets

        return {
          angle: (angle * Math.PI) / 180, // Convert to radians
          intensity: intensity,
          phase: phase,
          speedX: 0.8 + (index % 3) * 0.4, // Different X speeds: 0.8, 1.2, 1.6
          speedY: 0.6 + (index % 4) * 0.3, // Different Y speeds: 0.6, 0.9, 1.2, 1.5
          reverseX: index % 3 === 1 ? -1 : 1, // Some items move opposite in X
          reverseY: index % 5 === 2 ? -1 : 1, // Some items move opposite in Y
          delay: index * 0.02, // Staggered timing
        };
      });

      container.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalize mouse position to -1 to 1
        const normalizedX = (mouseX / rect.width - 0.5) * 2;
        const normalizedY = (mouseY / rect.height - 0.5) * 2;

        moveItems.forEach((item, index) => {
          const pattern = itemPatterns[index];

          // Create unique movement for each item based on its pattern
          const moveX = (normalizedX * pattern.intensity * pattern.speedX * pattern.reverseX + Math.sin(normalizedY + pattern.phase) * pattern.intensity * 0.3) * maxMovement;

          const moveY = (normalizedY * pattern.intensity * pattern.speedY * pattern.reverseY + Math.cos(normalizedX + pattern.phase) * pattern.intensity * 0.3) * maxMovement;

          gsap.to(item, {
            x: moveX,
            y: moveY,
            duration: 0.3 + pattern.delay,
            ease: "power2.out",
          });
        });
      });

      container.addEventListener("mouseleave", () => {
        moveItems.forEach((item, index) => {
          const pattern = itemPatterns[index];

          gsap.to(item, {
            x: 0,
            y: 0,
            duration: 0.5 + pattern.delay * 2,
            ease: "power2.out",
          });
        });
      });
    });
  };

  setupMouseMoveAnimation();

  //   // Image Reveal Animation
  // let tp_img_reveal = document.querySelectorAll(".img_reveal");

  // tp_img_reveal.forEach((img_reveal) => {
  //   let image = img_reveal.querySelector("img");
  //   let tl = gsap.timeline({
  //     scrollTrigger: {
  //       trigger: img_reveal,
  //       start: "top 70%",
  //     },
  //   });

  //   tl.set(img_reveal, { autoAlpha: 1 });
  //   tl.from(img_reveal, 1, {
  //     yPercent: -500,
  //     // ease: Power2.out,
  //   });
  //   tl.from(image, 1.5, {
  //     yPercent: 500,
  //     scale: 5,
  //     // delay: 5.5,
  //     duration:0.9,
  //     // ease: Power2.out,
  //   });
  // });

  // Image Reveal Animation with a more refined ease

  const tp_img_reveal = () => {
    let tp_img_reveal = document.querySelectorAll(".img_reveal");

    // Loop through each one to create a separate animation

    if (!tp_img_reveal) return;
    tp_img_reveal.forEach((img_reveal) => {
      let image = img_reveal.querySelector("img");
      // Select the new cover element within the current container
      let cover = img_reveal.querySelector(".reveal_cover");

      // Create a GSAP timeline for this specific element
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: img_reveal,
          start: "top 80%",
        },
      });

      tl.to(cover, {
        scale: 0.5,
        opacity: 0,
        duration: 1.8,
        delay: 0.1,
        ease: "power4.inOut",
      });

      tl.from(
        image,
        {
          scale: 1.2,
          duration: 1.8,
          delay: 0.7,
          ease: "power4.out",
        },
        "<"
      );
    });
  };
  tp_img_reveal();

  const serviceItemHoverEffect = () => {
    // Define class names here to make them dynamic
    const itemClass = "service-5__item";
    const imageClass = "service-5__thumb-item";
    const activeClass = "active";

    const serviceItems = document.querySelectorAll(`.${itemClass}`);
    const serviceImages = document.querySelectorAll(`.${imageClass}`);

    // Stop if no items or images found
    if (serviceItems.length === 0 || serviceImages.length === 0) return;

    // Make the first item active
    serviceItems[0].classList.add(activeClass);
    serviceImages[0].classList.add(activeClass);

    serviceItems.forEach((item, index) => {
      item.addEventListener("mouseover", () => {
        // Remove active class from all items and images
        serviceItems.forEach((el) => el.classList.remove(activeClass));
        serviceImages.forEach((el) => el.classList.remove(activeClass));

        // Add active to the hovered item and corresponding image
        item.classList.add(activeClass);
        if (serviceImages[index]) {
          serviceImages[index].classList.add(activeClass);
        }
      });
    });
  };

  serviceItemHoverEffect();

  const workSectionSixScrollEffect = () => {
    const tm = gsap.matchMedia();
    tm.add("(min-width: 991px)", () => {
      let tl_team = gsap.timeline();
      let panels = document.querySelectorAll(".work-6.section");
      panels.forEach((section, index) => {
        tl_team.to(section, {
          scrollTrigger: {
            trigger: ".work-6.section",
            pin: ".work-6__section-header",
            scrub: 1,
            start: "top -60px",
            end: "bottom 90%",
            endTrigger: ".work-6.section",
            pinSpacing: false,
            markers: false,
          },
        });
      });
    });
  };
  workSectionSixScrollEffect();

  window.addEventListener("resize", fillLinesWithSpans);
})(jQuery);
const items = document.querySelectorAll(".work-6__item");

items.forEach(item => {
                item.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = item.getBoundingClientRect();
                    const x = e.clientX - (left + width / 2);
                    const y = e.clientY - (top + height / 2);

                    // Reduced the rotation range for a more subtle effect
                    const rotateX = gsap.utils.mapRange(-height / 2, height / 2, -5, 5)(y);
                    const rotateY = gsap.utils.mapRange(-width / 2, width / 2, 5, -5)(x);

                    gsap.to(item, {
                        duration: 0.7,
                        rotationX: rotateX,
                        rotationY: rotateY,
                        ease: "power2.out"
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {
                        duration: 1,
                        rotationX: 0,
                        rotationY: 0,
                        ease: "elastic.out(1, 0.5)"
                    });
                });
            });