// MainPage
Vue.component("component-PrintFail-main", {
  props: ["model"],
  template: "#template-PrintFail-main",
  data: function () {
    return {
      subTotalCash: kiosk.status.ticketTotalAmt,
      orderListSerial: kiosk.status.posCreatePayment.payment.paymentNumber,
      payName: kiosk.status.posPayType.CorporationPayTypeName,
      isDone: false,
      count: 0,
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
    goAdmin: function () {
      this.count++;
      if (this.count >= 5) {
        kiosk.API.goToNext("adminVerify");
      }
    },
  },
  created: function () {
    var vm = this;
    kiosk.app.deviceStatus.PRINTTICKET = "0";
  },
  mounted: function () {
    handleEndICTCash();
    checkPrinterStatus();
  },
});
// NavBar
Vue.component("component-PrintFail-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: false,
      isShowHome: false,
    };
  },
});
