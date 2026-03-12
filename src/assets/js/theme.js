/**
 * LuluOro Theme - Main JavaScript
 * Elegent Jewelry E-commerce Theme for Salla Platform
 */

(function() {
    'use strict';

    var LuluOroTheme = {
        init: function() {
            this.initHeader();
            this.initMobileMenu();
            this.initSearch();
            this.initProductGallery();
            this.initQuantity();
            this.initProductOptions();
            this.initProductActions();
            this.initCart();
            this.initModals();
            this.initSmoothScroll();
            this.initLazyLoad();
        },

        initHeader: function() {
            var header = document.getElementById('header');
            var lastScroll = 0;

            if (!header) return;

            window.addEventListener('scroll', function() {
                var currentScroll = window.pageYOffset;

                if (currentScroll > 100) {
                    header.classList.add('header--scrolled');
                } else {
                    header.classList.remove('header--scrolled');
                }

                lastScroll = currentScroll;
            });

            var dropdowns = document.querySelectorAll('.nav-menu__item.has-dropdown, .nav-menu__item');
            dropdowns.forEach(function(dropdown) {
                dropdown.addEventListener('mouseenter', function() {
                    this.classList.add('is-active');
                });
                dropdown.addEventListener('mouseleave', function() {
                    this.classList.remove('is-active');
                });
            });
        },

        initMobileMenu: function() {
            var menuToggle = document.getElementById('menu-toggle');
            var mobileMenu = document.getElementById('mobile-menu');
            var closeBtn = document.getElementById('mobile-menu-close');
            var overlay = document.getElementById('page-overlay');

            if (!menuToggle || !mobileMenu) return;

            menuToggle.addEventListener('click', function() {
                mobileMenu.classList.add('active');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', closeMobileMenu);
            }

            if (overlay) {
                overlay.addEventListener('click', closeMobileMenu);
            }

            var subMenuToggles = document.querySelectorAll('.mobile-nav__link');
            subMenuToggles.forEach(function(toggle) {
                toggle.addEventListener('click', function(e) {
                    var parent = this.closest('.mobile-nav__item');
                    if (parent && parent.querySelector('.mobile-nav__sublist')) {
                        e.preventDefault();
                        parent.classList.toggle('open');
                    }
                });
            });

            function closeMobileMenu() {
                mobileMenu.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        initSearch: function() {
            var searchToggle = document.getElementById('search-toggle');
            var searchModal = document.getElementById('modal-search');

            if (!searchToggle || !searchModal) return;

            searchToggle.addEventListener('click', function() {
                searchModal.classList.add('active');
                var input = searchModal.querySelector('input');
                if (input) input.focus();
            });

            var closeButtons = searchModal.querySelectorAll('[data-modal-close]');
            closeButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    searchModal.classList.remove('active');
                });
            });
        },

        initProductGallery: function() {
            var mainImage = document.getElementById('product-main-image');
            var thumbnails = document.querySelectorAll('.product-gallery__thumbnail');

            if (!mainImage || thumbnails.length === 0) return;

            thumbnails.forEach(function(thumb) {
                thumb.addEventListener('click', function() {
                    var newSrc = this.getAttribute('data-image');
                    
                    thumbnails.forEach(function(t) {
                        t.classList.remove('active');
                    });
                    
                    this.classList.add('active');
                    mainImage.src = newSrc;
                });
            });
        },

        initQuantity: function() {
            document.addEventListener('click', function(e) {
                var btn = e.target.closest('.quantity-selector__btn');
                if (!btn) return;

                var container = btn.closest('.quantity-selector');
                var input = container.querySelector('.quantity-selector__input');
                var action = btn.getAttribute('data-action');
                var currentValue = parseInt(input.value) || 1;
                var max = parseInt(input.getAttribute('max')) || 99;
                var min = parseInt(input.getAttribute('min')) || 1;

                if (action === 'increase') {
                    if (currentValue < max) {
                        input.value = currentValue + 1;
                    }
                } else if (action === 'decrease') {
                    if (currentValue > min) {
                        input.value = currentValue - 1;
                    }
                }

                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        },

        initProductOptions: function() {
            var optionButtons = document.querySelectorAll('.product-options__variant');

            optionButtons.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var parent = this.closest('.product-options__variants');
                    if (parent) {
                        parent.querySelectorAll('.product-options__variant').forEach(function(b) {
                            b.classList.remove('active');
                        });
                    }
                    this.classList.add('active');

                    var productId = this.closest('[data-add-to-cart]');
                    if (productId) {
                        productId.dispatchEvent(new Event('optionChange', { bubbles: true }));
                    }
                });
            });
        },

        initProductActions: function() {
            var self = this;

            document.addEventListener('click', function(e) {
                var addToCartBtn = e.target.closest('[data-add-to-cart]');
                if (addToCartBtn) {
                    e.preventDefault();
                    var productId = addToCartBtn.getAttribute('data-add-to-cart');
                    var quantityInput = document.querySelector('.quantity-selector__input');
                    var quantity = quantityInput ? parseInt(quantityInput.value) : 1;
                    self.addToCart(productId, quantity);
                }

                var wishlistBtn = e.target.closest('[data-wishlist]');
                if (wishlistBtn) {
                    e.preventDefault();
                    var productId = wishlistBtn.getAttribute('data-wishlist');
                    self.toggleWishlist(productId, wishlistBtn);
                }

                var quickViewBtn = e.target.closest('[data-quick-view]');
                if (quickViewBtn) {
                    e.preventDefault();
                    var productId = quickViewBtn.getAttribute('data-quick-view');
                    self.openQuickView(productId);
                }

                var copyLinkBtn = e.target.closest('[data-copy-link]');
                if (copyLinkBtn) {
                    e.preventDefault();
                    var url = copyLinkBtn.getAttribute('data-copy-link');
                    self.copyToClipboard(url, copyLinkBtn);
                }
            });
        },

        addToCart: function(productId, quantity) {
            if (typeof salla !== 'undefined' && salla.cart) {
                salla.cart.addItem({
                    id: productId,
                    quantity: quantity
                }).then(function(response) {
                    LuluOroTheme.showNotification('Product added to cart', 'success');
                    LuluOroTheme.updateCartCount(response.count);
                }).catch(function(error) {
                    LuluOroTheme.showNotification('Failed to add product to cart', 'error');
                });
            } else {
                console.log('Add to cart:', productId, quantity);
                this.showNotification('Product added to cart', 'success');
            }
        },

        toggleWishlist: function(productId, button) {
            var isActive = button.classList.contains('active');

            if (typeof salla !== 'undefined' && salla.wishlist) {
                if (isActive) {
                    salla.wishlist.remove(productId).then(function() {
                        button.classList.remove('active');
                        LuluOroTheme.showNotification('Removed from wishlist', 'info');
                    });
                } else {
                    salla.wishlist.add(productId).then(function() {
                        button.classList.add('active');
                        LuluOroTheme.showNotification('Added to wishlist', 'success');
                    });
                }
            } else {
                button.classList.toggle('active');
                this.showNotification(isActive ? 'Removed from wishlist' : 'Added to wishlist', 'success');
            }
        },

        openQuickView: function(productId) {
            console.log('Quick view:', productId);
        },

        copyToClipboard: function(text, button) {
            var self = this;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    self.showNotification('Link copied to clipboard', 'success');
                }).catch(function() {
                    self.fallbackCopy(text);
                });
            } else {
                this.fallbackCopy(text);
            }
        },

        fallbackCopy: function(text) {
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Link copied to clipboard', 'success');
        },

        updateCartCount: function(count) {
            var cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = count;
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        },

        initCart: function() {
            var self = this;

            document.querySelectorAll('[data-remove-item]').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    var itemId = this.getAttribute('data-remove-item');
                    self.removeFromCart(itemId);
                });
            });

            document.querySelectorAll('.cart-table .quantity-selector__input').forEach(function(input) {
                input.addEventListener('change', function() {
                    var itemId = this.getAttribute('data-cart-item');
                    var quantity = parseInt(this.value);
                    self.updateCartItem(itemId, quantity);
                });
            });
        },

        removeFromCart: function(itemId) {
            if (typeof salla !== 'undefined' && salla.cart) {
                salla.cart.removeItem(itemId).then(function() {
                    location.reload();
                });
            } else {
                var row = document.querySelector('[data-cart-item="' + itemId + '"]');
                if (row) row.remove();
                this.showNotification('Item removed from cart', 'info');
            }
        },

        updateCartItem: function(itemId, quantity) {
            if (typeof salla !== 'undefined' && salla.cart) {
                salla.cart.updateItem(itemId, quantity).then(function(response) {
                    var totalEl = document.querySelector('[data-item-total="' + itemId + '"]');
                    if (totalEl && response.itemTotal) {
                        totalEl.textContent = response.itemTotal;
                    }
                    var subtotalEl = document.querySelector('[data-cart-subtotal]');
                    if (subtotalEl && response.subtotal) {
                        subtotalEl.textContent = response.subtotal;
                    }
                });
            }
        },

        initModals: function() {
            document.querySelectorAll('[data-modal-trigger]').forEach(function(trigger) {
                trigger.addEventListener('click', function(e) {
                    e.preventDefault();
                    var modalId = this.getAttribute('data-modal-trigger');
                    var modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            });

            document.querySelectorAll('[data-modal-close]').forEach(function(closeBtn) {
                closeBtn.addEventListener('click', function() {
                    var modal = this.closest('.modal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });

            document.querySelectorAll('.modal__backdrop').forEach(function(backdrop) {
                backdrop.addEventListener('click', function() {
                    var modal = this.closest('.modal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });
        },

        initSmoothScroll: function() {
            document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
                anchor.addEventListener('click', function(e) {
                    var targetId = this.getAttribute('href');
                    if (targetId === '#') return;

                    var target = document.querySelector(targetId);
                    if (target) {
                        e.preventDefault();
                        var headerHeight = document.getElementById('header').offsetHeight || 0;
                        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        },

        initLazyLoad: function() {
            if ('IntersectionObserver' in window) {
                var lazyImages = document.querySelectorAll('img[data-src]');
                
                var imageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            var img = entry.target;
                            img.src = img.getAttribute('data-src');
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    });
                });

                lazyImages.forEach(function(img) {
                    imageObserver.observe(img);
                });
            } else {
                var lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(function(img) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                });
            }
        },

        showNotification: function(message, type) {
            type = type || 'info';
            
            var existing = document.querySelector('.notification');
            if (existing) {
                existing.remove();
            }

            var notification = document.createElement('div');
            notification.className = 'notification notification--' + type;
            notification.innerHTML = '<div class="notification__content">' +
                '<span class="notification__message">' + message + '</span>' +
                '<button class="notification__close">&times;</button>' +
                '</div>';

            document.body.appendChild(notification);
            
            requestAnimationFrame(function() {
                notification.classList.add('active');
            });

            setTimeout(function() {
                notification.classList.remove('active');
                setTimeout(function() {
                    notification.remove();
                }, 300);
            }, 3000);

            notification.querySelector('.notification__close').addEventListener('click', function() {
                notification.classList.remove('active');
                setTimeout(function() {
                    notification.remove();
                }, 300);
            });
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        LuluOroTheme.init();
    });

    window.LuluOroTheme = LuluOroTheme;
})();