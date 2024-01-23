if (!customElements.get('sticky-header')) {
	customElements.define('sticky-header', class StickyHeader extends HTMLElement {
		constructor() {
			super();
		}

		connectedCallback() {
			this.header = document.querySelector('.section-header');
			this.headerBounds = {};
			this.currentScrollTop = 0;
			this.preventReveal = false;
			this.predictiveSearch = this.querySelector('predictive-search');

			this.onScrollHandler = this.onScroll.bind(this);
			this.hideHeaderOnScrollUp = () => {
				this.preventReveal = true;
			};

			this.addEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
			window.addEventListener('scroll', this.onScrollHandler, false);

			this.createObserver();
		}

		disconnectedCallback() {
			this.removeEventListener('preventHeaderReveal', this.hideHeaderOnScrollUp);
			window.removeEventListener('scroll', this.onScrollHandler);
		}

		createObserver() {
			let observer = new IntersectionObserver((entries, observer) => {
				this.headerBounds = entries[0].intersectionRect;
				observer.disconnect();
			});

			observer.observe(this.header);
		}

		onScroll() {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

			if (this.predictiveSearch && this.predictiveSearch.isOpen) {
				return;
			}

			if (scrollTop > this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
				requestAnimationFrame(this.hide.bind(this));
			} else if (scrollTop < this.currentScrollTop && scrollTop > this.headerBounds.bottom) {
				if (!this.preventReveal) {
					requestAnimationFrame(this.reveal.bind(this));
				} else {
					window.clearTimeout(this.isScrolling);

					this.isScrolling = setTimeout(() => {
						this.preventReveal = false;
					}, 66);

					requestAnimationFrame(this.hide.bind(this));
				}
			} else if (scrollTop <= this.headerBounds.top) {
				requestAnimationFrame(this.reset.bind(this));
			}

			this.currentScrollTop = scrollTop;
		}

		hide() {
			this.header.classList.add('section-header-hidden', 'section-header-sticky');

			// Add methods to close dropdowns etc
			this.closeHeaderDropdowns();
		}

		reveal() {
			this.header.classList.add('section-header-sticky', 'animate');
			this.header.classList.remove('section-header-hidden');
		}

		reset() {
			this.header.classList.remove('section-header-hidden', 'section-header-sticky', 'animate');
		}

		closeHeaderDropdowns() {
			const headerDropdowns = this.header.querySelectorAll('localization-form');

			headerDropdowns.forEach(dropdown => {
				dropdown.hidePanel();
			});
		}
	});
}
