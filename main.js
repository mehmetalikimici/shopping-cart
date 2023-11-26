//!VARIABLES

//console.log("connection check")
const cartBtn = document.querySelector(".cart-btn");
//console.log(cartBtn);
const clearCartBtn = document.querySelector(".btn-clear");
//console.log(clearCartBtn);
const cartItems = document.querySelector(".cart-items");
//console.log(cartItems)
const cartTotal = document.querySelector(".total-value");
//console.log(cartTotal)
const cartContent = document.querySelector(".cart-list");
//console.log(cartContent)
const productsDOM = document.querySelector("#products-dom");
//console.log(productsDOM);
let cart = [];
let buttonsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch(
        "https://655cb91325b76d9884fdd808.mockapi.io/products"
      );
      let data = await result.json();
      //console.log(data);
      let products = data;
      //console.log(products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  displayProducts(products) {
    //console.log(products);
    let result = "";
    products.forEach((item) => {
      result += `
            <div class="col-lg-4 col-md-6">
            <div class="product">
              <div class="product-image">
                <img src="${item.image}" class="img-fluid" />
              </div>
              <div class="product-hover">
                <span class="product-title">${item.title}</span>
                <span class="product-price">${item.price}€</span>
                <button class="btn-add-to-cart" data-id=${item.id}>
                  <i class="fas fa-cart-shopping"></i>
                </button>
              </div>
            </div>
          </div>
            `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".btn-add-to-cart")];
    //console.log(buttons);
    buttonsDOM = buttons;
    //console.log(buttonsDOM);
    buttons.forEach((button) => {
      let id = button.dataset.id;
      //console.log(id);
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.setAttribute("disabled", "disabled");
        button.style.opacity = ".3";
      } else {
        button.addEventListener("click", (event) => {
          event.target.disabled = true;
          event.target.style.opacity = ".3";
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          //console.log(cartItem);

          // add product to the cart
          cart = [...cart, cartItem];
          //console.log(cart);

          //save cart in local storage
          Storage.saveCart(cart);

          //save cart values
          this.setCartValues(cart);

          //display cart item

          this.addCartItem(cartItem);

          //show the cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });

    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const li = document.createElement("li");
    li.classList.add("cart-list-item");
    li.innerHTML = `
            <div class="cart-left">
                <div class="cart-left-image">
                  <img src="${item.image}" alt="product" class="img-fluid"/>
                </div>
                <div class="cart-left-info">
                  <a class="cart-left-info-title" href="#">${item.title}</a>
                  <span class="cart-left-info-price">€ ${item.price}</span>
                </div>
              </div>
              <div class="cart-right">
                <div class="cart-right-quantity">
                  <button class="quantity-minus" data-id=${item.id}>
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="quantity">${item.amount}</span>
                  <button class="quantity-plus" data-id=${item.id}>
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="cart-right-remove">
                  <button class="cart-remove-btn" data-id=${item.id}>
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
            </div>
    `;
    cartContent.appendChild(li);
  }

  showCart() {
    cartBtn.click();
  }

  setupAPP() {
    cart = Storage.getCart();
    //console.log(cart);
    this.setCartValues(cart);
    this.populateCart(cart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", (event) => {
      //console.log(event.target);
      if (event.target.classList.contains("cart-remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        removeItem.parentElement.parentElement.parentElement.remove();
        this.removeItem(id);
      } else if (event.target.classList.contains("quantity-minus")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.nextElementSibling.innerText = tempItem.amount;
        } else {
          lowerAmount.parentElement.parentElement.parentElement.remove();
          this.removeItem(id);
        }
      } else if (event.target.classList.contains("quantity-plus")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.previousElementSibling.innerText = tempItem.amount;
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.style.opacity = "1";
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

//Sayfa yüklendiğinde gerçekleşecek olaylar
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupAPP();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
