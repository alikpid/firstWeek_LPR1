let eventBus = new Vue()

Vue.component('product-details', {
    template: `
   <div class="product-details">
       <ul>
           <li v-for="detail in details">{{ detail }}</li>
       </ul>
   </div>
 `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        }
    },
})

Vue.component('product-next-details', {
    template: `
   <div class="product-next-details">
       <ul>
           <li v-for="detail in details">{{ detail }}</li>
       </ul>
   </div>
 `,
    data() {
        return {
            details: ['100% polyester', 'Male'],
        }
    },
})

Vue.component('product-review', {
    template: `
       <form class="review-form" @submit.prevent="onSubmit">
       
       <p v-if="errors.length">
         <b>Please correct the following error(s):</b>
         <ul>
            <li v-for="error in errors">{{ error }}</li>
         </ul>
       </p>

       <p>
         <label for="name">Name:</label>
         <input id="name" v-model="name" placeholder="name">
       </p>
    
       <p>
         <label for="review">Review:</label>
         <textarea id="review" v-model="review"></textarea>
       </p>
    
       <p>
         <label for="rating">Rating:</label>
         <select id="rating" v-model.number="rating">
           <option>5</option>
           <option>4</option>
           <option>3</option>
           <option>2</option>
           <option>1</option>
         </select>
       </p>
    
       <p>Would you recommend this product?</p>
       <div class="radioInput">
            <input type="radio" name="rec" id="yes" value="yes" v-model="recommend">
                <label for="yes">Yes!</label>
           <input type="radio" name="rec" id="no" value="no" v-model="recommend">
                <label for="no">Nope</label>
       </div>
    
       <p>
         <input type="submit" value="Submit"> 
       </p>
       </form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Choice about recommendation required.")
            }
        }
    }
})

Vue.component('product-review-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
     <div class="reviewTab">   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>«{{ review.review }}»</p>
           <p>Recommendation: {{ review.recommend }}</p>
           </li>
         </ul>
       </div>
       
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
     </div>
`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('product-info-tabs', {
    props: {
        shipping: {
            required: true
        },
        sizes: {
            type: Array,
            required: true
        }
    },
    template: `
      <div>
        <ul>
          <span class="tab" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-details></product-details>
        </div>
        <div v-show="selectedTab === 'Sizes'">
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
        </div>  
    
      </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details', 'Sizes'],
            selectedTab: 'Shipping'
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array
        },
    },
    template: `
   <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
            <h1>{{ title }} <span class="saleSpan" v-show="sale">¡Sale!</span></h1>
            <p>{{description}}</p>

            <p v-if="!inStock"
               v-bind:class="{ notActive: !inStock }"
               :style="{ textDecorationLine: 'line-through'}"
            >Out of stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else>In stock</p>

            <product-info-tabs :shipping="shipping" :sizes="sizes"></product-info-tabs>
            
            <div class="colors">
                <div class="color-box"
                     v-for="(variant, index) in variants"
                     :key="variant.variantId"
                     :style="{ backgroundColor:variant.variantColor }"
                     @mouseover="updateProduct(index)"
                >
                </div>
            </div>
            
            <p>
            <a :href="link">More products like this</a>
            </p>
            
            <button v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button class="removeFromCart" v-show="cart.length" v-on:click="removeFromCart">Remove</button>
            
            
        </div>
            <div>
                <product-review-tabs :reviews="reviews"></product-review-tabs> 
            </div>       
   </div>
`,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 100,
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 100,
                    onSale: true
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 1,
                    onSale:  false
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
            this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart',
            this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale;
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    }
})

Vue.component('product-next-info-tabs', {
    props: {
        shipping: {
            required: true
        },
        sizes: {
            type: Array,
            required: true
        }
    },
    template: `
      <div>
        <ul>
          <span class="tab" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-next-details></product-next-details>
        </div>
        <div v-show="selectedTab === 'Sizes'">
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
        </div>  
    
      </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details', 'Sizes'],
            selectedTab: 'Shipping'
        }
    }
})

Vue.component('product-next', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array
        },
    },
    template: `
    <div class="product-next">
        <div class="product-image-next">
            <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
            <h1>{{ title }} <span class="saleSpan" v-show="sale">¡Sale!</span></h1>
            <p>{{description}}</p>

            <p v-if="!inStock"
               v-bind:class="{ notActive: !inStock }"
               :style="{ textDecorationLine: 'line-through'}"
            >Out of stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else>In stock</p>

            <product-next-info-tabs :shipping="shipping" :sizes="sizes"></product-next-info-tabs>
            
            <div class="colors">
                <div class="color-box-next"
                     v-for="(variant, index) in variants"
                     :key="variant.variantId"
                     :style="{ backgroundColor:variant.variantColor }"
                     @mouseover="updateProduct(index)"
                >
                </div>
            </div>
            
            <p>
            <a :href="link">More products like this</a>
            </p>
            
            <button v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }"
            >
                Add to cart
            </button>
            <button class="removeFromCart" v-show="this.cart.length" v-on:click="removeFromCart">Remove</button>
            
            
        </div>
            <div>
                <product-review-tabs :reviews="reviews"></product-review-tabs> 
            </div>       
   </div>
   `,
    data() {
        return {
            product: "Pants",
            brand: 'Rubchinsky',
            description: "Cool pants",
            selectedVariant: 0,
            altText: "A pair of pants",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=pants",
            inventory: 100,
            variants: [
                {
                    variantId: 2236,
                    variantColor: 'black',
                    variantImage: "./assets/vmPants-black-onWhite.jpg",
                    variantQuantity: 100,
                    onSale: true
                },
                {
                    variantId: 2237,
                    variantColor: 'white',
                    variantImage: "./assets/vmPants-white-onWhite.jpg",
                    variantQuantity: 1,
                    onSale:  false
                }
            ],
            sizes: ['L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        removeFromCart() {
            this.$emit('remove-from-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity;
        },
        sale() {
            return this.variants[this.selectedVariant].onSale;
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        addToCart(id) {
            this.cart.push(id);
        },
        removeFromCart(id) {
            for(let i = this.cart.length - 1; i >= 0; --i){
                if (this.cart[i] === id){
                    this.cart.splice(i, 1);
                }

            }

        }
    }

})

