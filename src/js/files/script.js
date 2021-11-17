// tippy('.tippy', {
// 	content: "I'm a Tippy tooltip!",
// });

window.onload = function () {
  document.addEventListener('click', documentСlicks);
  let arrOfProducts = [];
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
    } else if (!target.closest('.search-form') && document.querySelector('.search-form._active')) { //to close it by outside click
      document.querySelector('.search-form').classList.remove('_active');
    }

    //add to cart button
    if (target.classList.contains('actions-product__button')) {
      event.preventDefault();
      const productId = target.closest('.item-product').dataset.pid;
      addToCartButton(target, productId);
    }
    // *closest is faster
    // cart-icon click
    if (target.classList.contains('cart-header__icon') || target.closest('cart-header__icon')) {
      event.preventDefault();
      if (document.querySelector('.cart-list').children.length) {
        document.querySelector('.cart-header').classList.toggle('_active');
      }
    } else if (!target.closest('.cart-header') && !target.classList.contains('actions-product__button')) {
      document.querySelector('.cart-header').classList.remove('_active');
    }
    //Cart-list buttons +-delete
    if (target.classList.contains('cart-list__delete')) {
      event.preventDefault();
      const cartProduct = target.closest('.cart-list__item');
      cartProduct.remove();
      updateCartList('delete');
    }

    if (target.classList.contains('cart-list__quantity_plus')) {
      event.preventDefault();
      const cartProduct = target.closest('.cart-list__item');
      const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
      cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
    }

    if (target.classList.contains('cart-list__quantity_minus')) {
      event.preventDefault();
      const cartProduct = target.closest('.cart-list__item');
      updateCartList('delete', cartProduct);
    }

    //Show More products button
    if (target.classList.contains('products__more')) {
      event.preventDefault();
      const productsItems = document.querySelector('.products__items');
      if (arrOfProducts.length) {
        let numOfColumns = getComputedStyle(productsItems).gridTemplateColumns.split(' ').length;
        for (let i = 0; i < numOfColumns; i++) {
          if (arrOfProducts.length) {
            productsItems.insertAdjacentHTML('beforeend', arrOfProducts.shift());
          } else {
            target.remove();
          }
        }
      } else {
        getProducts(target);
      }
    }
  };
  //Products
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
        // button.remove();
      } else {
        alert("Ошибка");
      }
    }
  }

  function loadProducts(data) {
    const productsItems = document.querySelector('.products__items');
    data.products.forEach((product, index) => {
      let productTemplateLabels = '';
      if (product.labels) {
        productTemplateLabels = '<div class="item-product__labels">';
        product.labels.forEach(labelItem => {
          productTemplateLabels += `<div class="item-product__label item-product__label_${labelItem.type}">${labelItem.value}</div>`;
        });

        productTemplateLabels += `</div>`;
      }

      let template = `
      <article class="products__item item-product" data-pid="${product.id}">
							${productTemplateLabels}
							<a class="item-product__image _ibg" href="${product.url}">
								<img src="img/products/${product.image}" alt="${product.title}">
							</a>
							<div class="item-product__body">
								<div class="item-product__content">
									<h3 class="item-product__title">${product.title}</h3>
									<div class="item-product__text">${product.text}</div>
								</div>
								<div class="item-product__prices">
									<div class="item-product__price">${product.price}</div>
									${product.priceOld ? `<div class="item-product__price item-product__price_old">${product.priceOld}</div>` : ''}
								</div>
								<div class="item-product__actions actions-product">
									<div class="actions-product__body">
										<a class="actions-product__button btn btn_white" href="#">Add to cart</a>
										<a class="actions-product__link _icon-share" href="${product.shareUrl}">Share</a>
										<a class="actions-product__link _icon-favorite" href="${product.likeUrl}">Like</a>
									</div>
								</div>
							</div>
						</article>`;
      let numOfColumns = getComputedStyle(productsItems).gridTemplateColumns.split(' ').length;
      if (index >= numOfColumns) {
        arrOfProducts.push(template);
      } else {
        productsItems.insertAdjacentHTML('beforeend', template);
      }
    });
    return arrOfProducts;
  }

  function addToCartButton(productButton, productId) {
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
          addToCartList(productButton, productId);
          productButton.classList.remove('_fly');
        }
      });
    }
  }

  function addToCartList(productButton, productId) {
    const cartProduct = document.querySelector(`[data-cart-pid="${productId}"]`);
    const cartList = document.querySelector('.cart-list');

    if (!cartProduct) {
      const product = document.querySelector(`[data-pid="${productId}"]`);
      const cartProductImage = product.querySelector('.item-product__image').innerHTML;
      const cartProductTitle = product.querySelector('.item-product__title').innerHTML;
      const cartProductContent = `
        <a class="cart-list__image _ibg" href ="">${cartProductImage}</a>
        <div class="cart-list__body">
          <a class="cart-list__title" href="#">${cartProductTitle}</a>
          <div class="cart-list__quantity">Quantity: <span>1</span></div>
          <div class="cart-list__actions">
            <button class="cart-list__quantity_plus type="button">+</button>
            <button class="cart-list__quantity_minus type="button">-</button>
            <a class="cart-list__delete" href="#">Delete</a>
          </div>
        </div>`;

      cartList.insertAdjacentHTML('beforeend', `<li class="cart-list__item" data-cart-pid="${productId}">${cartProductContent}</li>`);

      updateCartList('add');
    } else {
      const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
      cartProductQuantity.innerHTML = ++cartProductQuantity.innerHTML;
    }

    productButton.classList.remove('_hold');
  }

  function updateCartList(action, cartProduct = false) {
    const cart = document.querySelector('.cart-header');
    const cartList = document.querySelector('.cart-list');
    const cartIcon = document.querySelector('.cart-header__icon');
    const cartQuantity = document.querySelector('.cart-header__icon-quantity');

    if (action === 'add') {
      if (cartQuantity) {
        // cartQuantity.innerHTML = ++cartQuantity.innerHTML;
        cartQuantity.innerHTML = cartList.childElementCount;
      } else {
        cartIcon.insertAdjacentHTML('beforeend', `<span class="cart-header__icon-quantity">1</span>`);
      }
      return;
    } else if (action === 'delete') {
      if (cartProduct) {
        const cartProductQuantity = cartProduct.querySelector('.cart-list__quantity span');
        cartProductQuantity.innerHTML = --cartProductQuantity.innerHTML;

        if (cartProductQuantity.innerHTML == 0) {
          cartProduct.remove();
        }
      }
      const cartQuantityValue = cartList.childElementCount;
      // const cartQuantityValue = --cartQuantity.innerHTML;

      if (cartQuantityValue) {
        cartQuantity.innerHTML = cartQuantityValue;
      } else {
        cartQuantity.remove();
        cart.classList.remove('_active');
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

      if (distX) {
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