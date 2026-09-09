
// jq extends
if ($.fn.getInstance === undefined) {
  //get instance
  $.fn.getInstance = function() {
    return this.data('scope') === null ? undefined : this.data('scope');
  };

  // aria
  if ($.fn.aria === undefined) {
    $.fn.aria = function (_ref) {
      var attrs = _ref.attrs,
          parent = _ref.parent,
          value = _ref.value;

      if (attrs !== undefined) {
        if (!$.isArray(attrs)) {
          attrs = [attrs];
        }

        if (!this.length) {
          return this;
        }

        var tagName = this.get(0).tagName.toLowerCase();
        var sw = value === undefined ? true : value;
        attrs.forEach(function (attribute) {
          this.attr('aria-' + attribute, sw);
          if (parent !== undefined) {
            this.closest(parent).siblings().find(tagName + '[aria-' + attribute + ']').attr('aria-' + attribute, !sw);
          }
        }.bind(this));
      }

      return this;
    };
  }
}

(function (scope) {
  if (window.cqui !== undefined) return;
  var cqui = {};
  scope.cqui = cqui;

  var el = {
    $doc: $(document),
    $win: $(window),
    $body: null,
    $wrap: null,
    $headerBanner: null,
    $nav: null,
    $lnbMenu: null,
    $flotMenu: null,
    $search: null,
  };

  var variable = {
    breakpoint: null,
    isMobile: null,
    isMain: null,
    scrollYpos: 0,
    isDownScroll: null,
    browserWidth: 0,
    browserHeight: 0,
  };

  function init() {
    el.$body = $("body");
    el.$wrap = $(".wrap");
    el.$headerBanner = $(".header-banner");
    el.$nav = $("nav");
    el.$microMenu = $(".micro-menu");
    el.$lnbMenu = $(".menu-area");
    el.$flotMenu = $(".floating-menu");
    el.$search = $(".search-layer");

    variable.isMain = el.$wrap.find(".main-keyvisual").length;

    bind();

    initNavigation();
    initSwiper();
    initAccordion();
    initTootip();

    initSeachResult();
    initTransportation();
    initNetwork();
    initRequest();

    el.$body.find('div[id^="popup_"]').each((idx, item) => {
      new Popup().init(item);
    });

    handler.resize();
    handler.scroll();

    handler.breakpointChecker(variable.breakpoint, 'init');

    initMotion(variable);
  }

  var bind = function () {
    el.$win.on("resize.cqui", handler.reisze).triggerHandler("resize.cqui");
    el.$doc.on("scroll.cqui", handler.scroll).triggerHandler("scroll.cqui");

    // break point
    variable.breakpoint = window.matchMedia("(max-width:767px)");

    if (variable.breakpoint.addEventListener) {
      variable.breakpoint.addEventListener("change", handler.breakpointChecker);
    } else {
      variable.breakpoint.addListener(handler.breakpointChecker);
    }

    // share toggle
    el.$wrap.on('click.cqui', '.btn-share-close, .btn-share', handler.toggleShare);
  };

  var handler = {
    resize: function () {
      var w =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.body.clientWidth;
      var h =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;

      if (variable.browserWidth === w && variable.browserHeight === h)
        return false;

      variable.browserWidth = w;
      variable.browserHeight = h;
    },
    scroll: function () {
      var scrollYpos =
          document.documentElement.scrollTop !== 0
              ? document.documentElement.scrollTop
              : document.body.scrollTop;

      if (variable.scrollYpos !== scrollYpos) {
        variable.isDownScroll = variable.scrollYpos < scrollYpos;
      } else {
        variable.isDownScroll = null;
      }

      variable.scrollYpos = scrollYpos;

      // toggle fixed header
      el.$nav.toggleClass(
          "scroll",
          variable.scrollYpos > $("header").offset().top && !variable.isDownScroll
      );

      // toggle fixed micro menu
      el.$microMenu.toggleClass(
          "sticky",
          variable.scrollYpos > $("header").offset().top + (variable.isDownScroll ?  el.$nav.outerHeight() + el.$microMenu.find('.micro-nav').outerHeight() : 0)
      );

      // auto cloase search layer
      if (!variable.isMobile && variable.scrollYpos > 0 && !!el.$search.length) {
        if (!el.$search.is(':hidden')) handler.toggleSearchLayer();
      }
    },
    breakpointChecker: function (e, type="") {
      const isInit = type === "init";
      variable.isMobile = e.matches;
      const hasPcSwiper = $(".swiper.swiper-product.pc-swiper");

      if (!variable.isMobile) {
        // pc

        // destroy service cont swiper
        destroySwiper(".main-service-list .service-list .swiper");
        // 关闭pc的KR语言 국제운송 下 특화 서비스轮播图 start
        if(hasPcSwiper.length > 0 && !isInit) {
          destroySwiper(".swiper.swiper-product.pc-swiper");
        }
        // 开启KR语言 국제운송 下 특화 서비스轮播图 end

        // main
        if (variable.isMain) {

        } else {
          // destroy resource page tab
          destroySwiper(".main-content-list .swiper");

          // destroy transportation page swiper
          destroySwiper(".swiper.swiper-product");
          // 开启PC的KR语言 국제운송 下 특화 서비스轮播图 start
          if(hasPcSwiper.length > 0) {
            initAutoPlaySwiper(".swiper.swiper-product.pc-swiper");
          }
          // 开启KR语言 국제운송 下 특화 서비스轮播图 end

          handler.changeSideMenu(true);
        }
        // open floating menu (2024.07.25)
        el.$flotMenu.find('.open-menu').show();

      } else {
        // mo

        initProgressSwiper(".main-service-list .service-list .swiper");

        // main
        if (variable.isMain) {

        } else {
          // 关闭pc的KR语言 국제운송 下 특화 서비스轮播图 start
          if(hasPcSwiper.length > 0 && !isInit) {
            destroySwiper(".swiper.swiper-product.pc-swiper");
          }
          // 开启KR语言 국제운송 下 특화 서비스轮播图 end
          initTabSwiper(".tab-area > .swiper");

          initProgressSwiper(".swiper.swiper-product");

          handler.changeSideMenu(false);
        }
      }
    },
    clsoeFloatMenu: function (e) {
      if (!$(e.target).closest(".menu-inner").length) {
        el.$flotMenu.find(".float-open").trigger("click");
      }
    },
    toggleLnb: function (e) {
      e.preventDefault();

      el.$lnbMenu.toggle();
    },
    toggleSearchLayer: function (e) {
      if (e) e.preventDefault();

      var isOpen = !el.$wrap.hasClass('search-open');

      el.$wrap.toggleClass('search-open', isOpen);

      if (isOpen) {
        $(document).on('mousedown.search-layer', function (e) {
          if (
              $(e.target).closest('.search-layer').length === 0 &&
              !$(e.target).hasClass('icon-search')
          ) {
            handler.toggleSearchLayer();
          }
        })
      } else {
        $(document).off('mousedown.search-layer')
      }
    },
    changeSideMenu: function (value) {
      var $sideSub = el.$wrap.find('.aside-menu');
      var $sideSubMenu = $sideSub.find('.aside-sub');

      $sideSub.find('> li > a').aria({
        attrs: ['expanded'],
        value: value
      });

      $sideSubMenu.toggle(value);
    },
    toggleShare: function (e) {
      e.preventDefault();

      var target = $(e.currentTarget);

      if (target.hasClass('btn-share-close')) {
        target = target.closest('.content-sns-box').prevAll('.btn-share');
      }
      target.toggleClass('active');
    }
  };

  /**
   * navigation - top banner swiper
   */
  function initTopBannerSwiper() {
    var $swiper = el.$headerBanner.find(".swiper");

    if (!$swiper.length) return;

    new Swiper($swiper[0], {
      loop: true,
      autoplay: {
        delay: 5000,
      },
    });
  }

  /**
   * navigation
   */
  function initNavigation() {
    // lnb toggle button
    el.$nav.on("click", ".icon-menu", handler.toggleLnb); // mo

    // lnb close button
    el.$nav.on("click", ".m-btn > a.icon-close", handler.toggleLnb); // mo

    // search toggle button
    el.$headerBanner.on("click", ".icon-search", handler.toggleSearchLayer);
    el.$nav.on("click", ".m-btn > a.icon-search", handler.toggleSearchLayer); // mo

    // search close button
    el.$search.on("click", ".btn-popup-close", handler.toggleSearchLayer);
    el.$search.on("click", ".m-btn > a.icon-close", handler.toggleSearchLayer); // mo


    // float menu
    el.$flotMenu.on("click", ".float-open", function (e) {
      e.preventDefault();

      el.$flotMenu.toggleClass("open");

      if (el.$flotMenu.hasClass("open")) {
        el.$doc.on("click.floatmenu", handler.clsoeFloatMenu);
        setTimeout(function () {
          el.$flotMenu.addClass("in");
        }, 50);
      } else {
        el.$doc.off("click.floatmenu", handler.clsoeFloatMenu);
        el.$flotMenu.removeClass("in");
      }
    });

    el.$flotMenu.on("click", ".top", function (e) {
      e.preventDefault();

      $("html, body").animate({ scrollTop: 0 }, { duration: 100 });
    });
  }

  /**
   * initial swiper
   */
  function initSwiper() {
    if (variable.isMain) {
      initMainVisualSwiper();
    } else {
      initNewsContSwiper();
    }

    initTopBannerSwiper();
  }

  /********************************************************************************************/
  /******************************************* main *******************************************/
  /********************************************************************************************/

  /**
   * main - key visual
   */
  function initMainVisualSwiper() {
    var $swiper = el.$wrap.find(".main-keyvisual");

    if (!$swiper.length) return;

    var effect = $swiper.data("swiper-effect") || "fade";
    var speed = $swiper.data("swiper-speed") || 400;

    new Swiper($swiper[0], {
      loop: true,
      autoplay: true,
      speed: speed,
      effect: effect,
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        bulletClass: "square-dot",
        bulletActiveClass: "active",
        clickable: true,
        renderBullet: function (index, className) {
          return '<button type="button" class="' + className + '"></button>';
        },
      },
    });
  }

  /********************************************************************************************/
  /*************************************** accordion ******************************************/
  /********************************************************************************************/

  function initAccordion() {
    var $acco =  el.$wrap.find('.accordion')

    $acco.on('click', '.accordion-btn', function (e) {
      var target = $(e.currentTarget);
      var cont = target.next('.accordion-cont');

      if (target.attr('aria-selected') === 'true') {
        // close
        target.aria({
          attrs: ['selected', 'expanded'],
          value: false
        });

        cont.aria({
          attrs: ['hidden']
        })
      } else {
        // open
        target.aria({
          attrs: ['selected', 'expanded'],
          parent: 'div.accordion-wrap'
        });

        cont.aria({
          attrs: ['hidden'],
          parent: 'div.accordion-wrap',
          value: false
        })
      }
    });
  }


  /********************************************************************************************/
  /***************************************** tootip *******************************************/
  /********************************************************************************************/

  function initTootip() {
    var $tooltip =  el.$wrap.find('.tooltipItem');
    var $tooltipCon = el.$wrap.find('.tooltipCont');

    $tooltip.on('click', '.btnTooltip', function (e) {
      var target = $(e.currentTarget);
      var cont = target.next('.tooltipCont');

      cont.toggleClass('active');

      if ($tooltipCon.not(':hidden').length > 0) {
        el.$doc.off('mousedown.tooltip').on('mousedown.tooltip', function (e) {
          var target = $(e.target);

          if (!!target.closest('.tooltipCont').length) return;
          if (target.is('.btnTooltip') && target.next('.tooltipCont').hasClass('active')) return;

          el.$doc.off('mousedown.tooltip');

          $tooltipCon.not(':hidden').removeClass('active');
        })
      }
    });
  }

  /********************************************************************************************/
  /***************************************** request ******************************************/
  /********************************************************************************************/

  function initRequest() {
    var $reqCon = el.$wrap.find('.estimate-module-wrap');
    var $selectElms = $reqCon.find('.frm-wrap.frm-freight .item').eq(0).siblings('.item')
    var $radioCont = $reqCon.find('.boxItem .form-con');

    // radio tab
    $reqCon.on('change', '.transport-type input[type="radio"]', changeTransportType);

    // radio [FCL | LCL]
    $radioCont.on('change', 'input[type="radio"]', checkSelect);

    // tab handler
    function changeTransportType() {
      var target = $('.transport-type input[type="radio"]:checked');

      $radioCont.toggle(target.val() === 'VS');

      checkSelect();
    }

    changeTransportType();

    // change [FCL | LCL]
    function checkSelect() {
      var tabValue = $reqCon.find('.transport-type input[type="radio"]:checked').val();
      var radioValue = $radioCont.find('input[type="radio"]:checked').attr('id');

      $selectElms.hide();
      if (tabValue === 'VS') {
        if (radioValue === 'type-fcl') {
          $selectElms.eq(0).show();
        } else if (radioValue === 'type-lcl') {
          $selectElms.eq(1).show();
        }
      }else if(tabValue === 'AR' || tabValue === 'EXP'){
        $selectElms.eq(2).show();
      }else if(tabValue === 'RL'){
        $selectElms.eq(0).show();
      } else {
        $selectElms.last().show();
      }

      resetQuoteInput();
    }

    // open country list
    $reqCon.on('click', '.country-select-btn', function (e) {
      $reqCon.find('.head-country-select').toggleClass('active');
    })

    // close country list
    $reqCon.on('click', '.btn-popup-close', function (e) {
      $reqCon.find('.head-country-select').removeClass('active');
    })

    // click country list
    $reqCon.on('click', '.head-country-list > li > a', function (e) {
      e.preventDefault();

      var target = $(e.currentTarget);

      // siblings li remove .current
      target.addClass('current').closest('li').siblings('li').find('a.current').removeClass('current');
      $('#nationCd').val(target.attr('value'));
      if(target.attr('value') === 'KR' || target.attr('value') === 'CN'){
        //Setting KR/CN express departure
        $.cookie('defaultExpVal', $(target.children()[1]).text() + "(" + target.attr('value') + ")");
      }
      var countryName = target.find('> p').text();
      var countryImgSrc = target.find('img').attr('src');
      var countryImgAlt = target.find('img').attr('alt');
      var $listCont = $reqCon.find('.head-country-select');
      var $selectedArea = $($.fn);

      if ($reqCon.find('.country').length > 1) {
        // not kr
        $selectedArea = $reqCon.find('.country').eq(1);
      } else {
        // kr
        $selectedArea = $reqCon.find('.country');
      }

      $reqCon.find('.country').hide();

      // close list
      $listCont.removeClass('active');

      // apply country
      $selectedArea.find('> em').text(countryName);
      $selectedArea.find('> img').attr({
        src: countryImgSrc,
        alt: countryImgAlt
      });
      $selectedArea.show();
      getTransModeByNationCdAjax(target.attr('value'));
    });

    // reset country // only not kr
    $reqCon.on('click', '.country .btn-popup-close', function () {
      $reqCon.find('.country').hide().eq(0).show();
    });

    // maketing agreement
    var $personalInfoWrap = $('.personal-info-wrap');

    $personalInfoWrap.each(function () {
      var $cont = $(this);
      var $maketingGroup = $cont.find('.maketing-btn-wrap');

      $maketingGroup.on('change.cqui', '> .check-box input[type="checkbox"]', function (e) {
        var target = $(e.currentTarget);
        var $subCheckBox = $maketingGroup.find('.agree-form-box input[type="checkbox"]');

        $subCheckBox.prop('checked', target.is(':checked'));
      })

      $maketingGroup.on('change.cqui', '.agree-form-box input[type="checkbox"]', function (e) {
        var $subCheckBox = $maketingGroup.find('.agree-form-box input[type="checkbox"]');
        var isAllChecked = $subCheckBox.filter(':checked').length === $subCheckBox.length;

        $maketingGroup.find('> .check-box input[type="checkbox"]').prop('checked', isAllChecked);
      })
    })
  }


  /********************************************************************************************/
  /************************************ search result page ************************************/
  /********************************************************************************************/

  function initSeachResult() {
    var $sideMenu = el.$wrap.find('.aside-menu');
    var $sideSubMenu = $sideMenu.find('.aside-sub');

    $sideMenu.on('click', '> li > a', function (e) {
      if (!variable.isMobile) return;

      e.preventDefault();

      var target = $(e.currentTarget);

      handler.changeSideMenu(target.attr('aria-expanded') !== 'true');
    });

    $sideSubMenu.on('click', 'a', function () {
      if (!variable.isMobile) return;

      handler.changeSideMenu(false);
    });
  }


  /********************************************************************************************/
  /************************************** transportation page *********************************/
  /********************************************************************************************/

  function initTransportation() {
    var $introList = el.$wrap.find('.transport-content .intro-list');
    var $serviceList = el.$wrap.find('.transport-content .service-list');

    $introList.on('click', 'li button', function (e) {
      var target = $(e.currentTarget);

      target.closest('li').toggleClass('active');
    });

    $serviceList.on('click', '.service-item button', function (e) {
      var target = $(e.currentTarget);

      target.closest('.service-item').toggleClass('active');
    });
  }

  /********************************************************************************************/
  /***************************************** network page *************************************/
  /********************************************************************************************/

  function initNetwork() {
    // accordion address
    var $networkCon = el.$wrap.find('div.new-content.network');

    $networkCon.on('click', '.btn-address', function (e) {
      var target = $(e.currentTarget);
      var cont = target.closest('tr').next('tr').find('.address');

      target.toggleClass('active', !target.hasClass('active'));
      cont.toggleClass('active', target.hasClass('active'))
    });

    // network tab menu
    var $networkTab = el.$wrap.find('.network-content.mo-show');

    $networkTab.on('click', 'li > a', function (e) {
      e.preventDefault();

      var target = $(e.currentTarget);
      var cont = $networkTab.find('table.tbl-network');

      target.closest('li').siblings().find('> a').removeClass('active');
      target.toggleClass('active', !target.hasClass('active'));

      var id = target.attr('href').substr(1);
      cont.hide().prev('a').filter('[name="'+id+'"]').next().show();
    });

    // $networkTab.find('li > a').eq(0).trigger('click');
  }

  /********************************************************************************************/
  /***************************************** news page ****************************************/
  /********************************************************************************************/

  /**
   * news - top content swiper
   */
  function initNewsContSwiper() {
    var $swiper = el.$wrap.find(".new-content .swiper");
    var $contoller = el.$wrap.find('.new-content .swiper-controller .swiper-pagination');

    if (!$swiper.length) return;
    if (!$contoller.length) return;

    new Swiper($swiper[0], {
      loop: true,
      autoplay: {
        delay: 5000,
      },
      pagination: {
        el: $contoller.get(0),
        type: "bullets",
        bulletClass: "square-dot",
        bulletActiveClass: "active",
        clickable: true,
        renderBullet: function (index, className) {
          return '<button type="button" class="' + className + '"></button>';
        },
      },
      navigation: {
        nextEl: ".icon-arr-R",
        prevEl: ".icon-arr-L",
      },
    });

    $swiper.on('click', '.swiper-slide a[href^="#"]', function (e) {
      const popId = $(e.currentTarget).attr('href');

      if ($(popId).getInstance()) {
        $(popId).getInstance().open({ btn: e.currentTarget });
      }

      e.preventDefault();
    })
  }

  /**
   * tab swiper
   */
  function initTabSwiper(selector) {
    var $swipers = el.$wrap.find(selector);

    $swipers.each(function (_, el) {
      var $swiper = $(el);
      var $wrapper = $swiper.find('> .swiper-wrapper');

      if (!$wrapper.length) return;

      new Swiper($swiper[0], {
        freeMode: true,
        slidesPerView: "auto",
      });
    });
  }

  /**
   * progress swiper
   */
  function initProgressSwiper(selector) {
    var $swipers = el.$wrap.find(selector);

    $swipers.each(function (_, el) {
      var $swiper = $(el);

      new Swiper($swiper[0], {
        loop: true,
        slidesPerView: 1.15,
        on: {
          slideChange: function (swiper) {
            var $progress = $(swiper.el).find(".grey-bar span");
            if (!$progress.length) {
              $progress = $(swiper.el).closest('.service-list').find(".grey-bar span");
            }

            $progress.css(
                "width",
                (100 / swiper.slides.length) * (swiper.realIndex + 1) + "%"
            );
          },
        },
      });
    });
  }

   /**
   * auto play swiper
   */
  function initAutoPlaySwiper() {
     const swiperContainers = document.querySelectorAll(".transport-content .pc-swiper");
      const MIN_SLIDES_FOR_SWIPER = 4;

      swiperContainers.forEach(container => {
          // 0.이미 스와이퍼가 생성되어 있다면 중복 생성 방지
          // if (container.swiper) return;

          // swiper-slide 갯수가 4개 이상일 경우만 진행
          const slideCount = container.querySelectorAll(".swiper-slide").length;
          const isExists = container.classList.contains("less-than-four");
          if(slideCount < MIN_SLIDES_FOR_SWIPER) {
            if(!isExists) {
              container.classList.add("less-than-four");
            }
            return;
          } else {
            if(isExists) {
              container.classList.remove("less-than-four");
            }
          }

          const currentEl = container.querySelector(".current");

          // 1. 스와이퍼 엘리먼트들 찾기
          const totalEl = container.querySelector(".total");

          const pcSwiper = new Swiper(container, {
              slidesPerView: "auto",
              spaceBetween: 24,
              loop: true,
              speed: 400,
              autoplay: {
                  delay: 2700,
                  disableOnInteraction: false
              },
              pagination: {
                  el: container.querySelector(".swiper-pagination"),
                  type: "progressbar"
              },
              navigation: {
                  nextEl: container.querySelector(".swiper-next"),
                  prevEl: container.querySelector(".swiper-prev")
              },
              on: {
                  init: function () {
                      const total = this.slides.filter(slide => !slide.classList.contains("swiper-slide-duplicate")).length;
                      totalEl.textContent = String(total).padStart(2, "0");
                      currentEl.textContent = String(this.realIndex + 1).padStart(2, "0");
                  },
                  slideChange: function () {
                      currentEl.textContent = String(this.realIndex + 1).padStart(2, "0");
                  }
              }
          });

          // 2. 재생/정지 토글 버튼 설정
          const toggleBtn = container.querySelector(".btn-play");
          const hiddenText = toggleBtn?.querySelector(".hidden");

          if (!toggleBtn) return;

          toggleBtn.onclick = function () {
              const isPlay = this.classList.toggle("on");

              if (isPlay) {
                  pcSwiper.autoplay.start();
                  if (hiddenText) hiddenText.textContent = "일시정지";
              } else {
                  pcSwiper.autoplay.stop();
                  if (hiddenText) hiddenText.textContent = "재생";
              }
          };
      });
  }

  // reset swiper
  function resetSwiper(selector) {
    var target = el.$body.find(selector);
    var $swiper = target.hasClass("swiper-initialized")
        ? target
        : target.find(".swiper-initialized");

    $swiper.each(function () {
      //swiper 초기화
      var swiper = $(this)[0].swiper;

      if (swiper !== undefined) {
        swiper.destroy(false, true);
        new Swiper(swiper.container, swiper.params);
      }
    });
  }

  // desotry swiper
  function destroySwiper(selector) {
    var target = el.$body.find(selector);
    var $swiper = target.hasClass("swiper-initialized")
        ? target
        : target.find(".swiper-initialized");

    $swiper.each(function () {
      var swiper = $(this)[0].swiper;

      swiper.destroy(false, true);
    });
  }

  // public
  if (window.cqui) {
    $.extend(window.cqui, {
      init: function () {
        if ($("nav").length > 0) {
          init();
        } else {
          setTimeout(init, 0); // 퍼블용 include 대응용 delay
        }
      },
      resetSwiper: resetSwiper,
      initTermsPopup: function(){
         $('#terms-info-container').find('div[id^="popup_"]').each((idx, item) => {
          new Popup().init(item);
        });
      }
    });
  }
})(window);

/********************************************************************************************/
/****************************************** motion ******************************************/
/********************************************************************************************/

/* motionPath plugin */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t=t||self).window=t.window||{})}(this,function(t){"use strict";function p(t){return"string"==typeof t}function x(t){return Math.round(1e10*t)/1e10||0}function y(t,e,n,r){var a=t[e],o=1===r?6:subdivideSegment(a,n,r);if((o||!r)&&o+n+2<a.length)return t.splice(e,0,a.slice(0,n+o+2)),a.splice(0,n+o),1}function C(t,e){var n=t.length,r=t[n-1]||[],a=r.length;n&&e[0]===r[a-2]&&e[1]===r[a-1]&&(e=r.concat(e.slice(2)),n--),t[n]=e}var M=/[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,T=/(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,L=/[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi,r=/(^[#\.][a-z]|[a-y][a-z])/i,V=Math.PI/180,s=180/Math.PI,F=Math.sin,U=Math.cos,H=Math.abs,$=Math.sqrt,l=Math.atan2,A=1e8,h=function _isNumber(t){return"number"==typeof t},S={},_={},e=1e5,d=function _wrapProgress(t){return Math.round((t+A)%1*e)/e||(t<0?0:1)},N=function _round(t){return Math.round(t*e)/e||0},m=function _getSampleIndex(t,e,n){var r=t.length,a=~~(n*r);if(t[a]>e){for(;--a&&t[a]>e;);a<0&&(a=0)}else for(;t[++a]<e&&a<r;);return a<r?a:r-1},O=function _copyMetaData(t,e){return e.totalLength=t.totalLength,t.samples?(e.samples=t.samples.slice(0),e.lookup=t.lookup.slice(0),e.minLength=t.minLength,e.resolution=t.resolution):t.totalPoints&&(e.totalPoints=t.totalPoints),e};function getRawPath(t){var e,n=(t=p(t)&&r.test(t)&&document.querySelector(t)||t).getAttribute?t:0;return n&&(t=t.getAttribute("d"))?(n._gsPath||(n._gsPath={}),(e=n._gsPath[t])&&!e._dirty?e:n._gsPath[t]=stringToRawPath(t)):t?p(t)?stringToRawPath(t):h(t[0])?[t]:t:console.warn("Expecting a <path> element or an SVG path data string")}function reverseSegment(t){var e,n=0;for(t.reverse();n<t.length;n+=2)e=t[n],t[n]=t[n+1],t[n+1]=e;t.reversed=!t.reversed}var B={rect:"rx,ry,x,y,width,height",circle:"r,cx,cy",ellipse:"rx,ry,cx,cy",line:"x1,x2,y1,y2"};function convertToPath(t,e){var n,r,a,o,i,s,l,h,u,f,g,c,p,d,m,v,y,x,w,P,b,M,R=t.tagName.toLowerCase(),L=.552284749831;return"path"!==R&&t.getBBox?(s=function _createPath(t,e){var n,r=document.createElementNS("http://www.w3.org/2000/svg","path"),a=[].slice.call(t.attributes),o=a.length;for(e=","+e+",";-1<--o;)n=a[o].nodeName.toLowerCase(),e.indexOf(","+n+",")<0&&r.setAttributeNS(null,n,a[o].nodeValue);return r}(t,"x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"),M=function _attrToObj(t,e){for(var n=e?e.split(","):[],r={},a=n.length;-1<--a;)r[n[a]]=+t.getAttribute(n[a])||0;return r}(t,B[R]),"rect"===R?(o=M.rx,i=M.ry||o,r=M.x,a=M.y,f=M.width-2*o,g=M.height-2*i,n=o||i?"M"+(v=(d=(p=r+o)+f)+o)+","+(x=a+i)+" V"+(w=x+g)+" C"+[v,P=w+i*L,m=d+o*L,b=w+i,d,b,d-(d-p)/3,b,p+(d-p)/3,b,p,b,c=r+o*(1-L),b,r,P,r,w,r,w-(w-x)/3,r,x+(w-x)/3,r,x,r,y=a+i*(1-L),c,a,p,a,p+(d-p)/3,a,d-(d-p)/3,a,d,a,m,a,v,y,v,x].join(",")+"z":"M"+(r+f)+","+a+" v"+g+" h"+-f+" v"+-g+" h"+f+"z"):"circle"===R||"ellipse"===R?(h="circle"===R?(o=i=M.r)*L:(o=M.rx,(i=M.ry)*L),n="M"+((r=M.cx)+o)+","+(a=M.cy)+" C"+[r+o,a+h,r+(l=o*L),a+i,r,a+i,r-l,a+i,r-o,a+h,r-o,a,r-o,a-h,r-l,a-i,r,a-i,r+l,a-i,r+o,a-h,r+o,a].join(",")+"z"):"line"===R?n="M"+M.x1+","+M.y1+" L"+M.x2+","+M.y2:"polyline"!==R&&"polygon"!==R||(n="M"+(r=(u=(t.getAttribute("points")+"").match(T)||[]).shift())+","+(a=u.shift())+" L"+u.join(","),"polygon"===R&&(n+=","+r+","+a+"z")),s.setAttribute("d",rawPathToString(s._gsRawPath=stringToRawPath(n))),e&&t.parentNode&&(t.parentNode.insertBefore(s,t),t.parentNode.removeChild(t)),s):t}function getRotationAtBezierT(t,e,n){var r,a=t[e],o=t[e+2],i=t[e+4];return a+=(o-a)*n,a+=((o+=(i-o)*n)-a)*n,r=o+(i+(t[e+6]-i)*n-o)*n-a,a=t[e+1],a+=((o=t[e+3])-a)*n,a+=((o+=((i=t[e+5])-o)*n)-a)*n,N(l(o+(i+(t[e+7]-i)*n-o)*n-a,r)*s)}function sliceRawPath(t,e,n){n=function _isUndefined(t){return void 0===t}(n)?1:x(n)||0,e=x(e)||0;var r=Math.max(0,~~(H(n-e)-1e-8)),a=function copyRawPath(t){for(var e=[],n=0;n<t.length;n++)e[n]=O(t[n],t[n].slice(0));return O(t,e)}(t);if(n<e&&(e=1-e,n=1-n,function _reverseRawPath(t,e){var n=t.length;for(e||t.reverse();n--;)t[n].reversed||reverseSegment(t[n])}(a),a.totalLength=0),e<0||n<0){var o=Math.abs(~~Math.min(e,n))+1;e+=o,n+=o}a.totalLength||cacheRawPathMeasurements(a);var i,s,l,h,u,f,g,c,p=1<n,d=getProgressData(a,e,S,!0),m=getProgressData(a,n,_),v=m.segment,w=d.segment,P=m.segIndex,b=d.segIndex,M=m.i,R=d.i,L=b===P,T=M===R&&L;if(p||r){for(i=P<b||L&&M<R||T&&m.t<d.t,y(a,b,R,d.t)&&(b++,i||(P++,T?(m.t=(m.t-d.t)/(1-d.t),M=0):L&&(M-=R))),Math.abs(1-(n-e))<1e-5?P=b-1:!m.t&&P?P--:y(a,P,M,m.t)&&i&&b++,1===d.t&&(b=(b+1)%a.length),u=[],g=1+(f=a.length)*r,g+=(f-(c=b)+P)%f,h=0;h<g;h++)C(u,a[c++%f]);a=u}else if(l=1===m.t?6:subdivideSegment(v,M,m.t),e!==n)for(s=subdivideSegment(w,R,T?d.t/m.t:d.t),L&&(l+=s),v.splice(M+l+2),(s||R)&&w.splice(0,R+s),h=a.length;h--;)(h<b||P<h)&&a.splice(h,1);else v.angle=getRotationAtBezierT(v,M+l,0),d=v[M+=l],m=v[M+1],v.length=v.totalLength=0,v.totalPoints=a.totalPoints=8,v.push(d,m,d,m,d,m,d,m);return a.totalLength=0,a}function measureSegment(t,e,n){e=e||0,t.samples||(t.samples=[],t.lookup=[]);var r,a,o,i,s,l,h,u,f,g,c,p,d,m,v,y,x,w=~~t.resolution||12,P=1/w,b=n?e+6*n+1:t.length,M=t[e],R=t[e+1],L=e?e/6*w:0,T=t.samples,C=t.lookup,S=(e?t.minLength:A)||A,_=T[L+n*w-1],N=e?T[L-1]:0;for(T.length=C.length=0,a=e+2;a<b;a+=6){if(o=t[a+4]-M,i=t[a+2]-M,s=t[a]-M,u=t[a+5]-R,f=t[a+3]-R,g=t[a+1]-R,l=h=c=p=0,H(o)<.01&&H(u)<.01&&H(s)+H(g)<.01)8<t.length&&(t.splice(a,6),a-=6,b-=6);else for(r=1;r<=w;r++)l=h-(h=((m=P*r)*m*o+3*(d=1-m)*(m*i+d*s))*m),c=p-(p=(m*m*u+3*d*(m*f+d*g))*m),(y=$(c*c+l*l))<S&&(S=y),N+=y,T[L++]=N;M+=o,R+=u}if(_)for(_-=N;L<T.length;L++)T[L]+=_;if(T.length&&S){if(t.totalLength=x=T[T.length-1]||0,x/(t.minLength=S)<9999)for(y=v=0,r=0;r<x;r+=S)C[y++]=T[v]<r?++v:v}else t.totalLength=T[0]=0;return e?N-T[e/2-1]:N}function cacheRawPathMeasurements(t,e){var n,r,a;for(a=n=r=0;a<t.length;a++)t[a].resolution=~~e||12,r+=t[a].length,n+=measureSegment(t[a]);return t.totalPoints=r,t.totalLength=n,t}function subdivideSegment(t,e,n){if(n<=0||1<=n)return 0;var r=t[e],a=t[e+1],o=t[e+2],i=t[e+3],s=t[e+4],l=t[e+5],h=r+(o-r)*n,u=o+(s-o)*n,f=a+(i-a)*n,g=i+(l-i)*n,c=h+(u-h)*n,p=f+(g-f)*n,d=s+(t[e+6]-s)*n,m=l+(t[e+7]-l)*n;return u+=(d-u)*n,g+=(m-g)*n,t.splice(e+2,4,N(h),N(f),N(c),N(p),N(c+(u-c)*n),N(p+(g-p)*n),N(u),N(g),N(d),N(m)),t.samples&&t.samples.splice(e/6*t.resolution|0,0,0,0,0,0,0,0),6}function getProgressData(t,e,n,r){n=n||{},t.totalLength||cacheRawPathMeasurements(t),(e<0||1<e)&&(e=d(e));var a,o,i,s,l,h,u,f=0,g=t[0];if(e)if(1===e)u=1,h=(g=t[f=t.length-1]).length-8;else{if(1<t.length){for(i=t.totalLength*e,l=h=0;(l+=t[h++].totalLength)<i;)f=h;e=(i-(s=l-(g=t[f]).totalLength))/(l-s)||0}a=g.samples,o=g.resolution,i=g.totalLength*e,s=(h=g.lookup.length?g.lookup[~~(i/g.minLength)]||0:m(a,i,e))?a[h-1]:0,(l=a[h])<i&&(s=l,l=a[++h]),u=1/o*((i-s)/(l-s)+h%o),h=6*~~(h/o),r&&1===u&&(h+6<g.length?(h+=6,u=0):f+1<t.length&&(h=u=0,g=t[++f]))}else u=h=f=0,g=t[0];return n.t=u,n.i=h,n.path=t,n.segment=g,n.segIndex=f,n}function getPositionOnPath(t,e,n,r){var a,o,i,s,l,h,u,f,g,c=t[0],p=r||{};if((e<0||1<e)&&(e=d(e)),c.lookup||cacheRawPathMeasurements(t),1<t.length){for(i=t.totalLength*e,l=h=0;(l+=t[h++].totalLength)<i;)c=t[h];e=(i-(s=l-c.totalLength))/(l-s)||0}return a=c.samples,o=c.resolution,i=c.totalLength*e,s=(h=c.lookup.length?c.lookup[e<1?~~(i/c.minLength):c.lookup.length-1]||0:m(a,i,e))?a[h-1]:0,(l=a[h])<i&&(s=l,l=a[++h]),g=1-(u=1/o*((i-s)/(l-s)+h%o)||0),f=c[h=6*~~(h/o)],p.x=N((u*u*(c[h+6]-f)+3*g*(u*(c[h+4]-f)+g*(c[h+2]-f)))*u+f),p.y=N((u*u*(c[h+7]-(f=c[h+1]))+3*g*(u*(c[h+5]-f)+g*(c[h+3]-f)))*u+f),n&&(p.angle=c.totalLength?getRotationAtBezierT(c,h,1<=u?1-1e-9:u||1e-9):c.angle||0),p}function transformRawPath(t,e,n,r,a,o,i){for(var s,l,h,u,f,g=t.length;-1<--g;)for(l=(s=t[g]).length,h=0;h<l;h+=2)u=s[h],f=s[h+1],s[h]=u*e+f*r+o,s[h+1]=u*n+f*a+i;return t._dirty=1,t}function arcToSegment(t,e,n,r,a,o,i,s,l){if(t!==s||e!==l){n=H(n),r=H(r);var h=a%360*V,u=U(h),f=F(h),g=Math.PI,c=2*g,p=(t-s)/2,d=(e-l)/2,m=u*p+f*d,v=-f*p+u*d,y=m*m,x=v*v,w=y/(n*n)+x/(r*r);1<w&&(n=$(w)*n,r=$(w)*r);var P=n*n,b=r*r,M=(P*b-P*x-b*y)/(P*x+b*y);M<0&&(M=0);var R=(o===i?-1:1)*$(M),L=n*v/r*R,T=-r*m/n*R,C=u*L-f*T+(t+s)/2,S=f*L+u*T+(e+l)/2,_=(m-L)/n,N=(v-T)/r,A=(-m-L)/n,O=(-v-T)/r,B=_*_+N*N,E=(N<0?-1:1)*Math.acos(_/$(B)),I=(_*O-N*A<0?-1:1)*Math.acos((_*A+N*O)/$(B*(A*A+O*O)));isNaN(I)&&(I=g),!i&&0<I?I-=c:i&&I<0&&(I+=c),E%=c,I%=c;var D,X=Math.ceil(H(I)/(c/4)),k=[],z=I/X,G=4/3*F(z/2)/(1+U(z/2)),Z=u*n,q=f*n,Y=f*-r,j=u*r;for(D=0;D<X;D++)m=U(a=E+D*z),v=F(a),_=U(a+=z),N=F(a),k.push(m-G*v,v+G*m,_+G*N,N-G*_,_,N);for(D=0;D<k.length;D+=2)m=k[D],v=k[D+1],k[D]=m*Z+v*Y+C,k[D+1]=m*q+v*j+S;return k[D-2]=s,k[D-1]=l,k}}function stringToRawPath(t){function Cf(t,e,n,r){u=(n-t)/3,f=(r-e)/3,s.push(t+u,e+f,n-u,r-f,n,r)}var e,n,r,a,o,i,s,l,h,u,f,g,c,p,d,m=(t+"").replace(L,function(t){var e=+t;return e<1e-4&&-1e-4<e?0:e}).match(M)||[],v=[],y=0,x=0,w=m.length,P=0,b="ERROR: malformed path: "+t;if(!t||!isNaN(m[0])||isNaN(m[1]))return console.log(b),v;for(e=0;e<w;e++)if(c=o,isNaN(m[e])?i=(o=m[e].toUpperCase())!==m[e]:e--,r=+m[e+1],a=+m[e+2],i&&(r+=y,a+=x),e||(l=r,h=a),"M"===o)s&&(s.length<8?--v.length:P+=s.length),y=l=r,x=h=a,s=[r,a],v.push(s),e+=2,o="L";else if("C"===o)i||(y=x=0),(s=s||[0,0]).push(r,a,y+1*m[e+3],x+1*m[e+4],y+=1*m[e+5],x+=1*m[e+6]),e+=6;else if("S"===o)u=y,f=x,"C"!==c&&"S"!==c||(u+=y-s[s.length-4],f+=x-s[s.length-3]),i||(y=x=0),s.push(u,f,r,a,y+=1*m[e+3],x+=1*m[e+4]),e+=4;else if("Q"===o)u=y+2/3*(r-y),f=x+2/3*(a-x),i||(y=x=0),y+=1*m[e+3],x+=1*m[e+4],s.push(u,f,y+2/3*(r-y),x+2/3*(a-x),y,x),e+=4;else if("T"===o)u=y-s[s.length-4],f=x-s[s.length-3],s.push(y+u,x+f,r+2/3*(y+1.5*u-r),a+2/3*(x+1.5*f-a),y=r,x=a),e+=2;else if("H"===o)Cf(y,x,y=r,x),e+=1;else if("V"===o)Cf(y,x,y,x=r+(i?x-y:0)),e+=1;else if("L"===o||"Z"===o)"Z"===o&&(r=l,a=h,s.closed=!0),("L"===o||.5<H(y-r)||.5<H(x-a))&&(Cf(y,x,r,a),"L"===o&&(e+=2)),y=r,x=a;else if("A"===o){if(p=m[e+4],d=m[e+5],u=m[e+6],f=m[e+7],n=7,1<p.length&&(p.length<3?(f=u,u=d,n--):(f=d,u=p.substr(2),n-=2),d=p.charAt(1),p=p.charAt(0)),g=arcToSegment(y,x,+m[e+1],+m[e+2],+m[e+3],+p,+d,(i?y:0)+1*u,(i?x:0)+1*f),e+=n,g)for(n=0;n<g.length;n++)s.push(g[n]);y=s[s.length-2],x=s[s.length-1]}else console.log(b);return(e=s.length)<6?(v.pop(),e=0):s[0]===s[e-2]&&s[1]===s[e-1]&&(s.closed=!0),v.totalPoints=P+e,v}function flatPointsToSegment(t,e){void 0===e&&(e=1);for(var n=t[0],r=0,a=[n,r],o=2;o<t.length;o+=2)a.push(n,r,t[o],r=(t[o]-n)*e/2,n=t[o],-r);return a}function pointsToSegment(t,e){H(t[0]-t[2])<1e-4&&H(t[1]-t[3])<1e-4&&(t=t.slice(2));var n,r,a,o,i,s,l,h,u,f,g,c,p,d,m=t.length-2,v=+t[0],y=+t[1],x=+t[2],w=+t[3],P=[v,y,v,y],b=x-v,M=w-y,R=Math.abs(t[m]-v)<.001&&Math.abs(t[m+1]-y)<.001;for(R&&(t.push(x,w),x=v,w=y,v=t[m-2],y=t[m-1],t.unshift(v,y),m+=4),e=e||0===e?+e:1,a=2;a<m;a+=2)n=v,r=y,v=x,y=w,x=+t[a+2],w=+t[a+3],v===x&&y===w||(o=b,i=M,b=x-v,M=w-y,h=((s=$(o*o+i*i))+(l=$(b*b+M*M)))*e*.25/$(Math.pow(b/l+o/s,2)+Math.pow(M/l+i/s,2)),g=v-((u=v-(v-n)*(s?h/s:0))+(((f=v+(x-v)*(l?h/l:0))-u)*(3*s/(s+l)+.5)/4||0)),d=y-((c=y-(y-r)*(s?h/s:0))+(((p=y+(w-y)*(l?h/l:0))-c)*(3*s/(s+l)+.5)/4||0)),v===n&&y===r||P.push(N(u+g),N(c+d),N(v),N(y),N(f+g),N(p+d)));return v!==x||y!==w||P.length<4?P.push(N(x),N(w),N(x),N(w)):P.length-=2,2===P.length?P.push(v,y,v,y,v,y):R&&(P.splice(0,6),P.length=P.length-6),P}function rawPathToString(t){h(t[0])&&(t=[t]);var e,n,r,a,o="",i=t.length;for(n=0;n<i;n++){for(a=t[n],o+="M"+N(a[0])+","+N(a[1])+" C",e=a.length,r=2;r<e;r++)o+=N(a[r++])+","+N(a[r++])+" "+N(a[r++])+","+N(a[r++])+" "+N(a[r++])+","+N(a[r])+" ";a.closed&&(o+="z")}return o}function R(t){var e=t.ownerDocument||t;!(k in t.style)&&"msTransform"in t.style&&(z=(k="msTransform")+"Origin");for(;e.parentNode&&(e=e.parentNode););if(v=window,E=new Y,e){w=(c=e).documentElement,P=e.body,(I=c.createElementNS("http://www.w3.org/2000/svg","g")).style.transform="none";var n=e.createElement("div"),r=e.createElement("div"),a=e&&(e.body||e.firstElementChild);a&&a.appendChild&&(a.appendChild(n),n.appendChild(r),n.setAttribute("style","position:static;transform:translate3d(0,0,1px)"),D=r.offsetParent!==n,a.removeChild(n))}return e}function X(t){return t.ownerSVGElement||("svg"===(t.tagName+"").toLowerCase()?t:null)}function Z(t,e){if(t.parentNode&&(c||R(t))){var n=X(t),r=n?n.getAttribute("xmlns")||"http://www.w3.org/2000/svg":"http://www.w3.org/1999/xhtml",a=n?e?"rect":"g":"div",o=2!==e?0:100,i=3===e?100:0,s="position:absolute;display:block;pointer-events:none;margin:0;padding:0;",l=c.createElementNS?c.createElementNS(r.replace(/^https/,"http"),a):c.createElement(a);return e&&(n?(b=b||Z(t),l.setAttribute("width",.01),l.setAttribute("height",.01),l.setAttribute("transform","translate("+o+","+i+")"),b.appendChild(l)):(g||((g=Z(t)).style.cssText=s),l.style.cssText=s+"width:0.1px;height:0.1px;top:"+i+"px;left:"+o+"px",g.appendChild(l))),l}throw"Need document and parent."}function aa(t,e){var n,r,a,o,i,s,l=X(t),h=t===l,u=l?G:q,f=t.parentNode;if(t===v)return t;if(u.length||u.push(Z(t,1),Z(t,2),Z(t,3)),n=l?b:g,l)h?(o=-(a=function _getCTM(t){var e,n=t.getCTM();return n||(e=t.style[k],t.style[k]="none",t.appendChild(I),n=I.getCTM(),t.removeChild(I),e?t.style[k]=e:t.style.removeProperty(k.replace(/([A-Z])/g,"-$1").toLowerCase())),n||E.clone()}(t)).e/a.a,i=-a.f/a.d,r=E):t.getBBox?(a=t.getBBox(),o=(r=(r=t.transform?t.transform.baseVal:{}).numberOfItems?1<r.numberOfItems?function _consolidate(t){for(var e=new Y,n=0;n<t.numberOfItems;n++)e.multiply(t.getItem(n).matrix);return e}(r):r.getItem(0).matrix:E).a*a.x+r.c*a.y,i=r.b*a.x+r.d*a.y):(r=new Y,o=i=0),e&&"g"===t.tagName.toLowerCase()&&(o=i=0),(h?l:f).appendChild(n),n.setAttribute("transform","matrix("+r.a+","+r.b+","+r.c+","+r.d+","+(r.e+o)+","+(r.f+i)+")");else{if(o=i=0,D)for(r=t.offsetParent,a=t;(a=a&&a.parentNode)&&a!==r&&a.parentNode;)4<(v.getComputedStyle(a)[k]+"").length&&(o=a.offsetLeft,i=a.offsetTop,a=0);if("absolute"!==(s=v.getComputedStyle(t)).position&&"fixed"!==s.position)for(r=t.offsetParent;f&&f!==r;)o+=f.scrollLeft||0,i+=f.scrollTop||0,f=f.parentNode;(a=n.style).top=t.offsetTop-i+"px",a.left=t.offsetLeft-o+"px",a[k]=s[k],a[z]=s[z],a.position="fixed"===s.position?"fixed":"absolute",t.parentNode.appendChild(n)}return n}function ba(t,e,n,r,a,o,i){return t.a=e,t.b=n,t.c=r,t.d=a,t.e=o,t.f=i,t}var c,v,w,P,g,b,E,I,D,n,k="transform",z=k+"Origin",G=[],q=[],Y=((n=Matrix2D.prototype).inverse=function inverse(){var t=this.a,e=this.b,n=this.c,r=this.d,a=this.e,o=this.f,i=t*r-e*n||1e-10;return ba(this,r/i,-e/i,-n/i,t/i,(n*o-r*a)/i,-(t*o-e*a)/i)},n.multiply=function multiply(t){var e=this.a,n=this.b,r=this.c,a=this.d,o=this.e,i=this.f,s=t.a,l=t.c,h=t.b,u=t.d,f=t.e,g=t.f;return ba(this,s*e+h*r,s*n+h*a,l*e+u*r,l*n+u*a,o+f*e+g*r,i+f*n+g*a)},n.clone=function clone(){return new Matrix2D(this.a,this.b,this.c,this.d,this.e,this.f)},n.equals=function equals(t){var e=this.a,n=this.b,r=this.c,a=this.d,o=this.e,i=this.f;return e===t.a&&n===t.b&&r===t.c&&a===t.d&&o===t.e&&i===t.f},n.apply=function apply(t,e){void 0===e&&(e={});var n=t.x,r=t.y,a=this.a,o=this.b,i=this.c,s=this.d,l=this.e,h=this.f;return e.x=n*a+r*i+l||0,e.y=n*o+r*s+h||0,e},Matrix2D);function Matrix2D(t,e,n,r,a,o){void 0===t&&(t=1),void 0===e&&(e=0),void 0===n&&(n=0),void 0===r&&(r=1),void 0===a&&(a=0),void 0===o&&(o=0),ba(this,t,e,n,r,a,o)}function getGlobalMatrix(t,e,n,r){if(!t||!t.parentNode||(c||R(t)).documentElement===t)return new Y;var a=function _forceNonZeroScale(t){for(var e,n;t&&t!==P;)(n=t._gsap)&&n.uncache&&n.get(t,"x"),n&&!n.scaleX&&!n.scaleY&&n.renderTransform&&(n.scaleX=n.scaleY=1e-4,n.renderTransform(1,n),e?e.push(n):e=[n]),t=t.parentNode;return e}(t),o=X(t)?G:q,i=aa(t,n),s=o[0].getBoundingClientRect(),l=o[1].getBoundingClientRect(),h=o[2].getBoundingClientRect(),u=i.parentNode,f=!r&&function _isFixed(t){return"fixed"===v.getComputedStyle(t).position||((t=t.parentNode)&&1===t.nodeType?_isFixed(t):void 0)}(t),g=new Y((l.left-s.left)/100,(l.top-s.top)/100,(h.left-s.left)/100,(h.top-s.top)/100,s.left+(f?0:function _getDocScrollLeft(){return v.pageXOffset||c.scrollLeft||w.scrollLeft||P.scrollLeft||0}()),s.top+(f?0:function _getDocScrollTop(){return v.pageYOffset||c.scrollTop||w.scrollTop||P.scrollTop||0}()));if(u.removeChild(i),a)for(s=a.length;s--;)(l=a[s]).scaleX=l.scaleY=0,l.renderTransform(1,l);return e?g.inverse():g}function na(t,e,n,r){for(var a=e.length,o=2===r?0:r,i=0;i<a;i++)t[o]=parseFloat(e[i][n]),2===r&&(t[o+1]=0),o+=2;return t}function oa(t,e,n){return parseFloat(t._gsap.get(t,e,n||"px"))||0}function pa(t){var e,n=t[0],r=t[1];for(e=2;e<t.length;e+=2)n=t[e]+=n,r=t[e+1]+=r}function qa(t,e,n,r,a,o,i,s,l){return e="cubic"===i.type?[e]:(!1!==i.fromCurrent&&e.unshift(oa(n,r,s),a?oa(n,a,l):0),i.relative&&pa(e),[(a?pointsToSegment:flatPointsToSegment)(e,i.curviness)]),e=o(nt(e,n,i)),rt(t,n,r,e,"x",s),a&&rt(t,n,a,e,"y",l),cacheRawPathMeasurements(e,i.resolution||(0===i.curviness?20:12))}function ra(t){return t}function ta(t,e,n){var r,a=getGlobalMatrix(t),o=0,i=0;return"svg"===(t.tagName+"").toLowerCase()?(r=t.viewBox.baseVal).width||(r={width:+t.getAttribute("width"),height:+t.getAttribute("height")}):r=e&&t.getBBox&&t.getBBox(),e&&"auto"!==e&&(o=e.push?e[0]*(r?r.width:t.offsetWidth||0):e.x,i=e.push?e[1]*(r?r.height:t.offsetHeight||0):e.y),n.apply(o||i?a.apply({x:o,y:i}):{x:a.e,y:a.f})}function ua(t,e,n,r){var a,o=getGlobalMatrix(t.parentNode,!0,!0),i=o.clone().multiply(getGlobalMatrix(e)),s=ta(t,n,o),l=ta(e,r,o),h=l.x,u=l.y;return i.e=i.f=0,"auto"===r&&e.getTotalLength&&"path"===e.tagName.toLowerCase()&&(a=e.getAttribute("d").match(et)||[],h+=(a=i.apply({x:+a[0],y:+a[1]})).x,u+=a.y),a&&(h-=(a=i.apply(e.getBBox())).x,u-=a.y),i.e=h-s.x,i.f=u-s.y,i}var j,f,Q,W,J,o,K="x,translateX,left,marginLeft,xPercent".split(","),tt="y,translateY,top,marginTop,yPercent".split(","),i=Math.PI/180,et=/[-+\.]*\d+\.?(?:e-|e\+)?\d*/g,nt=function _align(t,e,n){var r,a,o,i=n.align,s=n.matrix,l=n.offsetX,h=n.offsetY,u=n.alignOrigin,f=t[0][0],g=t[0][1],c=oa(e,"x"),p=oa(e,"y");return t&&t.length?(i&&("self"===i||(r=W(i)[0]||e)===e?transformRawPath(t,1,0,0,1,c-f,p-g):(u&&!1!==u[2]?j.set(e,{transformOrigin:100*u[0]+"% "+100*u[1]+"%"}):u=[oa(e,"xPercent")/-100,oa(e,"yPercent")/-100],o=(a=ua(e,r,u,"auto")).apply({x:f,y:g}),transformRawPath(t,a.a,a.b,a.c,a.d,c+a.e-(o.x-a.e),p+a.f-(o.y-a.f)))),s?transformRawPath(t,s.a,s.b,s.c,s.d,s.e,s.f):(l||h)&&transformRawPath(t,1,0,0,1,l||0,h||0),t):getRawPath("M0,0L0,0")},rt=function _addDimensionalPropTween(t,e,n,r,a,o){var i=e._gsap,s=i.harness,l=s&&s.aliases&&s.aliases[n],h=l&&l.indexOf(",")<0?l:n,u=t._pt=new f(t._pt,e,h,0,0,ra,0,i.set(e,h,t));u.u=Q(i.get(e,h,o))||0,u.path=r,u.pp=a,t._props.push(h)},a={version:"3.12.5",name:"motionPath",register:function register(t,e,n){Q=(j=t).utils.getUnit,W=j.utils.toArray,J=j.core.getStyleSaver,o=j.core.reverting||function(){},f=n},init:function init(t,e,n){if(!j)return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"),!1;"object"==typeof e&&!e.style&&e.path||(e={path:e});var r,a,o=[],i=e.path,s=e.autoRotate,l=e.unitX,h=e.unitY,u=e.x,f=e.y,g=i[0],c=function _sliceModifier(e,n){return function(t){return e||1!==n?sliceRawPath(t,e,n):t}}(e.start,"end"in e?e.end:1);if(this.rawPaths=o,this.target=t,this.tween=n,this.styles=J&&J(t,"transform"),(this.rotate=s||0===s)&&(this.rOffset=parseFloat(s)||0,this.radians=!!e.useRadians,this.rProp=e.rotation||"rotation",this.rSet=t._gsap.set(t,this.rProp,this),this.ru=Q(t._gsap.get(t,this.rProp))||0),!Array.isArray(i)||"closed"in i||"number"==typeof g)cacheRawPathMeasurements(r=c(nt(getRawPath(e.path),t,e)),e.resolution),o.push(r),rt(this,t,e.x||"x",r,"x",e.unitX||"px"),rt(this,t,e.y||"y",r,"y",e.unitY||"px");else{for(a in g)!u&&~K.indexOf(a)?u=a:!f&&~tt.indexOf(a)&&(f=a);for(a in u&&f?o.push(qa(this,na(na([],i,u,0),i,f,1),t,u,f,c,e,l||Q(i[0][u]),h||Q(i[0][f]))):u=f=0,g)a!==u&&a!==f&&o.push(qa(this,na([],i,a,2),t,a,0,c,e,Q(i[0][a])))}},render:function render(t,e){var n=e.rawPaths,r=n.length,a=e._pt;if(e.tween._time||!o()){for(1<t?t=1:t<0&&(t=0);r--;)getPositionOnPath(n[r],t,!r&&e.rotate,n[r]);for(;a;)a.set(a.t,a.p,a.path[a.pp]+a.u,a.d,t),a=a._next;e.rotate&&e.rSet(e.target,e.rProp,n[0].angle*(e.radians?i:1)+e.rOffset+e.ru,e,t)}else e.styles.revert()},getLength:function getLength(t){return cacheRawPathMeasurements(getRawPath(t)).totalLength},sliceRawPath:sliceRawPath,getRawPath:getRawPath,pointsToSegment:pointsToSegment,stringToRawPath:stringToRawPath,rawPathToString:rawPathToString,transformRawPath:transformRawPath,getGlobalMatrix:getGlobalMatrix,getPositionOnPath:getPositionOnPath,cacheRawPathMeasurements:cacheRawPathMeasurements,convertToPath:function convertToPath$1(t,e){return W(t).map(function(t){return convertToPath(t,!1!==e)})},convertCoordinates:function convertCoordinates(t,e,n){var r=getGlobalMatrix(e,!0,!0).multiply(getGlobalMatrix(t));return n?r.apply(n):r},getAlignMatrix:ua,getRelativePosition:function getRelativePosition(t,e,n,r){var a=ua(t,e,n,r);return{x:a.e,y:a.f}},arrayToRawPath:function arrayToRawPath(t,e){var n=na(na([],t,(e=e||{}).x||"x",0),t,e.y||"y",1);return e.relative&&pa(n),["cubic"===e.type?n:pointsToSegment(n,e.curviness)]}};!function _getGSAP(){return j||"undefined"!=typeof window&&(j=window.gsap)&&j.registerPlugin&&j}()||j.registerPlugin(a),t.MotionPathPlugin=a,t.default=a;if (typeof(window)==="undefined"||window!==t){Object.defineProperty(t,"__esModule",{value:!0})} else {delete t.default}});

function initMotion(variable) {

  var initCircle = function (selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    var poly = el.querySelectorAll('.poly');
    var lens = [12, 16, 28];
    var rotates = [30, 22.5, 12.85];
    var distance = [-50, -65, -90];
    var count = 0;

    poly.forEach(function (el) {
      var span = el.querySelector('span');

      for(var i=0; i < lens[count]; i+=1) {
        var c_span = span.cloneNode(true);
        el.appendChild(c_span);

        var svg = c_span.querySelector('svg');
        c_span.style = '--r: ' + (i * rotates[count]) + 'deg; --d:' + distance[count] * 1.3 + 'px';
      }

      el.removeChild(span);

      count += 1;
    })
  };

  var particles = function (parent, quantity, x, y, minAngle, maxAngle) {
    for(let i = quantity - 1; i >= 0; i--) {
      const dot = document.createElement('div');

      parent.appendChild(dot);
      gsap.set(parent, {rotate: -10})
      gsap.set(dot, {
        opacity:  0,
        x: -gsap.utils.random(50, 100),
        y: gsap.utils.random(50, 100),
        scaleY: gsap.utils.random(.7, 1),
        scaleX: gsap.utils.random(.4, 1.4)
      });

      gsap
          .timeline({ onComplete: () => {
              gsap.to(dot, {
                opacity: 0,
                duration: 0.4
              })
            }})
          .to(dot, {opacity: 1, duration: 0.3}, 0)
          .to(dot, {
            duration: gsap.utils.random(2, 2.6),
            rotationX: `-=${gsap.utils.random(0, 520)}`,
            rotationZ: `+=${gsap.utils.random(0, 720)}`,
            x: gsap.utils.random(50, 500),
            y: -gsap.utils.random(50, 300),
            delay: gsap.utils.random(0, 0.4)
          }, 0)
    }
  };

  var setClass = function (selector, className) {
    return gsap.to(selector, {
      duration: 0.01,
      className: className
    });
  };

  function scene1 () {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.main-special-01',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    var bar = document.querySelector('.main-special-01 .img2 .bar > span');
    var barState = document.querySelectorAll('.main-special-01 .img2 > ul > li');

    tl.add(setClass('.main-special-01 .img1', 'img1 view1-1'), '+=0.5');
    tl.add(setClass('.main-special-01 .img1', 'img1 view1-1 view1-2'), '+=1');
    tl.add(setClass('.main-special-01 .img2', 'img2 view2-1'), '+=1');
    tl.add(gsap.to('.main-special-01 .img2 .bar > span', {css : {width: 100 + '%'}, duration: 3, ease: 'none', onUpdate: function () {
        var progress = parseInt(bar.style.width);

        if (progress > 20) barState.item(1).classList.add('active');
        if (progress > 40) barState.item(2).classList.add('active');
        if (progress > 60) barState.item(3).classList.add('active');
        if (progress > 80) barState.item(4).classList.add('active');
        if (progress === 100) barState.item(5).classList.add('active');
      }}), '+=0.3');
    tl.add(setClass('.main-special-01 .circle', 'circle active'), '-=0.2');
    tl.add(gsap.to({}, {onComplete: function () {
        particles(document.querySelector('.emitter'), 140, 0, 0, -75, -45); // 파티클
      }}), '+=0');
  }

  function scene2 () {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.main-special-02',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    if (!variable.isMain) {
      tl.add(gsap.fromTo('.main-special-02 .img1 .tit', { display: 'none', y:0}, { display:'block', autoAlpha: 1, y:0, duration: 1, ease: 'quint.inOut' })); // 타이틀 등장
      tl.add(setClass('.main-special-02 .img1 li:nth-child(2)', 'view1-1'), '+=0.6'); // 컨텐츠 스크롤
      tl.add(setClass('.main-special-02 .img1 li:nth-child(3)', 'view1-2'), '+=0.6'); // 컨텐츠 스크롤
      tl.add(setClass('.main-special-02 .circle', 'circle active'), '+=1'); // 클릭
      tl.add(gsap.set('.main-special-02 .img1 .tit', { autoAlpha: 0, display: 'none' }), '+=1'); // 타이틀 숨김

      tl.add(setClass('.main-special-02 .img1', 'img1 view1-3'), '+=0.5'); // 딤드
      tl.add(gsap.fromTo('.main-special-02 .img2 .tit', { y:0 }, {y:0, duration: 1, ease: 'quint.inOut' }), '<+=.3'); // 타이틀 등장
    }
    tl.add(gsap.to('.main-special-02 .img2', { autoAlpha: 1, duration: 0.4 }), '<+=.3'); // 지도 등장

    var pathData =  [{x: 10, y: -10}, {x: 28, y: -18}, {x: 98, y: -30}, {x: 166, y: -12}, {x: 214, y: 22}];

    if (variable.isMobile) { // 모바일은 절반 크기로
      $.each(pathData, function (idx, value) {
        pathData[idx].x = pathData[idx].x / 2;
        pathData[idx].y = pathData[idx].y / 2;
      });
    }

    tl.add(
        gsap.to('.main-special-02 .img2 .port', {
          duration: 2.2,
          ease: 'none',
          motionPath: {
            path: pathData,
            start: 0,
            end: 1
          }
        }), '+=.3'); // 라인모션

    tl.add(setClass('.main-special-02 .img2', 'img2 view2')); // 지도 이동
    tl.add(gsap.to('.main-special-02 .img1', { autoAlpha: 0, duration: .5 })); // 뒤 배경 숨김

    tl.add(setClass('.main-special-02 .img3', 'img3 view3'), '+=.4'); // 지도 확대
  }

  function scene3 () {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.main-special-03',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    tl.add(setClass('.main-special-03 p.img1', 'img1 view1'));
    tl.add(setClass('.main-special-03 p.img2', 'img2 view2'), '+=0.6');
    tl.add(setClass('.main-special-03 p.img3', 'img3 view3'), '+=0.6');
    tl.add(setClass('.main-special-03 p.img4', 'img4 view4'), '+=0.6');
  }

  function s_scene1 () {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.sub-special-01',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    tl.add(setClass('.sub-special-01 .img1', 'img1 view1'));

    tl.add(setClass('.sub-special-01 .img2', 'img2 view2'), '+=0.8');
    tl.add(gsap.to('.sub-special-01 .img2 .zoom-list > img', {transform: 'scale(1.68)', duration: 1}), '+=0.8');
    tl.add(gsap.to('.sub-special-01 .img2 .zoom-list > img', {transform: 'scale(1.68) translate(-40%, 0px)', duration: 1.5}), '+=0.5');
    tl.add(gsap.to('.sub-special-01 .img2 .zoom-list', {transform: 'translate(-50%, -50%) scale(0.62)', webkitFilter:"blur(" + 2 + "px)", alpha:0.5, duration: 1}), '+=0.5');

    tl.add(setClass('.sub-special-01 .img2', 'img2')); // fade out
    tl.add(setClass('.sub-special-01 .img3', 'img3 view3')); // fade in

    tl.add(setClass('.sub-special-01 .img3 .zoom-list', 'zoom-list view3-1', '+=1.2'));
    tl.add(gsap.to({}, { duration: 2 }))

    tl.add(setClass('.sub-special-01 .img3 .zoom-list', 'zoom-list view3-2', '+=1.5'));
    tl.add(gsap.to({}, { duration: 2 }));

    tl.add(setClass('.sub-special-01 .img3', 'img3'), '+=0.7'); // fade out
    tl.add(setClass('.sub-special-01 .img4', 'img4 view4')); // fade in

    tl.add(setClass('.sub-special-01 .img4 li:nth-child(2)', 'img4 view4-2'), '+=1');
    tl.add(setClass('.sub-special-01 .img4 li:nth-child(3)', 'img4 view4-3'), '+=1');

    tl.add(setClass('.sub-special-01 .img4', 'img4'), '+=1');
    tl.add(setClass('.sub-special-01 .img1', 'img1'), '<');

    //tl.add(setClass('.sub-special-01 .img4 .circle', 'circle active'), '+=1'); // 클릭
  }

  function s_scene3() {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.sub-special-03',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    tl.add(setClass('.sub-special-03 .img1', 'img1 view1-1'));
    tl.add(setClass('.sub-special-03 .img1', 'img1 view1-1 view1-2'), '+=1');
    tl.add(setClass('.sub-special-03 .img2', 'img2 view2-1'), '+=1');
    tl.add(setClass('.sub-special-03 .img2', 'img2 view2-1 view2-2'), '+=1');
    tl.add(setClass('.sub-special-03 .img3', 'img3 view3-1'), '+=1');
    tl.add(setClass('.sub-special-03 .img3', 'img3 view3-1 view3-2'), '+=1');
    tl.add(setClass('.sub-special-03 .img4', 'img4 view4-1'), '+=1');
    tl.add(setClass('.sub-special-03 .img4', 'img4 view4-1 view4-2'), '+=1');
  }

  function sds_scene() {
    var tl = gsap.timeline({
      repeat       : 0,
      scrollTrigger: {
        trigger      : '.sub-sds-01',
        toggleActions: 'play stop play stop',
        start        : 'top 70%',
      }
    });

    tl.add(gsap.to('.sub-sds-01 .img1', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img1', 'img1 view'));
    tl.add(setClass('.sub-sds-01 .img1', 'img1 view view1'), '+=0.5');

    tl.add(gsap.to('.sub-sds-01 .img2', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img2', 'img2 view'));
    tl.add(setClass('.sub-sds-01 .img2', 'img2 view2'), '+=0.5');

    tl.add(gsap.to('.sub-sds-01 .img3', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img3', 'img3 view'));
    tl.add(setClass('.sub-sds-01 .img3', 'img3 view3'), '+=0.5');

    tl.add(gsap.to('.sub-sds-01 .img4', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img4', 'img4 view'));
    tl.add(setClass('.sub-sds-01 .img4', 'img4 view4'), '+=0.5');

    tl.add(gsap.to('.sub-sds-01 .img5', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img5', 'img5 view'));
    tl.add(setClass('.sub-sds-01 .img5', 'img5 view5'), '+=0.5');

    tl.add(gsap.to('.sub-sds-01 .img6', {opacity:1, duration:.5}));
    tl.add(setClass('.sub-sds-01 .img6', 'img6 view'));
    tl.add(setClass('.sub-sds-01 .img6', 'img6 view6'), '+=0.5');
  }

  if (variable.isMain) {
    initCircle('.main-special-01 .circle');
    initCircle('.main-special-02 .circle');

    scene1();
    scene2();
    scene3();
  } else if ($('.sub-special-01').length > 0) {
    initCircle('.sub-special-01 .circle');
    initCircle('.main-special-02 .circle');

    s_scene1();
    scene2();
    s_scene3();
  } else if ($('.sub-sds-01').length > 0) {
    sds_scene();
  }

  function getLinearFunction(a, b, c, d, x) {
    return ((d - c) / (b - a)) * (x - a) + c;
  }
}

/********************************************************************************************/
/****************************************** popup *******************************************/
/********************************************************************************************/

/**
 * @example
 * open  - $('#popup_sample').getInstance().open()
 * close - $('#popup_sample').getInstance().close()
 */

function Popup () {
  return {
    el: {
      $wrap      : null,
      $openBtn   : null,
      $closeBtn  : null,
      $focusAbles: null,
      $combackBtn: null
    },
    selector: {
      wrap      : '.popup-wrap',
      openBtn   : '',
      closeBtn  : '.btn-popup-close',
      focusAbles:
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]'
    },
    callback: {
      external: null
    },
    handler: {
      openBtnClick(e) {
        this.open();

        e.preventDefault();
      },
      closeBtnClick(e) {
        this.close();

        e.preventDefault();
      }
    },
    open({ btn } = {}) {
      this.scrollDisabled();
      this.el.$wrap.addClass('open');

      this.changeEmbedSrc();

      // 접근성
      this.el.$focusAbles.filter(':first').focus();
      this.el.$combackBtn = btn ? $(btn) : $($.fn);
    },
    close() {
      this.scrollEnabled();
      this.el.$wrap.removeClass('open');
      if(window.location.pathname.includes('/index.do') && $(this.el.$wrap).parent().closest('#terms-info-container').length > 0){
        // 2026-06-17 单独处理首页报价模块 seo要求条款信息一开始不展示源码中，只有点击某一条在加载。
        $('#terms-info-container').empty();
      }
      this.stopVideo();

      // 접근성
      if (this.el.$openBtn.length) {
        this.el.$openBtn.focus();
      } else if (this.el.$combackBtn && !!this.el.$combackBtn.length) {
        // open() 없이 실행할 경우 대비 $combackBtn && 체크
        this.el.$combackBtn.focus();
      }
    },
    changeEmbedSrc() {
      const embedCon = this.el.$wrap.find('.embed-con');
      const iframe = this.el.$wrap.find('iframe');
      const dataSrc = embedCon.attr('data-src');

      if (dataSrc && iframe.attr('src') !== dataSrc) {
        iframe.attr('src', dataSrc);
      }
    },
    stopVideo() {
      const iframe = this.el.$wrap.find('iframe');

      if (iframe.length > 0) {
        const src = iframe.attr('src');

        iframe.attr('src', src);
      }
    },
    scrollDisabled: function() {
      $('body').css('overflow', 'hidden');
    },
    scrollEnabled: function() {
      $('body').css('overflow', '');
    },
    setProperty(el) {
      const $popup = this.el.$wrap = $(el);
      const $body = $('body');

      // 팝업 div 에 인스턴트 저장
      if ($popup.data('scope') === undefined) {
        $popup.data('scope', this);
      }

      // 팝업 div 속성 data-callback 네이밍 지정된 함수 호출
      if ($popup.data('callback') !== undefined) {
        if (window[$popup.data('callback')] !== undefined) {
          this.callback.external = window[$popup.data('callback')];
        }
      }

      if (this.selector.openBtn === '' && $popup.attr('id')) {
        this.selector.openBtn = `a[href="#${$popup.attr('id')}"]`;
      }

      this.el.$openBtn = $body.find(this.selector.openBtn).filter(function() {
        return !$(this).closest('.swiper-slide').length; // swiper 내에 있는 팝업 연결 버튼은 제외 (복제 div 문제로 따로 .on 으로 구현)
      });

      this.el.$closeBtn = $popup.find(this.selector.closeBtn);

      this.el.$focusAbles = $popup.find(this.selector.focusAbles);
    },
    bind() {
      this.el.$openBtn.on('click', this.handler.openBtnClick.bind(this));
      this.el.$closeBtn.on('click', this.handler.closeBtnClick.bind(this));

      // 접근성
      this.el.$focusAbles.filter(':last').on('keydown', (e) => {
        if (e.keyCode === 9 && !e.shiftKey) {
          e.preventDefault();
          this.close();
        }
      });
    },
    init(el) {
      this.setProperty(el);
      this.bind();
    }
  };
};


/********************************************************************************************/
/***************************************** search *******************************************/
/********************************************************************************************/

/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */

//var transPage = 'https://www.samsungsds.com/app/search/transnew.jsp';

/* if(window.location.hostname == "182.198.89.25"){
  transPage = "/cn/search/trans.jsp"; // 타 언어
} */

var hostname;
if (window.location.hostname === 'www.cello-square.com') {
  hostname = ''
} else {
  hostname = 'https://www.cello-square.com'
}

// eslint-disable-next-line no-unused-vars
function fnCheckSearchBar(event, contsTp, langCd) {
  var input = $(event.target);
  var keyword = input.val();
  var inputStr = $.trim(keyword);
  if(contsTp === 'contentsearch'){
    if(keyword.length > 30){
      $('#search-menu-form-con-info').show();
      input.addClass('error');
    }else{
      $('#search-menu-form-con-info').hide();
      input.removeClass('error');
    }
  }
  /* 220503 수정 */
  var targetId = input.attr("id");

  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  /* //220503 수정 */
  var list = listCon.find('ul > li');
  var actList = list.filter('.active');
  var targetList;

  //listCon.show();

  $(document).one('mouseup.search', function() {
    listCon.hide();
  });

  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('active');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('active');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('active');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('active');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

      if(contsTp == "estimate" && !inputEqualToSearch(targetId)){
        return ;
      }
      // enter
      input.val(inputStr); //trim value
      fnSearch(keyword, contsTp, targetId); // 검색
  } else {
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
    if(inputStr.length > 1) {// 2글자 이상부터 자동완성
        /* 220503 수정 */
	  	autocomplete(keyword, contsTp, langCd, input); //자동완성 호출
	}
  }
  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

  // 입력한 검색어 삭제 처리
  del.click(function() {
      input.val('');
      del.hide();
  });
}

function inputEqualToSearch(targetId){
  var check = false;
  $("."+targetId+"-auto-complete-list").find('ul').find('li').each(function (i) {
    if ( $(this).text() == $("#"+targetId).val() ) {
      check = true;
    }
  });
  return check;
}

function autocomplete(keyword, contsTp, langCd , input) {
  var word = input.val();
  /* 220503 수정 */
  var targetId = input.attr("id");

  /*if (keyword === '') {
    word = '____';
  }*/

  if(contsTp == "estimate" && inputEqualToSearch(targetId)){
    return ;
  }

  word = word.replace(/\!|\@|\#|\$|\%|\^|\&|\*|\[|\]|\?|\(|\)/gi, ' ');
  word = word.replace(/\<|\>/gi, ' ');
  word = word.replace(/\+|\-/gi, ' ');
  word = word.replace(/\:|\;/gi, ' ');
  word = word.replace(/\[|\]/gi, ' ');
  word = word.replace(/\\/gi, ' ');

  var inputStr = $.trim(word + ''); //검색어
  var transPage = "/"+langCd+"/"+contsTp+"/"+contsTp+"-auto-ajax.do";
  if(contsTp == 'contentsearch'){
    transPage = "/"+langCd+"/etc/"+contsTp+"-auto-ajax.do";
  }
  var param = {searchValue: '' + inputStr, searchType : $("#searchType").val()};
if(contsTp === 'notice') {
  param.language = $('#language').val();
}
  /* 220503 수정 */
  if(targetId == "departure" || targetId == "arrival"){

    param.searchType = $("input[type=radio][name=transport]:checked").val();
  }
  /* //220503 수정 */

  $.ajax({
    //type: 'POST',
    type: 'GET',
    data: param,
    url  : transPage,
    error: function(xhr, status, error) {
      //console.log(status);
      //console.log(xhr);
      //console.log(error);
      //alert(ajaxErrorMsg);
    },
    success: function(result) {
      //console.log(result);
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      var cnt = keyword.length; //검색어 글자수

      /* 220503 수정 */
      var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');

      listCon.find('li').remove();

      var li;
      var flag = false;
      if(contsTp === 'glossary'){
        $.each(result.dataMap, function (k, v) {
          flag = true;
          listCon.find('ul').append('<li></li>');
          li = listCon.find('ul').find('li:last');
          /* 220503 수정 */
          var rst = $('<div>').html(v).text().replace(/<[^>]*>/g, '')
          li.append(
              '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
              stringEscape(rst) +
              '\', \''+contsTp+'\', \''+targetId+'\', \''+k+'\')">' +
              rst.replace(
                  new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                  '$1<strong class="mark">$2</strong>$3'
              ) +
              '</a>'
          );

          /* 220503 수정 */
          if( targetId == "searchValue" ){
            li.append(
                '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
                stringEscape(rst) +
                '\', \''+contsTp+'\', \''+targetId+'\', \''+k+'\')"><class class="hidden">추가</span></a>'
            );
          }

          li.data('keyword', rst);
        });
        if(flag){
          listCon.show();
        }else {
          listCon.hide();
        }
        return;
      }else {
        $(result).each(function(i) {
          listCon.find('ul').append('<li></li>');
          li = listCon.find('ul').find('li:last');
          /* 220503 수정 */
          var rst = result[i];
          let fontstr = $('<div>').html(rst).text().replace(/<[^>]*>/g, '')
          li.append(
              '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
              stringEscape(fontstr) +
              '\', \''+contsTp+'\', \''+targetId+'\')">' +
              fontstr.replace(
                  new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                  '$1<strong class="mark">$2</strong>$3'
              ) +
              '</a>'
          );

          /* 220503 수정 */
          if( targetId == "searchValue" ){
            li.append(
                '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
                stringEscape(fontstr) +
                '\', \''+contsTp+'\', \''+targetId+'\')"><class class="hidden">추가</span></a>'
            );
          }

          li.data('keyword', rst);
        });
      }

      if(result.length>0){
        listCon.show();
      }else {
        listCon.hide();
      }
    }
  });
}

function stringEscape(str){
  if(!str){
    return str;
  }
  return str.replace(/\'/g, "&#39;").replace(/\"/g, "&quot;").replace(/&/g, "&amp;");
}

function stringEscape2(str){
  if(!str){
    return str;
  }
  return str.replace(/&/g, "&amp;");
}

function stringUnEscape(str){
  if(!str){
    return str;
  }
  str = replaceSearchParam(str)
  var temp = document.createElement("div");
  // temp.innerHTML = str; // prevent xss
  temp.textContent = str;
  var rst = temp.innerText;
  temp = null;
  return rst;
}

function fnSearch(keyword, contsTp, targetId, seqNo) {
  //var input = $('.search-area input');
  $(document).off('mouseup.search');
  keyword = stringUnEscape(keyword);
  /*220503 수정*/
  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  // $('#searchValue').val(keyword);
  $('#'+targetId).val(keyword);
  listCon.hide();
  if(targetId == "searchValue"){
    if(contsTp === 'glossary'){
      $("#glossarySeqNo").val(seqNo);
    }
    console.log("contsTp", contsTp);
    $("#btnSearch").click();
  } else {
    $("#"+targetId).change();
  }


  //input.val(keyword);
  //alert('serach : ' + keyword);

}

/**
 * 키보드 언어 탭  Click Function
 *
 * 최초 로딩시 PC : KOR, ENG All Show
 *            Mobile : KOR show
 * @Date 2023.03.06
 */
function fnLanguageTapClick(lang) {

  let $element = $('.glossary-tab .tablinks');

  $element.removeClass('active');

  if (lang == 'kor') {
    $element.eq(0).addClass('active');

    $('#keyboard-kor').show();
    $('#keyboard-eng').hide();
    $('#enResult').hide();
    $('#krResult').show();
  }

  if (lang == 'eng') {
    $element.eq(1).addClass('active');

    $('#keyboard-kor').hide();
    $('#keyboard-eng').show();
    $('#krResult').hide();
    $('#enResult').show();
  }

}

function fnCheckSearchBarExpress(event, contsTp, langCd, expressNationJson) {
  var input = $(event.target);
  var keyword = input.val();
  var inputStr = $.trim(keyword);
  /* 220503 수정 */
  var targetId = input.attr("id");

  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  /* //220503 수정 */
  var list = listCon.find('ul > li');
  var actList = list.filter('.active');
  var targetList;

  //listCon.show();

  $(document).one('mouseup.search', function() {
    listCon.hide();
  });

  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('active');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('active');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('active');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('active');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

    if(contsTp == "estimate" && !inputEqualToSearch(targetId)){
      return ;
    }
    // enter
    input.val(inputStr); //trim value
    fnSearch(keyword, contsTp, targetId); // 검색
  } else {
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
    if(inputStr.length > 1) {// 2글자 이상부터 자동완성
      /* 220503 수정 */
      autocompleteExpress(keyword, contsTp, langCd, input, expressNationJson); //자동완성 호출
    }
  }

  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

    // 입력한 검색어 삭제 처리
    del.click(function() {
        input.val('');
        del.hide();
    });
}

function autocompleteExpress(keyword, contsTp, langCd , input, expressNationJson) {

  var word = input.val();
  /* 220503 수정 */
  var targetId = input.attr("id");

  if(contsTp == "estimate" && inputEqualToSearch(targetId)){
    return ;
  }
  var inputStr = $.trim(word + ''); //검색어
  /* 220503 수정 */
  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  listCon.find('li').remove();
  var li;

  if(expressNationJson.data != undefined){
    var expressNationList = expressNationJson.data;
    var flag = false;
    $.each(expressNationList, function (index, item){
      var rst = item.nation_eng_nm + "(" + item.nation_cd + ")";

      if(rst.toLowerCase().indexOf(inputStr.toLowerCase()) !== -1){
        flag = true;
        listCon.find('ul').append('<li></li>');
        li = listCon.find('ul').find('li:last');
        /* 220503 수정 */

        li.append(
            '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
            stringEscape(rst) +
            '\', \''+contsTp+'\', \''+targetId+'\')">' +
            rst.replace(
                new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                '$1<strong class="mark">$2</strong>$3'
            ) +
            '</a>'
        );

        /* 220503 수정 */
        if( targetId == "searchValue" ){
          li.append(
              '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
              stringEscape(rst) +
              '\', \''+contsTp+'\', \''+targetId+'\')"><class class="hidden">추가</span></a>'
          );
        }

        li.data('keyword', rst);
      }
    });
    if(flag){
      listCon.show();
    }else {
      listCon.hide();
    }
  }
}

function fnCheckHeadContentSearchBar(event, contsTp, langCd) {
  var input = $(event.target);
  var keyword = input.val();
  var inputStr = $.trim(keyword);
  if(keyword.length > 30){
    $('#search-form-con-info').show();
    input.addClass('error');
  }else{
    $('#search-form-con-info').hide();
    input.removeClass('error');
  }
  /* 220503 수정 */
  var targetId = input.attr("id");

  var listCon = $('.auto-complete-list');
  /* //220503 수정 */
  var list = listCon.find('ul > li');
  var actList = list.filter('.active');
  var targetList;

  //listCon.show();

  $(document).one('mouseup.search', function() {
    listCon.hide();
  });

  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('active');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('active');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('active');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('active');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

    // enter
    input.val(inputStr); //trim value
    fnHeadContentSearch(keyword, contsTp, targetId); // 검색
  } else {
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
    if(inputStr.length > 1) {// 2글자 이상부터 자동완성
      /* 220503 수정 */
      autocompleteHeadContenSearch(keyword, contsTp, langCd, input); //자동완성 호출
    }
  }
  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

  // 입력한 검색어 삭제 처리
  del.click(function() {
    input.val('');
    del.hide();
  });
}

function autocompleteHeadContenSearch(keyword, contsTp, langCd , input) {
  var word = input.val();
  /* 220503 수정 */
  var targetId = input.attr("id");
  word = word.replace(/\!|\@|\#|\$|\%|\^|\&|\*|\[|\]|\?|\(|\)/gi, ' ');
  word = word.replace(/\<|\>/gi, ' ');
  word = word.replace(/\+|\-/gi, ' ');
  word = word.replace(/\:|\;/gi, ' ');
  word = word.replace(/\[|\]/gi, ' ');
  word = word.replace(/\\/gi, ' ');

  var inputStr = $.trim(word + ''); //검색어
  var transPage = "/"+langCd+"/etc/" + contsTp + "-auto-ajax.do";
  var param = {searchValue: '' + inputStr, searchType : $("#searchType").val()};
  $.ajax({
    //type: 'POST',
    type: 'GET',
    data: param,
    url  : transPage,
    error: function(xhr, status, error) {
    },
    success: function(result) {
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }

      /* 220503 수정 */
      var listCon = $('#head-auto-complete-list');

      listCon.find('li').remove();

      var li;
      var flag = false;

      $(result).each(function(i) {
        listCon.find('ul').append('<li></li>');
        li = listCon.find('ul').find('li:last');
        /* 220503 수정 */
        var rst = result[i];
        li.append(
            '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnHeadContentSearch(\'' +
            stringEscape(rst) +
            '\', \''+contsTp+'\', \''+targetId+'\')">' +
            rst.replace(
                new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                '$1<strong class="mark">$2</strong>$3'
            ) +
            '</a>'
        );
        li.append(
            '<a href="#" class="btn-add" role="button" onclick="javascript:fnHeadContentSearch(\'' +
            stringEscape(rst) +
            '\', \''+contsTp+'\', \''+targetId+'\')"><class class="hidden">추가</span></a>'
        );
        li.data('keyword', rst);
      });


      if(result.length>0){
        listCon.show();
      }else {
        listCon.hide();
      }
    }
  });
}

function fnHeadContentSearch(keyword, contsTp, targetId, seqNo) {
  //var input = $('.search-area input');
  $(document).off('mouseup.search');
  keyword = stringUnEscape(keyword);
  /*220503 수정*/
  var listCon = $('.auto-complete-list');
  // $('#searchValue').val(keyword);
  $('#' + targetId).val(keyword);
  listCon.hide();
  $("#btnContentSearch").click();
}

