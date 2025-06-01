// 無發票-有統編 // 有發票-有統編 // 有發票-愛心碼
Vue.component("component-Unumber-main", {
  props: ["model"],
  template: "#template-Unumber-main",
  data: function () {
    return {
      keyin: "",
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
      goNext: function () {
          
      var vm = this;
      if (
        kiosk.status.invoice &&
        kiosk.status.invoice.invoiceDeviceType == "DONATE"
      ) {
        // 愛心碼
        if (!(this.keyin.length >= 3 && this.keyin.length <= 7)) {
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
        kiosk.status.invoice.invoiceDeviceCode = this.keyin;
        kiosk.status.invoice.invoiceDonateCode = this.keyin;
      } else {
        // 統一編號
        if (this.keyin.length == 0 || !this.isUnifiedInvoice(this.keyin)) {
          showAlert({
            title: vm.model.InputText,
            type: "error",
            confirm: vm.model.Confirm,
            confirmFn: function () {},
          });
          return;
        }
        if (kiosk.status.invoice == null) {
          // 無須開立發票
          kiosk.status.invoiceName = "統一編號";
          kiosk.status.invoiceCode = this.keyin;
        } else {
          // 開立紙本發票
          // kiosk.status.invoice.invoiceDeviceCode = this.keyin
          kiosk.status.invoice.invoiceVatNumber = this.keyin;
          kiosk.status.invoice.invoiceType = "3COPIES";
        }
      }

      kiosk.API.goToNext("ConfirmDetail");
    },
    goBack: function () {
      kiosk.API.goToNext("BillSetting");
    },
    goSkip: function () {
      kiosk.status.invoiceName = null;
      kiosk.status.invoiceCode = null;
      if (kiosk.status.invoice != null) {
        kiosk.status.invoice.invoiceType = "2COPIES";
        kiosk.status.invoice.invoiceDeviceCode = null;
      }
      kiosk.API.goToNext("ConfirmDetail");
    },
    keyDown: function (a) {
      try {
        var len = 8;
        if (this.keyin.length < len) {
          this.keyin += a;
        }
      } catch (e) {
        // 用於處理例外的陳述式
        logMyErrors(e); // 將例外物件傳給 error handler
      }
    },
    keyDownClear: function (a) {
      this.keyin = "";
    },
    backspace: function () {
      if (this.keyin.length != 0) {
        this.keyin = this.keyin.substring(0, this.keyin.length - 1);
      }
    },
    isUnifiedInvoice: function (string) {
      string = string.toString();
      var regexp = /^[0-9]{8}$/;
      if (!regexp.test(string)) return false;

      var sum = 0;
      const cx = [1, 2, 1, 2, 1, 2, 4, 1];
      var stringArr = string.split("");
      stringArr.forEach(function (item, index) {
        if (item == "7" && index == 6) return;
        sum += cc(item * cx[index]);
      });

      function cc(num) {
        var total = num;
        if (num > 9) {
          var nSum = 0;
          var n = total.toString().split("");
          var length = n.length;
          for (var i = 0; i < length; i++) {
            nSum += n[i] * 1;
          }
          total = nSum;
        }
        return total;
      }
      if (
        sum % 5 === 0 ||
        (stringArr[6] == "7" && (sum % 5 === 0 || (sum + 1) % 5 === 0))
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  created: function () {
    kiosk.status.goBack = function () {
      if (kiosk.status.invoice == null) {
        // 無須開立發票
        if (kiosk.status.orderListUI[0].bookingDate != null) {
          if (
            !kiosk.status.isSeatReservation ||
            kiosk.status.seatAllocatedMode != "MANUAL"
          ) {
            kiosk.status.posSaleProductList.saleProductList.map(function (
              productItem
            ) {
              if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
                productItem.saleProductSum.map(function (productItem) {
                  if (productItem.detail != null) {
                    productItem.detail.map(function (detailItem) {
                      detailItem.ticketType.map(function (ticketItem) {
                        ticketItem.quantity = 0;
                      });
                    });
                  }
                });
              }
            });
            kiosk.API.goToNext("ProductChoiceReserTicket");
          } else {
            kiosk.API.goToNext("ChooseSeat");
          }
        } else {
          kiosk.API.goToNext("ProductChoiceTicket");
        }
      } else {
        // 開立紙本發票
        kiosk.API.goToNext("BillSetting");
      }
    };
  },
  mounted: function () {},
});
// NavBar
Vue.component("component-Unumber-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
