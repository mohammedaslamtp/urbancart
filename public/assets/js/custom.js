$(document).ready(function () {
  "use strict";

  /*==================================
* Author        : "ThemeSine"
* Template Name : Furniture E- commarce HTML Template
* Version       : 1.0
==================================== */

  /*=========== TABLE OF CONTENTS ===========
1. Scroll To Top 
2. owl carousel
3. welcome animation support
4. cart close
======================================*/

  // 1. Scroll To Top
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 600) {
      $(".return-to-top").fadeIn();
    } else {
      $(".return-to-top").fadeOut();
    }
  });
  $(".return-to-top").on("click", function () {
    $("html, body").animate(
      {
        scrollTop: 0
      },
      1500
    );
    return false;
  });

  // 2. owl carousel

  // i. client (carousel)

  $("#client").owlCarousel({
    items: 5,
    loop: true,
    smartSpeed: 1000,
    autoplay: true,
    dots: false,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 2
      },
      415: {
        items: 3
      },
      600: {
        items: 3
      },
      1200: {
        items: 5
      }
    }
  });

  $(".play").on("click", function () {
    owl.trigger("play.owl.autoplay", [1000]);
  });
  $(".stop").on("click", function () {
    owl.trigger("stop.owl.autoplay");
  });

  // ii.  testimonial-carousel

  $("#collection-carousel").owlCarousel({
    items: 1,
    autoplay: true,
    loop: true,
    dots: false,
    mouseDrag: true,
    nav: false,
    smartSpeed: 1000,
    transitionStyle: "fade",
    animateIn: "fadeIn",
    animateOut: "fadeOutLeft"
    // navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"]
  });

  // 3. welcome animation support

  $(window).load(function () {
    $(".welcome-hero-txt h4,.welcome-hero-txt h2,.welcome-hero-txt p")
      .removeClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-txt button").removeClass("animated fadeInDown").css({ opacity: "0" });
  });

  $(window).load(function () {
    $(".welcome-hero-txt h4,.welcome-hero-txt h2,.welcome-hero-txt p")
      .addClass("animated fadeInUp")
      .css({ opacity: "0" });
    $(".welcome-hero-txt button").addClass("animated fadeInDown").css({ opacity: "0" });
  });

  // 4. cart-close
  $(".cart-close").click(function () {
    $(this).parents(".single-cart-list").fadeOut();
  });
});

function popUp() {
  console.log("entered to popUp function");
  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Item added to cart",
    showConfirmButton: false,
    timer: 1500
  });
}

/* increasing cart count and add item to cart */
function cartCount(id) {
  console.log("cartCount is working...id: " + id);
  fetch("/addToCart/" + id, {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify()
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      $("#cart-count").html(data.cartlength);
      console.log("count  : " + data.cartlength);
      popUp();
    });
}

function changeQuantity(productId, count) {
  if (parseInt($("#" + productId).val()) < 2 && count == -1) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger"
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Do you want to remove the procuct!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        reverseButtons: true
      })
      .then((result) => {
        if (result.isConfirmed) {
          changeQuantityMain(productId, count);
        }
      });
  } else {
    changeQuantityMain(productId, count);
  }
}

function changeQuantityMain(productId, count) {
  fetch("/changeQuantity", {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ productId: productId, count: count })
  })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      $("#" + productId).val(data.qty);
      $("#total-price").html(data.totalPrice);
      $("#items").html(data.length + " Items");
      if (data.remove) {
        $("#mainDiv" + productId).remove();
        $("#cart-count").html(data.length);
        if (data.length == 0) {
          window.location.reload();
        }
      }
    });
}

// to delete a user address
function deleteAddress(addressId) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Delete"
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/deleteAddress",
        method: "post",
        dataType: "json",
        encode: true,
        data: { addressId: addressId }
      }).done((data) => {
        console.log(data);
      });
      Swal.fire("Changed", "Your file has been updated.", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

// to edit user address
function editAddress(addressId) {
  Swal.fire({
    title: "Do you want to save the changes?",
    showCancelButton: true,
    confirmButtonText: "Save"
  }).then((result) => {
    if (result.isConfirmed) {
      const editAddress = document.getElementById("editedForm" + addressId);
      var formData = new FormData(editAddress);
      let data = Object.fromEntries(formData);
      $.ajax({
        url: "/editAddress",
        method: "post",
        dataType: "json",
        encode: true,
        data: { data: data, addressId: addressId }
      }).done((data) => {
        console.log(data);
      });
      Swal.fire("Changed", "Your file has been updated.", "success");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });
}

// to collect coupon code and calculate:
