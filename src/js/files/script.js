// tippy('.tippy', {
// 	content: "I'm a Tippy tooltip!",
// });

window.onload = function () {
  document.addEventListener('click', documentСlicks);

  // Actions 
  function documentСlicks(event) {
    const target = event.target;
    const hovered = document.querySelectorAll('.menu__item._hover');
    //drop-down menu hover
    if (isMobile.any()) {
      if (target.classList.contains('menu__arrow')) {
        target.closest('.menu__item').classList.toggle('_hover');
      } else if (!target.closest('.menu__item') && hovered.length) {
        _removeClasses(hovered, "_hover");
      }
    } else {
      if (hovered.length) {
        _removeClasses(hovered, "_hover");
      }
    }
    //search-form click
    if (target.classList.contains('search-form__icon')) {
      document.querySelector('.search-form').classList.toggle('_active');
    } else if (!target.closest('.search-form') && document.querySelector('.search-form._active')) {
      document.querySelector('.search-form').classList.remove('_active');
    }

    //Show More products button
    if (target.classList.contains('products__more')) {
      getProducts(target);
      event.preventDefault();
    }

    //add to cart button
    if (target.classList.contains('actions-product__button')) {
      const productId = target.closest('.item-product').dataset.pid;
      addToCart(target, productId);
      event.preventDefault();
    }
    // *closest is faster
    // cart-icon click
    if (target.classList.contains('cart-header__icon') || target.closest('cart-header__icon')) {
      if (document.querySelector('.cart-list').children.length) {
        document.querySelector('.cart-header').classList.toggle('_active');
      }
      event.preventDefault();
    } else if (!target.closest('.cart-header') && !target.classList.contains('actions-product__button')) {
      document.querySelector('.cart-header').classList.remove('_active');
    }

    if (target.classList.contains('cart-list__delete')) {
      const productId = target.closest('.cart-list__item').dataset.cartPid;
      updateCart(target, productId, false);
      event.preventDefault();
    }
    //Header 
    const headerElement = document.querySelector('.header');

    const callback = function (entries, observer) {
      if (entries[0].isIntersecting) {
        headerElement.classList.remove('_scroll');
      } else {
        headerElement.classList.add('_scroll');
      }
    };

    const headerObserver = new IntersectionObserver(callback);
    headerObserver.observe(headerElement);


    async function getProducts(button) {
      if (!button.classList.contains('_hold')) {
        button.classList.add('_hold');

        const file = "json/products.json";
        let response = await fetch(file, {
          method: "GET"
        });

        if (response.ok) {
          let result = await response.json();

          loadProducts(result);
          button.classList.remove('_hold');
          button.remove();
        } else {
          alert("Ошибка");
        }
      }
    }

    function loadProducts(data) {
      const productsItems = document.querySelector('.products__items');

      data.products.forEach(item => {
        const productId = item.id;
        const productLabels = item.labels;
        const productUrl = item.url;
        const productImage = item.image;
        const productTitle = item.title;
        const productText = item.text;
        const productPrice = item.price;
        const productOldPrice = item.priceOld;
        const productShareUrl = item.shareUrl;
        const productLikeUrl = item.likeUrl;


        let productTemplateLabels = '';
        if (productLabels) {
          productTemplateLabels = '<div class="item-product__labels">';
          productLabels.forEach(labelItem => {
            productTemplateLabels += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
          });

          productTemplateLabels += `</div>`;
        }

        let template = `
      <article class="products__item item-product" data-pid="${productId}">
							${productTemplateLabels}
							<a class="item-product__image _ibg" href="${productUrl}">
								<img src="img/products/${productImage}" alt="${productTitle}">
							</a>
							<div class="item-product__body">
								<div class="item-product__content">
									<h3 class="item-product__title">${productTitle}</h3>
									<div class="item-product__text">${productText}</div>
								</div>
								<div class="item-product__prices">
									<div class="item-product__price">${productPrice}</div>
									${productOldPrice ? `<div class="item-product__price item-product__price_old">${productOldPrice}</div>` : ''}
								</div>
								<div class="item-product__actions actions-product">
									<div class="actions-product__body">
										<a class="actions-product__button btn btn_white" href="">Add to cart</a>
										<a class="actions-product__link _icon-share" href="${productShareUrl}">Share</a>
										<a class="actions-product__link _icon-favorite" href="${productLikeUrl}">Like</a>
									</div>
								</div>
							</div>
						</article>`;

        productsItems.insertAdjacentHTML('beforeend', template);
      });
    }

    function addToCart(productButton, productId) {
      if (!productButton.classList.contains('_hold')) {
        productButton.classList.add('_hold');
        productButton.classList.add('_fly');

        const cartIcon = document.querySelector('.cart-header__icon');
        const product = document.querySelector(`[data-pid="${productId}"]`);
        const productImage = product.querySelector('.item-product__image');

        const productImageFly = productImage.cloneNode(true);
        const productImageFlyWidth = productImage.offsetWidth;
        const productImageFlyHeight = productImage.offsetHeight;
        const productImageFlyTop = productImage.getBoundingClientRect().top;
        const productImageFlyLeft = productImage.getBoundingClientRect().left;

        productImageFly.setAttribute('class', '_flyImage _ibg');
        productImageFly.style.cssText = `
      width: ${productImageFlyWidth}px;
      height: ${productImageFlyHeight}px;
      top: ${productImageFlyTop}px;
      left: ${productImageFlyLeft}px;
      `;

        document.body.append(productImageFly);

        const cartFlyLeft = cartIcon.getBoundingClientRect().left;
        const cartFlyTop = cartIcon.getBoundingClientRect().top;

        productImageFly.style.cssText = `
      left: ${cartFlyLeft}px;
      top: ${cartFlyTop}px;
      width: 0;
      height: 0;
      opacity: 0;
      `;

        productImageFly.addEventListener('transitionend', function () {
          if (productButton.classList.contains('_fly')) {
            productImageFly.remove();
            updateCart(productButton, productId);
            productButton.classList.remove('_fly');
          }
        });
      }
    }

    function updateCart(productButton, productId, productAdd = true) {
      const cart = document.querySelector('.cart-header');
      const cartIcon = cart.querySelector('.cart-header__icon');
      const cartQuantity = cartIcon.querySelector('.cart-header__quantity');
      const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
      const cartList = document.querySelector('.cart-list');

      if (productAdd) {
        if (cartQuantity) {
          cartQuantity.innerHTML = ++cartQuantity.innerHTML;
        } else {
          cartIcon.insertAdjacentHTML('beforeend', `<span class="cart-header__icon-quantity">1</span>`);
        }

        if (!cartProduct) {
          const product = document.querySelector(`[data-pid="${productId}"]`);
          const cartProductImage = product.querySelector('.item-product__image').innerHTML;
          const cartProductTitle = product.querySelector('.item-product__title').innerHTML;
          const cartProductContent = `
        <a class="cart-list__image _ibg" href ="">${cartProductImage}</a>
        <div class="cart-list__body">
          <a class="cart-list__title" href="">${cartProductTitle}</a>
          <div class="cart-list__quantity">Quantity: <span>1</span></div>
          <a class="cart-list__delete" href="">Delete</a>
        </div>`;
          cartList.insertAdjacentHTML('beforeend', `<li class="cart-list__item" data-cart-pid="${productId}">${cartProductContent}</li>`);
        } else {
          const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
          cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
        }

        productButton.classList.remove('_hold');
      } else { // DELETE, TODO + - 
        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
        cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;
        if (!parseInt(cartProductQuantity.innerHTML)) {
          cartProduct.remove();
        }

        const cartQuantityValue = --cartQuantity.innerHTML;

        if (cartQuantityValue) {
          cartQuantity.innerHTML = cartQuantityValue;
        } else {
          cartQuantity.remove();
          cart.classList.remove('_active');
        }
      }
    }
  }


  //Furniture Gallery
  const furniture = document.querySelector('.furniture__body');

  if (furniture && !isMobile.any()) {
    const furnitureItems = document.querySelector('.furniture__items');
    const furnitureColumns = document.querySelectorAll('.furniture__column');

    const speed = furniture.dataset.speed;

    let positionX = 0;
    let coordXprocent = 0;

    function setMouseGalleryStyle() {
      let furnitureItemsWidth = 0;

      furnitureColumns.forEach(element => {
        furnitureItemsWidth += element.offsetWidth;
      });

      const furnitureDifferent = furnitureItemsWidth - furniture.offsetWidth;
      const distX = Math.floor(coordXprocent - positionX);

      positionX += distX * speed;
      let position = furnitureDifferent / 200 * positionX;

      furnitureItems.style.cssText = `transform: translate3d(${-position}px, 0,0);`;

      if (Math.abs(distX)) {
        requestAnimationFrame(setMouseGalleryStyle);
      } else {
        furniture.classList.remove('_init');
      }
    }
    furniture.addEventListener('mousemove', function (e) {
      const furnitureWidth = furniture.offsetWidth;
      const coordX = e.pageX - furnitureWidth / 2;

      coordXprocent = coordX / furnitureWidth * 200;

      if (!furniture.classList.contains('_init')) {
        requestAnimationFrame(setMouseGalleryStyle);
        furniture.classList.add('_init');
      }
    });
  }
};