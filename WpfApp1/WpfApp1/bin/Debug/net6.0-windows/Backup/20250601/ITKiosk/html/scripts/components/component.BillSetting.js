// MainPage
Vue.component("component-BillSetting-main", {
  props: ["model"],
  template: "#template-BillSetting-main",
  data: function () {
    return {
      buyProduct: undefined,
      decText: "",
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update();
      } else {
        vm.swiper = new Swiper(".swiper-ConfirmDetail", {
          direction: "vertical",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: ".swiper-scrollbar",
          },
          mousewheel: true,
        });
      }
    },
    goNext: function (nextId) {
      switch (nextId) {
        // 載具
        case "Vehicle":
          kiosk.status.invoice.invoiceDeviceType = "MOBILE";
          nextId = "Vehicle";
          break;
        // 愛心碼
        case "Heart":
          kiosk.status.invoice.invoiceDeviceType = "DONATE";
          nextId = "Unumber";
          break;
        case "Skip":
          kiosk.status.invoice.invoiceDeviceType = "PAPER";
          nextId = "ConfirmDetail";
          break;
        // 統編
        case "Unumber":
        default:
          kiosk.status.invoice.invoiceDeviceType = "PAPER";
          nextId = "Unumber";
          break;
      }
      kiosk.status.invoice.invoiceType = "2COPIES";

      kiosk.API.goToNext(nextId);
    },
    goBack: function () {
      kiosk.API.goToNext(kiosk.lastModelKey);
    },
  },
  created: function () {
    this.buyProduct = kiosk.status.orderListUI[0];

    kiosk.status.goBack = function () {
      if (kiosk.status.orderListUI[0].bookingDate != null) {
        if (
          !kiosk.status.isSeatReservation ||
          kiosk.status.seatAllocatedMode != "MANUAL"
        ) {
          kiosk.API.goToNext("ProductChoiceReserTicket");
        } else {
          kiosk.API.goToNext("ChooseSeat");
        }
      } else {
        kiosk.API.goToNext("ProductChoiceTicket");
      }
    };
  },
  mounted: function () {
    // 必定發票流程 初始化參數
    kiosk.status.invoice = {};
    var vm = this;
    vm.decText = "";
    if (vm.buyProduct.orderItemList[0].sndec) {
      if (vm.buyProduct.orderItemList[0].sndec.date) {
        vm.decText += vm.buyProduct.orderItemList[0].sndec.date + " ";
      }
      if (vm.buyProduct.orderItemList[0].sndec.time) {
        vm.decText += vm.buyProduct.orderItemList[0].sndec.time;
      }
    }
  },
  updated: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
    });
  },
});
// NavBar
Vue.component("component-BillSetting-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
