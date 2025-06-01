// MainPage
Vue.component("component-Vehicle-main", {
  props: ["model"],
  template: "#template-Vehicle-main",
  data: function () {
    return {
      timer: undefined,
      keyinValue: "",
      fontPayProc: false,
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
    goBack: function () {
      kiosk.API.goToNext("BillSetting");
    },
    goNext: function () {
      var vm = this;
      if (!this.isInvoice(this.keyinValue)) {
        showAlert({
          title: vm.model.AlertMsg,
          type: "error",
          confirm: vm.model.Confirm,
          confirmFn: function () {
            vm.goBack();
          },
        });
        return;
      }
      kiosk.status.invoice.invoiceDeviceCode = this.keyinValue;
      kiosk.API.goToNext("ConfirmDetail");
    },
    isInvoice: function (string) {
      var regexp = /^\/{1}[0-9A-Z\-\+\.]{7}$/;
      return regexp.test(string);
    },
    scanKeyDown: function (event) {
      var vm = this;
      var e = event;
      if (kiosk.currentModelKey !== "Vehicle" || vm.fontPayProc === true) {
        return;
      }
      // WriteLog(e.keyCode);
      switch (e.keyCode) {
        case 13:
          // vm.fontPayProc = true;
          // vm.goNext()
          break;
        default:
          console.log(e.keyCode);
          // if ((e.keyCode >= 48 && e.keyCode <= 57) ||
          //     (e.keyCode >= 65 && e.keyCode <= 90)
          // ) {
          vm.keyinValue += e.char;
          // console.log('OK' + e.keyCode)
          // }
          break;
      }
    },
    keyDownClear: function (a) {
      this.keyinValue = "";
    },
  },
  created: function () {},
  mounted: function () {
    var vm = this;
    this.$nextTick(function () {
      function autofocus() {
        if (kiosk.currentModelKey === "Vehicle") {
          $("#scanner1").focus();
        }
      }
      autofocus();
      vm.timer = setInterval(autofocus, 5000);
    });
  },
  beforeDestroy: function () {
    if (this.timer != null) {
      clearTimeout(this.timer);
    }
  },
});
// NavBar
Vue.component("component-Vehicle-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
