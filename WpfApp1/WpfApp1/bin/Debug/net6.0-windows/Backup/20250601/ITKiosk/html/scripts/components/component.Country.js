// MainPage
Vue.component('component-Country-main', {
  props: ['model'],
  template: '#template-Country-main',
  data: function () {
    return {}
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext('mainMenu')
    },
    goBack: function () {
      kiosk.API.goToNext('mainMenu')
    },
    selCountry: function (item) {
      kiosk.status.SelectInfo = item;
      kiosk.API.goToNext('ProductChoice')
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update()
      } else {
        vm.swiper = new Swiper('.swiper-Country', {
          direction: 'vertical',
          slidesPerView: 'auto',
          draggable: true,
          freeMode: true,
          grid: {
            fill: "row",
            rows: 3
          },
          scrollbar: {
            el: '.swiper-scrollbar',
          },
          mousewheel: true,
          on: {
            tap: function (e) {
              var clickEvent = document.createEvent('MouseEvents');
              // alert('999')
              clickEvent.initEvent('mousedown', true, true);
              e.target.dispatchEvent(clickEvent);
            },
          },
        });
      }
    },
  },
  created: function () {
    kiosk.status.goBack = function () {
      kiosk.API.goToNext('mainMenu')
    }
  },
  mounted: function () {
    var vm = this;
    vm.initSwiper();
  },
  beforeUpdate: function () {
    kiosk.app.updateLoading(true);
  },
  updated: function () {
    var vm = this;
    this.$nextTick(function () {
      vm.initSwiper();
      // alert('3:' + kiosk.app.isLoading)
      kiosk.app.updateLoading(false);
    })
  }
});

// NavBar
Vue.component('component-Country-navBar', {
  template: '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true
    }
  }
});