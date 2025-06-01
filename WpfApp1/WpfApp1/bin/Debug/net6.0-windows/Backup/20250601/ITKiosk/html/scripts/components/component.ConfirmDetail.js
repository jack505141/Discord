// MainPage
Vue.component("component-ConfirmDetail-main", {
  props: ["model"],
  template: "#template-ConfirmDetail-main",
  data: function () {
    return {
      buyProduct: undefined,
      OKPayTypes: [],
      isFree: false,
      decText: "",
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.initStatus();
      kiosk.API.goToNext("mainMenu");
    },
    goNext: function () {},
    goBack: function () {},
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
    //(選擇付款方式)打API到豐趣建立訂單資料，部分資料存入SQLite，換頁(Payment)
    goPayment: function (payType) {
      // payType → 付款方式id
      //"8XG21YD4xrDarxgO" : "現金收款 ",
      //"8aAdLQbE0pgKeXV2" : "藍新信用卡NewebPay ",
      var vm = this;

      // 若現金模組裝置異常，則阻擋付款
      if (payType.PayTypeAction == "ICTCash") {
        // 判斷機器狀態
        if (
          kiosk.app.deviceStatus.CASHBOX === 1 &&
          !kiosk.app.deviceStatus.CASHBOXERROR
        ) {
          handleBalanceCheck().then(function (res) {
            res.shortage || res.IfLowBalance
              ? PaymentAlert()
              : CreatePayment(payType, vm.isFree, vm.goHome, vm.goHome);
          });
        } else {
          PaymentAlert();
        }
        return;
      } else {
        CreatePayment(payType, vm.isFree, vm.goHome, vm.goHome);
        return;
      }

      function PaymentAlert() {
        showAlert({
          title: vm.model.PaymentMaintenanceText,
          type: "error",
          confirm: "確認",
        });
      }
    },
  },
  created: function () {
    this.buyProduct = kiosk.status.orderListUI[0];
  },
  mounted: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.decText = "";
      if (vm.buyProduct.orderItemList[0].sndec) {
        if (vm.buyProduct.orderItemList[0].sndec.date) {
          vm.decText += vm.buyProduct.orderItemList[0].sndec.date + " ";
        }
        if (vm.buyProduct.orderItemList[0].sndec.time) {
          vm.decText += vm.buyProduct.orderItemList[0].sndec.time;
        }
      }
      console.log(vm.ticketType);
      var UIres = updateOrderListUI();
      vm.isFree = UIres[0];
      vm.OKPayTypes = UIres[2];

      vm.initSwiper();
    });

    kiosk.status.goBack = function () {
      if (kiosk.status.invoice == null) {
        // 無須開立發票
        kiosk.API.goToNext("Unumber");
      } else {
        // 開立紙本發票
        kiosk.API.goToNext("BillSetting");
      }
    };
  },
  updated: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
    });
  },
});
// NavBar
Vue.component("component-ConfirmDetail-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
