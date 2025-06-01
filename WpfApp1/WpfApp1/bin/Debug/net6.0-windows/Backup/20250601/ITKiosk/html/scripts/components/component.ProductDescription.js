// MainPage
Vue.component('component-ProductDescription-main', {
  props: ['model'],
  template: '#template-ProductDescription-main',
  data: function () {
    return {
      imgUri: '',
      ticketType: undefined,
    }
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext('mainMenu')
    },
    // goNext: function () {
    //   kiosk.API.goToNext('ProductChoiceTicket')
    // },
    goBack: function () {
      kiosk.API.goToNext('ProductChoiceTicket')
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update()
      } else {
        vm.swiper = new Swiper('.swiper-ProductDescription', {
          direction: 'vertical',
          slidesPerView: 'auto',
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: '.swiper-scrollbar',
          },
          mousewheel: true,
        });
      }
      
      if (vm.swiper2 != undefined) {
        vm.swiper2.update()
      } else {
        vm.swiper2 = new Swiper('.swiper-Detail', {
          direction: 'vertical',
          slidesPerView: 'auto',
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: '.swiper-scrollbar',
          },
          mousewheel: true,
        });
      }
    },

  },

  created: function () {
    var vm = this
    kiosk.status.posSaleProductList.saleProductList.map(function (productItem) {
      if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
        // 商品詳情
        vm.saleProductName = productItem.saleProductName
        vm.features = productItem.feature
        vm.currentProduct = productItem
        vm.saleCode = productItem.saleCode
        vm.imgUri = productItem.mainPhotoPath
        vm.productType = productItem.productType
        
      if (vm.productType === 'RESERVATION') {
        vm.ticketType = kiosk.status.lastSelect.ticketType
      } else {
        vm.ticketType = productItem.ticketData.saleProductSpecList
      }
      }
    })

    kiosk.status.goBack = function () {
      // kiosk.status.posSaleProductList.saleProductList.map(function (productItem) {
      //   if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
      //     productItem.ticketData.saleProductSpecList.map(function (itemList) {
      //       itemList.quantity = 0;
      //     })
      //   }
      // });
      if (vm.productType === 'RESERVATION') {
        kiosk.API.goToNext('ProductChoiceReserTicket')
      } else {
        kiosk.API.goToNext('ProductChoiceTicket')
      }
    }
  },
  mounted: function () {
    var vm = this;
    
    if (vm.productType === 'RESERVATION') {
      
    }
    this.$nextTick(function () {
      vm.initSwiper();
      vm.$forceUpdate();
    })
  },
});

// NavBar
Vue.component('component-ProductDescription-navBar', {
  template: '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true
    }
  }
});