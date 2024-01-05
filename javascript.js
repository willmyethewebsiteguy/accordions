/* ==========
  Version 3
  Accordion Dropdown Plugins for Squarespace
  Copyright Will Myers 
========== */
(function () {
  const ps = {
    cssId: 'wm-accordions',
    cssFile: 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/accordions@3/styles.min.css'
  };
  const defaults = {
    icons: {
      angle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>Angle Up</title>
                <path data-name="layer1" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M4 16 l28 26 L60 16" stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>`,
      plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
              <title>Open Accordion</title>
              <path data-name="vertical" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M32 4v56" stroke-linejoin="round" stroke-linecap="round"></path>
              <path data-name="horiontal" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M4 32h56" stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>`,
      arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>Open Accordion Arrow</title>
                <path data-name="line" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M32 4V60" stroke-linejoin="round" stroke-linecap="round"></path>
                <path data-name="angle" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M18 46l14 14 14-14" stroke-linejoin="round" stroke-linecap="round"></path>
            </svg>`,
      x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>Accordion Toggle</title>
            <path data-name="layer1" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M32 16v32m16-16H16" stroke-linejoin="round" stroke-linecap="round"></path>
          </svg>`,
      triangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
                <title>Open Accordion</title>
                <path data-name="layer1" fill="#202020" stroke="#202020" stroke-miterlimit="10" stroke-width="2" d="M20 14L44 32 20 50 z" stroke-linejoin="round" stroke-linecap="round"></path>
              </svg>`

    }
  };
  const utils = {
    /* Emit a custom event */
    emitEvent: function (type, detail = {}, elem = document) {
      // Make sure there's an event type
      if (!type) return;

      // Create a new event
      let event = new CustomEvent(type, {
        bubbles: true,
        cancelable: true,
        detail: detail,
      });

      // Dispatch the event
      return elem.dispatchEvent(event);
    },
    inIframe: function () {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }
  }

  let wmAccordion = (function(){
    
    function setAllowMultipleOpenAttr(instance) {
      let accGroup = instance.settings.groupContainer;
      //console.log(acc)
      let styles = window.getComputedStyle(accGroup),
          value = styles.getPropertyValue('--allow-multiple-open').trim();
      
      if (value === 'true') {
        accGroup.setAttribute('data-allow-multiple-open', '');
      }
      return 
    }
    
    function openAccordion(instance) {
      let acc = instance.settings;
      
      if (!acc.allowMultipleOpen) {
        acc.groupAccs.forEach(el => {
          el.wmAccordion?.close();
        });
      }

      function setHeight() {
        acc.setHeight = acc.contentWrapper.scrollHeight;
        acc.content.style.height = `${acc.height}px`;
        acc.container.classList.add('open'); 
      }
      function scrollTo() {
        let prevAcc = acc.container.previousElementSibling?.querySelector('button');
        if (!prevAcc) return;
        let openAccBottom = prevAcc.getBoundingClientRect().bottom;

        if (openAccBottom < 0) {
          let scrollBy = openAccBottom - 200;
          window.scrollBy({
            top: scrollBy,
            behavior: 'smooth'
          });
        }
      }
      function transitionEnded() {
        if (!acc.container.matches('.open')) return;
        setHeight();
        acc.content.removeEventListener('transitionend', transitionEnded);
        if (!acc.allowMultipleOpen) scrollTo();
      }

      setHeight();
      acc.content.addEventListener('transitionend', transitionEnded);
      if (!acc.allowMultipleOpen) scrollTo();
    }

    function closeAccordion(instance) {
      instance.settings.container.classList.remove('open');
      instance.settings.content.style.height = `0px`;
    }

    function toggleAccordion(instance){
      if (instance.settings.container.matches('.open')) {
        instance.close();
      } else {
        instance.open();
      }
    }

    function createClickListener(instance) {
      instance.settings.button.addEventListener('click', function() {
        instance.toggle()
      });
    }

    function attachSettings(instance) {
      let el = instance.settings.container;
      el.wmAccordion = {
        setting: instance.settings,
        toggle: function() {
          toggleAccordion(instance)
        },
        close: function() {
          closeAccordion(instance)
        },
        open: function() {
          openAccordion(instance)
        },
        init: function() {
          initAccordion(instance);
        }
      }
    }

    function createDOMLoadEventListener(instance) {
      function handleEvent() {
        if (instance.settings.initOpen) {
          instance.open();
        }
      }
      window.addEventListener('DOMContentLoaded', handleEvent)
    }

    function getLocalSettings(instance) {
      let data = instance.settings.container.dataset;
      
      for (let item in data) {
        instance.settings[item] = data[item];
        if (data[item] == ''){
          instance.settings[item] = true;
        }
      }
    }

    function buildResizeObserver(instance) {
      let acc = instance.settings
      const resize = new ResizeObserver(entries => {
        entries.forEach(entry => {
          if (!acc.container.matches('.open')) return;
          acc.setHeight = acc.contentWrapper.scrollHeight;
          acc.content.style.height = `${acc.height}px`;
        });
      });

      resize.observe(instance.settings.contentWrapper);
    }

    let Constructor = function (el) {

      this.addCSS();

      this.open = function() {
        openAccordion(this)
      };

      this.close = function() {
        closeAccordion(this)
      }

      this.toggle = function() {
        toggleAccordion(this)
      }

      this.settings = {
        container: el,
        group: null,
        initOpen: null,
        height: null,
        get groupContainer() {
          return this.container.closest('[data-wm-plugin="accordion"]');
        },
        get button() {
          return this.container.querySelector('button');
        },
        get buttonText() {
          console.log(this.button.innerText)
        },
        get content() {
          return this.container.querySelector('.accordion-content');
        },
        get contentWrapper() {
          return this.container.querySelector('.accordion-content-wrapper');
        },
        get groupID() {
          return this.container.dataset.group;
        },
        get groupAccs() {
          return this.groupContainer.querySelectorAll('.wm-accordion-block');
        },
        set setHeight(height) {
          this.height = height;
        },
        get allowMultipleOpen() {
          let allow = this.groupContainer.dataset.allowMultipleOpen !== undefined ? true : false;
          return allow;
        },
        get openAcc() {
          return this.groupContainer.querySelector('.wm-accordion-block.open')
        }
      }

      //get Local Settings
      getLocalSettings(this);
      
      //set Allow Multiple Open Variable
      setAllowMultipleOpenAttr(this);

      //Set Toggle Listener
      createClickListener(this);

      //Attach Settings to El
      attachSettings(this);

      //DOM Load Event Listener
      createDOMLoadEventListener(this);
      
      //Build Resize Observer
      buildResizeObserver(this)

      this.settings.container.classList.add('loaded');

      this.initImages(this);

      if (this.settings.initOpen) {
        this.open();
      }
    }
   
    /**
     * Add CSS
     */
    Constructor.prototype.addCSS = function () {
      let cssFile = document.querySelector(`#${ps.cssId}-css`);
      function addCSSFile() {
        let url = `${ps.cssFile}`;
        let head = document.getElementsByTagName("head")[0],
            link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = `${ps.cssId}-css`;
        link.type = "text/css";
        link.href = url;
        link.onload = function () {
          loaded();
        };

        head.prepend(link);
      }

      function loaded() {
        const event = new Event(`${ps.cssId}:css-loaded`);
        window.dispatchEvent(event);
        document.querySelector("body").classList.add(`#${ps.cssId}-css-loaded`);
      }

      if (!cssFile) {
        addCSSFile();
      } else {
        document.head.prepend(cssFile);
        loaded();
      }
    };

    Constructor.prototype.initImages = function (instance) {
      let images = instance.settings.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.add('loaded');
        let imgData = img.dataset,
            focalPoint = imgData.imageFocalPoint,
            parentRation = imgData.parentRatio,
            src = img.src;
        if (focalPoint) {
          let x = focalPoint.split(',')[0] * 100,
              y = focalPoint.split(',')[1] * 100;
          img.style.setProperty('--position', `${x}% ${y}%`)
        }
        if (!src) {
          img.src = imgData.src
        }
      });
    }

    return Constructor;
  }());

  let BuildAccordionFromStackedBlocks = (function(){
    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach(attribute => {
        target.setAttribute(
          attribute.nodeName === 'id' ? 'data-id' : attribute.nodeName,
          attribute.nodeValue,
        );
      });
    }

    function setIcon(instance) {
      let acc = instance.settings.container;
      
      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      return `<div class="icon ${icon}">
  ${defaults.icons[icon]}
</div>`;
    }

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList = 'loaded';
      container.dataset.wmPlugin = 'accordion';
      
      if (container.tagname !== "DIV") {
        let div = document.createElement('div');
        div.innerHTML = container.innerHTML;
        copyAttributes(container, div)
        container.parentNode.replaceChild(div, container);
        container = div;
        instance.settings.container = div;
      }
      
      container.closest('.sqs-block')?.classList.add('contains-wm-accordion');
      container.classList.add('acc-from-stacked');
      
      let template = `
      <div class="wm-accordion-block loaded">
        <div class="accordion-wrapper">
          <button class="accordion-toggle">
            <div class="text">${instance.settings.title}</div>
            ${setIcon(instance)}
          </button>
          <div class="accordion-content">
            <div class="accordion-content-wrapper">
            </div>
          </div>
        </div>
      </div>`
      return instance.settings.container.innerHTML = template;
    }
    
    let addBlocks = (instance) => {
      let container = instance.settings.contentContainer,
          nextEl = container.closest('.sqs-block').nextElementSibling,
          j = 1;
      
      while (!nextEl.querySelector('.wm-accordion-start, [data-accordion-start], .wm-accordion-end, [data-accordion-end]') && j < 50) {
        let lockEl = nextEl.nextElementSibling;
        container.append(nextEl)
        nextEl = lockEl;
        if (!nextEl) break;
        j = j + 1;
      }
    }

    function reposition(instance) {
      let location = instance.settings.initEl.dataset.position,
          reference = 'beforeend';
      
      if (location == "product-details") {
        let detailsContainer = document.querySelector('.ProductItem-details-checkout'),
            productAccDetails = document.querySelector('.ProductItem-details-accordion');
        if(detailsContainer && !productAccDetails) {
          let container = `<div class="ProductItem-details-accordion"></div>`
          detailsContainer.querySelector(':scope > :last-child') .insertAdjacentHTML('beforebegin', container);
        }
        location = '.ProductItem-details-accordion';
      } 
      
      if (location) {
        document.querySelector(location).insertAdjacentElement(reference, instance.settings.container)
      }
    }
    
    function Constructor(el, options = {}) {
      
      this.settings = {
        initEl: el.cloneNode(true),
        container: el,
        get data() {
          return this.initEl.dataset
        },
        get acc() {
          return this.container.querySelector('.wm-accordion-block');
        },
        get title() {
          return this.initEl.innerHTML;
        },
        get elWrapper() {
          return this.initEl.closest('.sqs-block-content');
        },
        get contentContainer() {
          return this.container.querySelector('.accordion-content-wrapper')
        }
      }
      
      injectTemplate(this);
      addBlocks(this);
      setIcon(this);
      
      reposition(this);
      
      new wmAccordion(this.settings.acc, this.settings);
    }

    return Constructor;
  })();
  let BuildAccordionsFromCollection = (function(){
    function clean(str) {
      return str.trim().toLowerCase().replaceAll(' ', '-');
    }
    function setIcon() {
      let acc = document.querySelector('[data-wm-plugin="accordion"]'),
          fakeAcc = '';
      if (!acc) {
        fakeAcc = `<div data-wm-plugin="accordion" class="fake-acc"></div>`;
        document.body.insertAdjacentHTML('beforeend', fakeAcc);
        acc = document.querySelector('[data-wm-plugin="accordion"]');
      }
      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      if (fakeAcc) acc.remove();
      return {html: defaults.icons[icon], id: icon};
    }
    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList.add('acc-from-collection');

      let template = `
        ${instance.settings.accsObj.map(function (item) {
          return `<div class="wm-accordion-block loaded" ${instance.settings.data['group'] ? `data-group="${instance.settings.data['group']}"` : null} data-accordion-id="${clean(item.title)}">
       <div class="accordion-wrapper">
        <button class="accordion-toggle">
          <div class="text">${item.title}</div>
          <div class="icon ${setIcon().id}">
            ${setIcon().html}
          </div>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-wrapper">
            ${item.body}
          </div>
        </div>
      </div>
    </div>`;
        }).join('')}
        `;
      container.innerHTML = template;
    }
    function reposition(instance) {
      let location = instance.settings.initEl.dataset.position,
          reference = 'beforeend';
      
      if (location == "product-details") {
        let detailsContainer = document.querySelector('.ProductItem-details-checkout'),
            productAccDetails = document.querySelector('.ProductItem-details-accordion');
        if(detailsContainer && !productAccDetails) {
          let container = `<div class="ProductItem-details-accordion"></div>`
          detailsContainer.querySelector(':scope > :last-child') .insertAdjacentHTML('beforebegin', container);
        }
        location = '.ProductItem-details-accordion';
      } 
      
      if (location) {
        document.querySelector(location).insertAdjacentElement(reference, instance.settings.container)
      }
    }
    function Constructor(el, options = {}) {

      this.settings = {
        container: el,
        initEl: el.cloneNode(true),
        get data() {
          return this.initEl.dataset
        },
        accsObj: options.accsObj
      }

      injectTemplate(this);
      reposition(this);

      if (window.Squarespace) {
        window.Squarespace.globalInit(Y);
        //console.log('global init')
      } else {
        console.log('waiting on SS to load')
      }
      //Squarespace.globalInit(Y);
      /*this.initImages(this);*/

      let newAccs = this.settings.container.querySelectorAll('.wm-accordion-block');
      newAccs.forEach(el => {
        new wmAccordion(el);
      });
      this.settings.container.classList.remove('loading')
      this.settings.container.classList.add('loaded')
    }
    /*Constructor.prototype.initImages = function (instance) {
      let images = instance.settings.container.querySelectorAll('img');
      images.forEach(img => {
        img.classList.add('loaded');
        let imgData = img.dataset,
            focalPoint = imgData.imageFocalPoint,
            parentRation = imgData.parentRatio,
            src = img.src;
        if (focalPoint) {
          let x = focalPoint.split(',')[0] * 100,
              y = focalPoint.split(',')[1] * 100;
          img.style.setProperty('--position', `${x}% ${y}%`)
        }
        if (!src) {
          img.src = imgData.src
        }
      });
    }*/
    return Constructor
  })();
  let BuildAccordionFromSelector = (function(){

    function setIcon(instance) {
      let acc = instance.settings.container;
      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      return `<div class="icon ${icon}">
  ${defaults.icons[icon]}
</div>`;
    }
    
    let addTargets = (instance) => {
      let container = instance.settings.container,
          accs = container.querySelectorAll('.wm-accordion-block');

      accs.forEach(acc => {
        let targets = acc.dataset?.target,
            wrapper = acc.querySelector('.accordion-content-wrapper');

        if (targets === '') targets = '1';
        targets = targets.split(',');
        
        targets.forEach(target => {
          let el;
          if (!parseInt(target)) {
            el = document.querySelector(target);
            if (el?.closest('.fe-block')) {
              el = el.closest('.fe-block')
            }
          } else {
            el = acc.closest('.page-section').nextElementSibling;
          }
          wrapper.append(el);
        });
      })
    }

    let injectTemplate = (instance) => {
      let container = instance.settings.container,
        accsHTML = '';
      container.classList.add('loaded');
      container.classList.add('acc-from-selector');
      container.closest('.sqs-block')?.classList.add('contains-wm-accordion');
      
      let accs = container.querySelectorAll(':scope > *');
      
      if (accs.length === 0) {
        container.insertAdjacentHTML('afterbegin', `<button>${container.innerText}</button>`)
        accs = container.querySelectorAll(':scope > *');
      }
      
      accs.forEach(acc => {
        let template = `
      <div class="wm-accordion-block loaded" data-target="${acc.dataset.target ? `${acc.dataset.target}` : ``}" data-accordion-id="${acc.id ? acc.id : ''}">
        <div class="accordion-wrapper">
          <button class="accordion-toggle">
            <div class="text">${acc.innerHTML}</div>
            ${setIcon(instance)}
          </button>
          <div class="accordion-content">
            <div class="accordion-content-wrapper">
            </div>
          </div>
        </div>
      </div>
      `;
        accsHTML = accsHTML + template;
      });
      
      return container.innerHTML = accsHTML;
    }

    function addSectionIndex() {
      /*if (window.top == window.self) return;
        let sectionsContainer = document.querySelector('#page #sections'),
          collectionItemSections = document.querySelector('#page #collection-item-sections'),
          container = collectionItemSections ? collectionItemSections : sectionsContainer,
          sections = container.querySelectorAll(':scope > .page-section');
      
      
      for (let section of sections) {
        let index = Array.prototype.indexOf.call(container.children, section);
        section.dataset.wmAccordionIndexId = index;
      }*/

    }

    function watchForEditMode(instance) {
      let elemToObserve = document.querySelector("body");
      let prevClassState = elemToObserve.classList.contains("sqs-edit-mode-active");
      let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName == "class") {
            let currentClassState = mutation.target.classList.contains("sqs-edit-mode-active");
            if (prevClassState !== currentClassState) {
              prevClassState = currentClassState;
              if (currentClassState) instance.destroy(instance);
            }
          }
        });
      });
      observer.observe(elemToObserve, { attributes: true });
    }

    function reposition(instance) {
      let location = instance.settings.initEl.dataset.position,
          reference = 'beforeend';
      
      if (location == "product-details") {
        let detailsContainer = document.querySelector('.ProductItem-details-checkout'),
            productAccDetails = document.querySelector('.ProductItem-details-accordion');
        if(detailsContainer && !productAccDetails) {
          let container = `<div class="ProductItem-details-accordion"></div>`
          detailsContainer.querySelector(':scope > :last-child') .insertAdjacentHTML('beforebegin', container);
        }
        location = '.ProductItem-details-accordion';
      } 
      
      if (location) {
        document.querySelector(location).insertAdjacentElement(reference, instance.settings.container)
      }
    }

    function Constructor(el, options = {}) {
      
      this.settings = {
        initEl: el.cloneNode(true),
        container: el,
        get data() {
          return this.initEl.dataset
        },
        get groupContainer() {
          return this.container.closest('[data-wm-plugin="accordion"]');
        },
        get accs() {
          return this.container.querySelectorAll('.wm-accordion-block');
        },
        get elWrapper() {
          return this.initEl.closest('.sqs-block-content')
        },
        get targetsArr() {
          let arr = this.container.dataset.target.split(',');
          arr.map(el => el.trim());
          return arr
        },
        get title() {
          return this.initEl.innerHTML;
        },
        get contentContainer() {
          return this.container.querySelector('.accordion-content-wrapper')
        }
      }

      addSectionIndex()
      
      injectTemplate(this);
      
      addTargets(this);

      // Breakdown when in Edit Mode
      watchForEditMode(this);
      
      reposition(this);

      this.settings.accs.forEach(acc => {
        new wmAccordion(acc, this.settings);
      });
    }
    
    Constructor.prototype.destroy = function (instance) {
      //instance.settings.groupContainer.remove();
      //Deconstruct the Accordion Sections
      function removeElements() {
        //if (!instance.elements) { return }
        let sectionsContainer = document.querySelector('#page #sections'),
          collectionItemSections = document.querySelector('#page #collection-item-sections'),
          sections = instance.settings.container.querySelectorAll('[data-wm-initial-section-index-id]'),
          container = collectionItemSections ? collectionItemSections : sectionsContainer;
        
        for (let section of sections) {
          let index = parseInt(section.getAttribute('data-wm-initial-section-index-id'));
          if (!index) continue;
          let currentChildAtIndex = container.children[index];
          if (currentChildAtIndex) {
            container.insertBefore(section, currentChildAtIndex);
          } else {
            container.appendChild(section);
          }
        }
      }

      removeElements();
    };

    return Constructor;
  }());

  function initAccordions() {
    //Build HTML from Collection
    function initOpens(){
      let all = document.querySelectorAll('[data-init-open="all"]');
      let first = document.querySelectorAll('[data-init-open="first"], [data-init-open="true"]');

      all.forEach(group => {
        let accs = group.querySelectorAll('.wm-accordion-block');
        accs.forEach(acc => acc.wmAccordion?.open())
      })

      first.forEach(group => {
        if (group.querySelector('.wm-accordion-block')) {
          group.querySelector('.wm-accordion-block').wmAccordion?.open();
        } 
      })
    }
    async function getCollectionJSON(url) {
      let items = [];
      try {
        const response = await fetch(url);
        const json = await response.json();
    
        if (json.pagination && json.pagination.nextPage) {
          items = items.concat(json.items);
          const nextPageItems = await getCollectionJSON(json.pagination.nextPageUrl + '&format=json-pretty');
          items = items.concat(nextPageItems);
        } else {
          items = items.concat(json.items);
        }
    
        return items;
      } catch (err) {
        console.error(err);
      }
    }
    async function loadHtml(url) {
      try {
        return fetch(url)
          .then(function (response) {
          return response.text();
        })
          .then(function (text) {
          let parser = new DOMParser(),
              doc = parser.parseFromString(text, 'text/html'),
              html = doc.querySelector('#sections .blog-item-content-wrapper .sqs-layout').parentElement;
          return html;
        })
          .then(function (body) {
          return body;
        });
      } catch (err) {
        console.error(err);
      }
    }
    async function buildTabsFromCollection(el, url) {
      let collectionObj = await getCollectionJSON(url + '?format=json-pretty'),
          results = [];

      collectionObj.forEach(item => {
        let obj = {
          url: item.fullUrl,
          title: item.title,
          assetUrl: item.assetUrl,
          body: item.body
        }
        results.push(obj);
      })

      /*await Promise.all(results.map(async (item) => {
        item.body = await loadHtml(item.url);
      }));*/

      document.querySelectorAll(`[data-wm-plugin="accordion"][data-source="${url}"]:not(.loaded), [data-wm-plugin="accordions"][data-source="${url}"]:not(.loaded)`).forEach(el => {
        try {
          new BuildAccordionsFromCollection(el, {accsObj:results});
          initOpens();
        } catch (err) {
          console.error('Problem Loading the Accordions From URL')
          console.log(err)
        }
      })
    }
    function openFromUrl() {
      const url = new URL(window.location.href),
            searchParams = url.searchParams.getAll("accordion");

      if (searchParams) {
        for (let param of searchParams) {
          let acc = document.querySelector(`[data-accordion-id="${param}"]`);
          if (acc) {
            if (!acc.wmAccordion) {
              acc.querySelector('.wm-accordion-block').wmAccordion.open();
            } else {
              acc.wmAccordion.open()
            }
          }
        }
      }
    }
    
    // Build From Collection URL (Collection URL)
    let initCollections = document.querySelectorAll(`[data-wm-plugin="accordion"][data-source]:not(.loaded):not(.loading), [data-wm-plugin="accordions"][data-source]:not(.loaded):not(.loading)`); 
    for (const el of initCollections) {
      el.classList.add('loading');
      buildTabsFromCollection(el, el.dataset.source);
    }

    //Build Accordion from Selectors (Fluid Engine)
    let initFromSelectors = document.querySelectorAll(`[data-wm-plugin="accordion"]:not(.loaded):not([data-source])`);
    for (const el of initFromSelectors) {
      try {
        new BuildAccordionFromSelector(el)
        initOpens();
      } catch (err) {
        console.error('Problem Loading the Accordions From Selectors')
        console.log(err)
      }
    }

    //Build Accordion from Stacked Blocks (Classic Editor)
    let initFromStackedBlocks = document.querySelectorAll(`.wm-accordion-start:not(.loaded)`);
    for (const el of initFromStackedBlocks) {
      try {
        new BuildAccordionFromStackedBlocks(el);
        initOpens();
      } catch (err) {
        console.error('Problem Loading the Accordions From Stacked Blocks')
        console.log(err)
      }
    }

    //Init Accordions
    openFromUrl()
  }

  function numberSections() {
    if (window.top == window.self) return;
      let sectionsContainer = document.querySelector('#page #sections'),
        collectionItemSections = document.querySelector('#page #collection-item-sections'),
        container = collectionItemSections ? collectionItemSections : sectionsContainer;
      if (!container) return;
      let sections = container.querySelectorAll(':scope > .page-section');
    
    
    for (let section of sections) {
      if (section.dataset.wmInitialSectionIndexId) return;
      let index = Array.prototype.indexOf.call(container.children, section);
      section.dataset.wmInitialSectionIndexId = index;
    }
  }
  
  numberSections();
  initAccordions();
  window.addEventListener('load', initAccordions)
  window.wmAccordionsInit = function() { initAccordions() }
})();
