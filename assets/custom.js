(function () {
  function updateVariant(card, button) {
    const variantButtons = card.querySelectorAll("[data-variant-id]");
    const quickAddButton = card.querySelector("[data-quick-add]");
    const selectedVariantTitle = card.querySelector(
      "[data-selected-variant-title]"
    );
    const priceElement = card.querySelector("[data-product-price]");

    const variantId = button.dataset.variantId;
    const variantTitle = button.dataset.variantTitle;
    const variantPrice = button.dataset.variantPrice;

    variantButtons.forEach(function (item) {
      item.classList.remove("is-selected");
    });

    button.classList.add("is-selected");

    if (quickAddButton) {
      quickAddButton.dataset.variantId = variantId;
      quickAddButton.disabled = false;
      quickAddButton.querySelector("span:last-child").textContent =
        "Quick Add";
    }

    if (selectedVariantTitle) {
      selectedVariantTitle.textContent = variantTitle;
    }

    if (priceElement && variantPrice) {
      const priceInCents = Number(variantPrice);

      priceElement.textContent = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "USD"
      }).format(priceInCents / 100);
    }
  }


  async function quickAdd(card, button) {
    const variantId = button.dataset.variantId;

    if (!variantId) {
      console.error("No variant selected.");
      return;
    }

    const originalHTML = button.innerHTML;

    button.disabled = true;
    button.innerHTML = "<span>Adding...</span>";

    try {
      const response = await fetch(
        window.Shopify.routes.root + "cart/add.js",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            items: [
              {
                id: Number(variantId),
                quantity: 1
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(function () {
          return {};
        });

        throw new Error(
          errorData.description || "Unable to add product to cart."
        );
      }

      const data = await response.json();

      console.log("Product added:", data);

      button.innerHTML = "<span>✓ Added</span>";

      setTimeout(function () {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 1500);

    } catch (error) {
      console.error("Quick Add error:", error);

      button.innerHTML = "<span>Try Again</span>";

      setTimeout(function () {
        button.innerHTML = originalHTML;
        button.disabled = false;
      }, 1500);
    }
  }


  function toggleWishlist(button) {
    button.classList.toggle("is-wishlisted");

    const isWishlisted =
      button.classList.contains("is-wishlisted");

    button.setAttribute(
      "aria-pressed",
      isWishlisted ? "true" : "false"
    );
  }


  document.addEventListener("click", function (event) {

    /* Variant button */

    const variantButton =
      event.target.closest("[data-variant-id]");

    if (
      variantButton &&
      !variantButton.hasAttribute("data-quick-add")
    ) {
      const card =
        variantButton.closest("[data-product-card]");

      if (card && !variantButton.disabled) {
        updateVariant(card, variantButton);
      }

      return;
    }


    /* Quick Add */

    const quickAddButton =
      event.target.closest("[data-quick-add]");

    if (quickAddButton) {
      const card =
        quickAddButton.closest("[data-product-card]");

      if (card) {
        quickAdd(card, quickAddButton);
      }

      return;
    }


    /* Wishlist */

    const wishlistButton =
      event.target.closest("[data-wishlist]");

    if (wishlistButton) {
      toggleWishlist(wishlistButton);
    }

  });

})();