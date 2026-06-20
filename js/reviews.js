/**
 * Customer reviews — static data source (Google API ready via googleReviewsConfig).
 */
(function () {
  "use strict";

  var googleReviewsConfig = {
    mapsUrl: "https://maps.app.goo.gl/k3sm2wsz9d8FAQu99",
    icon: "images/google-icon.png",
    placeId: "",
    apiKey: ""
  };

  var reviewsData = [
    {
      name: "Noyes S.",
      rating: 5,
      text:
        "Bo and his employees expertly installed a new patio door, kitchen lighting, recessed lighting in our family room, and moved light switches and outlets in preparation for our new kitchen install. The work was excellent!",
      date: "2024-08-14",
      project: "Kitchen & Electrical"
    },
    {
      name: "Erica M.",
      rating: 5,
      text:
        "4C Construction just painted my kitchen cabinets a beautiful white and installed hardware. They were professional, punctual, courteous of my home, and did an excellent job! My kitchen is transformed.",
      date: "2024-05-22",
      project: "Kitchen Remodel"
    },
    {
      name: "Kendall A.",
      rating: 5,
      text:
        "The 4C Construction team exceeded my expectations! They finished my basement in less than a month with zero hiccups! I highly recommend them for your contracting needs!",
      date: "2024-03-09",
      project: "Basement Finishing"
    }
  ];

  var reviewsDataAll = reviewsData.concat([
    {
      name: "Sue W.",
      rating: 5,
      text:
        "I would recommend them to anyone! They were very professional and friendly! We love our deck!!!",
      date: "2024-02-18",
      project: "Deck Build"
    },
    {
      name: "Omaha Homeowner",
      rating: 5,
      text:
        "Professional from start to finish. Clear communication, quality work, and a clean job site. We couldn't be happier with our home renovation.",
      date: "2024-01-06",
      project: "Whole Home Remodel"
    }
  ]);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function starsHtml(rating) {
    var count = Math.max(0, Math.min(5, rating | 0));
    var stars = "";
    for (var i = 0; i < count; i++) stars += "&#9733;";
    return stars;
  }

  function googleIconHtml(className) {
    return (
      '<img src="' +
      googleReviewsConfig.icon +
      '" alt="" class="' +
      className +
      '" width="20" height="20" aria-hidden="true">'
    );
  }

  function googleBtnIconHtml() {
    return (
      '<img src="' +
      googleReviewsConfig.icon +
      '" alt="" class="btn__icon btn__icon--google" width="18" height="18" aria-hidden="true">'
    );
  }

  function renderReviews(container, reviews, opts) {
    if (!container || !reviews || !reviews.length) return;
    opts = opts || {};
    var cardClass = "review-card" + (opts.light ? " review-card--light" : "");

    container.innerHTML = reviews
      .map(function (review) {
        return (
          '<blockquote class="' +
          cardClass +
          '">' +
          '<div class="review-card__head">' +
          googleIconHtml("review-card__google") +
          '<div class="review-card__stars">' +
          starsHtml(review.rating) +
          "</div></div>" +
          '<p>"' +
          escapeHtml(review.text) +
          '"</p>' +
          "<footer>\u2014 " +
          escapeHtml(review.name) +
          " <span>" +
          escapeHtml(review.project) +
          "</span></footer>" +
          "</blockquote>"
        );
      })
      .join("");
  }

  function initReviewsSection() {
    var section = document.getElementById("reviews");
    if (section) {
      var grid = section.querySelector(".reviews-grid");
      renderReviews(grid, reviewsData);

      section.querySelectorAll("[data-reviews-google-cta]").forEach(function (btn) {
        btn.href = googleReviewsConfig.mapsUrl;
        if (btn.getAttribute("data-reviews-google-cta") === "leave") {
          btn.innerHTML = googleBtnIconHtml() + " Leave Us a Review";
        } else {
          btn.innerHTML = googleBtnIconHtml() + " Read More Reviews on Google";
        }
      });
    }

    var pageGrid = document.querySelector(".reviews-grid--light");
    if (pageGrid) {
      renderReviews(pageGrid, reviewsDataAll, { light: true });

      pageGrid.closest(".container").querySelectorAll("[data-reviews-google-cta]").forEach(function (btn) {
        btn.href = googleReviewsConfig.mapsUrl;
        btn.innerHTML = googleBtnIconHtml() + " Leave Us a Review on Google";
      });
    }
  }

  window.googleReviewsConfig = googleReviewsConfig;
  window.reviewsData = reviewsData;
  window.reviewsDataAll = reviewsDataAll;
  window.renderReviews = renderReviews;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewsSection);
  } else {
    initReviewsSection();
  }
})();
