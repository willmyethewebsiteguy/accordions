/* ==========
  Version 3.0
  Accordion Dropdown Plugins for Squarespace
  Copyright Will Myers 
========== */
(function () {
  const ps = {
    cssId: 'wm-accordions',
    cssFile: 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/accordions@3.0.002/styles.min.css'
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
    
    function openAccordion(instance) {
      let acc = instance.settings;
      acc.groupAccs.forEach(el => {
        el.wmAccordion?.close();
      })      

      acc.setHeight = acc.content.scrollHeight;
      acc.content.style.height = `${acc.height}px`;
      acc.container.classList.add('open');
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

      for (item in data) {
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
          return document.querySelectorAll(`.wm-accordion-block[data-group="${this.groupID}"]`);
        },
        set setHeight(height) {
          this.height = height;
        }
      }

      //get Local Settings
      getLocalSettings(this);

      //Set Toggle Listener
      createClickListener(this);

      //Attach Settings to El
      attachSettings(this);

      //DOM Load Event Listener
      createDOMLoadEventListener(this);
      
      //Build Resize Observer
      buildResizeObserver(this)

      this.settings.container.classList.add('loaded');
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

    return Constructor;
  }());

  let BuildAccordionFromStackedBlocks = (function () {

    function copyAttributes(source, target) {
      return Array.from(source.attributes).forEach(attribute => {
        target.setAttribute(
          attribute.nodeName === 'id' ? 'data-id' : attribute.nodeName,
          attribute.nodeValue,
        );
      });
    }

    function setIcon() {
      let acc = document.querySelector('.wm-accordion-block'),
          fakeAcc = '';
      if (!acc) {
        fakeAcc = `<div class="wm-accordion-block fake-acc"></div>`;
        document.body.insertAdjacentHTML('beforeend', fakeAcc);
        acc = document.querySelector('.wm-accordion-block');
      }

      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      if (fakeAcc) acc.remove();
      return {html: defaults.icons[icon], id: icon};
    } 

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList = 'wm-accordion-block loaded';
      
      if (container.tagname !== "DIV") {
        let div = document.createElement('div');
        div.innerHTML = container.innerHTML;
        copyAttributes(container, div)
        container.parentNode.replaceChild(div, container);
        container = div;
        instance.settings.container = div;
      }
      
      container.closest('.sqs-block')?.classList.add('contains-wm-accordion');
      
      let template = `
      <div class="accordion-wrapper">
        <button class="accordion-toggle">
          <div class="text">${instance.settings.title}</div>
          <div class="icon ${setIcon().id}">
            ${setIcon().html}
          </div>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-wrapper">
          </div>
        </div>
      </div>
      `
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
    
    /**
     * The constructor object
     * @param {String} selector The selector for the element to render into
     * @param {Object} options  User options and settings
     */
    function Constructor(el, options = {}) {
      
      this.settings = {
        initEl: el.cloneNode(true),
        container: el,
        get data() {
          return this.initEl.dataset
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
      
      new wmAccordion(this.settings.container, this.settings);
    }

    return Constructor;
  })();
  let BuildAccordionsFromCollection = (function(){

    function setIcon() {
      let acc = document.querySelector('.wm-accordion-block'),
          fakeAcc = '';
      if (!acc) {
        fakeAcc = `<div class="wm-accordion-block fake-acc"></div>`;
        document.body.insertAdjacentHTML('beforeend', fakeAcc);
        acc = document.querySelector('.wm-accordion-block');
      }
      
      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      if (fakeAcc) acc.remove();
      return {html: defaults.icons[icon], id: icon};
    } 

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      let template = `
        ${instance.settings.accsObj.map(function (item) {
          return `<div class="wm-accordion-block loaded" ${instance.settings.data['group'] ? `data-group="${instance.settings.data['group']}"` : null}>
       <div class="accordion-wrapper">
        <button class="accordion-toggle">
          <div class="text">${item.title}</div>
          <div class="icon ${setIcon().id}">
            ${setIcon().html}
          </div>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-wrapper">
            ${item.body.outerHTML}
          </div>
        </div>
      </div>
    </div>`;
        }).join('')}
        `;
      container.innerHTML = template;
    }
    /**
     * The constructor object
     * @param {String} selector The selector for the element to render into
     * @param {Object} options  User options and settings
     */
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
      this.initImages(this);
      
      let newAccs = this.settings.container.querySelectorAll('.wm-accordion-block');
      newAccs.forEach(el => {
        new wmAccordion(el);
      });    
    }

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

    return Constructor
  })();
  let BuildAccordionFromSelector = (function(){

    function setIcon() {
      let acc = document.querySelector('.wm-accordion-block'),
          fakeAcc = '';
      if (!acc) {
        fakeAcc = `<div class="wm-accordion-block fake-acc"></div>`;
        document.body.insertAdjacentHTML('beforeend', fakeAcc);
        acc = document.querySelector('.wm-accordion-block');
      }

      let styles = window.getComputedStyle(acc),
          icon = styles.getPropertyValue('--icon-type').trim();
      if (fakeAcc) acc.remove();
      return {html: defaults.icons[icon], id: icon};
    } 

    let injectTemplate = (instance) => {
      let container = instance.settings.container;
      container.classList = 'wm-accordion-block loaded';
      container.closest('.sqs-block')?.classList.add('contains-wm-accordion');

      let template = `
      <div class="accordion-wrapper">
        <button class="accordion-toggle">
          <div class="text">${instance.settings.title}</div>
          <div class="icon ${setIcon().id}">
            ${setIcon().html}
          </div>
        </button>
        <div class="accordion-content">
          <div class="accordion-content-wrapper">
          </div>
        </div>
      </div>
      `;
      
      return container.innerHTML = template;
    }
    
    let addTargets = (instance) => {
      let container = instance.settings.contentContainer,
          targetsArr = instance.settings.targetsArr;
      
      targetsArr.forEach(target => {
        let el = document.querySelector(target);
        /*if (target.includes('data-section-id') && utils.inIframe) {
          console.log('iniFrame')
          let newEl = el.cloneNode(true);
          el.classList.add('hide-section');
          el = newEl;
        }*/
        if (el?.closest('.fe-block')) {
          el = el.closest('.fe-block')
        }
        
        container.append(el);
      });
    }

    /**
     * Breakdown HTML when in Edit Mode
     * @param  {Constructor} instance The current instantiation
     */
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

    /**
     * The constructor object
     * @param {String} selector The selector for the element to render into
     * @param {Object} options  User options and settings
     */
    function Constructor(el, options = {}) {
      
      this.settings = {
        initEl: el.cloneNode(true),
        container: el,
        get data() {
          return this.initEl.dataset
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
      
      injectTemplate(this);
      
      addTargets(this);

      // Breakdown when in Edit Mode
      watchForEditMode(this);
      
      new wmAccordion(this.settings.container, this.settings);
    }
    
    /**
     * Destroy this instance
    */
    Constructor.prototype.destroy = function (instance) {
      //Deconstruct the Tabs Element
      function removeElements() {
        if (!instance.settings) { return }
        instance.settings.container.remove();
      }

      removeElements();
    };

    return Constructor;
  }());

  function initAccordions() {
    //Build HTML from Collection
    async function getCollectionJSON(url) {
      url += `?format=json-pretty`;
      try {
        return fetch(url)
          .then(function (response) {
          return response.json();
        })
          .then(function (json) {
          return json.items;
        });
      } catch (err) {
        console.error(err)
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
      let collectionObj = await getCollectionJSON(url),
          results = []

      collectionObj.forEach(item => {
        let obj = {
          url: item.fullUrl,
          title: item.title,
          assetUrl: item.assetUrl,
          body: ''
        }
        results.push(obj);
      })

      await Promise.all(results.map(async (item) => {
        item.body = await loadHtml(item.url);
      }));

      document.querySelectorAll(`[data-wm-plugin="accordion"][data-source="${url}"]:not(.loaded), [data-wm-plugin="accordions"][data-source="${url}"]:not(.loaded)`).forEach(el => {
        try {
          new BuildAccordionsFromCollection(el, {accsObj:results});
        } catch (err) {
          console.error('Problem Loading the Accordions From URL')
          console.log(err)
        }
      })
    }
    let initCollections = document.querySelectorAll(`[data-wm-plugin="accordion"][data-source]:not(.loaded, .loading), [data-wm-plugin="accordions"][data-source]:not(.loaded, .loading)`);
    for (const el of initCollections) {
      el.classList.add('loading');
      buildTabsFromCollection(el, el.dataset.source);
    }

    //Build Accordion from Selectors
    let initFromSelectors = document.querySelectorAll(`[data-wm-plugin="accordion"]:not(.loaded)[data-target]`);
    for (const el of initFromSelectors) {
      try {
        new BuildAccordionFromSelector(el)
      } catch (err) {
        console.error('Problem Loading the Accordions From Selectors')
        console.log(err)
      }
    }

    //Build Accordion from Stacked Blocks 
    let initFromStackedBlocks = document.querySelectorAll(`[data-wm-plugin="accordion"][data-accordion-start]:not(.loaded), .wm-accordion-start:not(.loaded)`);
    for (const el of initFromStackedBlocks) {
      try {
        new BuildAccordionFromStackedBlocks(el);
      } catch (err) {
        console.error('Problem Loading the Accordions From Stacked Blocks')
        console.log(err)
      }
    }

    //From Raw HTML
    let accordionContainers = document.querySelectorAll(`[data-wm-plugin="accordion"]:not(.loaded, .loading, [data-accordion-start]), .wm-accordion-block:not(.loaded, .loading)`);
    for (const el of accordionContainers) {
      try {
        new wmAccordion(el);
      } catch (err) {
        console.error('Problem Loading the Accordions Plugin', el)
        console.log(err)
      }
    }
  }

  initAccordions();
  window.addEventListener('load', initAccordions)
  window.wmAccordionsInit = function() { initAccordions() }
})();
