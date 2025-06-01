// MainPage
Vue.component("component-ProductChoiceTicket-main", {
  props: ["model"],
  template: "#template-ProductChoiceTicket-main",
  data: function () {
    return {
      ticketType_ori: undefined,
      ticketType: undefined,
      saleProductName: undefined,
      currentProduct: undefined,
      saleCode: undefined,
      features: [],
      imgUri: "",
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
    goNext: function () {
      var vm = this;
      if (kiosk.status.ticketTotalNum <= 0) {
        showAlert({
          title: vm.model.CheckCount,
          type: "info",
          confirm: "確認",
        });
      } else {
        var totalCount = 0;
        var OKGO = true;
        kiosk.status.posSaleProductList.saleProductList.map(function (
          productItem
        ) {
          totalCount = 0;

          // if (productItem.ticketData == undefined) {
          //     return;
          // }
          if (productItem.productType === "TICKET") {
            productItem.ticketData.saleProductSpecList.map(function (itemList) {
              totalCount += itemList.quantity;
            });
          } else {
            if (productItem.saleProductSum != null) {
              productItem.saleProductSum.map(function (saleProductItem) {
                if (saleProductItem.detail != null) {
                  saleProductItem.detail.map(function (detailItem) {
                    detailItem.ticketType.map(function (ticketItem) {
                      if (ticketItem.quantity > 0) {
                        totalCount += ticketItem.quantity;
                      }
                    });
                  });
                }
              });
            }
            // alert(totalCount)
            // alert(JSON.stringify(productItem))
          }
          if (totalCount != 0 && productItem.minQuantity != 0) {
            if (totalCount < productItem.minQuantity) {
              OKGO = false;
              showAlert({
                // title: '最小購買量 : ' + productItem.minQuantity,
                title: vm.model.MinLimit
                  ? vm.model.MinLimit.format(productItem.minQuantity)
                  : "",
                type: "info",
                confirm: "確認",
              });
              return;
            }
          }
        });
        if (kiosk.status.ticketTotalAmt > 3000) {
          OKGO = false;
          var sp_config = {
            spTitleText: vm.model.Hint,
            spContentTitle: vm.model.moneyOver,
            // spContentText: '訂單編號 : PN1371330858<br>#123-12345678',
            // spBtnLeftText: '<img src="./img/icon_notok.png" alt="">繼續購買',
            // spBtnLeftFn: function () {},
            spBtnRightText: vm.model.OK,
          };
          TVMSwal(sp_config);
        }
        if (OKGO) {
          // TODO START -是否記錄國籍-
          // TODO E N D -------------

          // TODO START -是否開立發票-
          for (var i = 0; i < kiosk.status.orderListUI.length; i++) {
            if (kiosk.status.orderListUI[i].needInvoice) {
              kiosk.status.needInvoice = true;
              checkIfFreePayment(function () {
                // kiosk.status.invoice = {};
                kiosk.API.goToNext("BillSetting");
              });
              return;
            }
          }
          // TODO E N D -------------

          kiosk.status.invoice = null;
          checkIfFreePayment(function () {
            kiosk.API.goToNext("Unumber");
          });
        }
      }
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update();
      } else {
        vm.swiper = new Swiper(".swiper-ProductChoiceTicket", {
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

      if (vm.swiper2 != undefined) {
        vm.swiper2.update();
      } else {
        vm.swiper2 = new Swiper(".swiper-Detail", {
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
    reduceNum: function (item, index) {
      if (item.quantity > 0) {
        // this.ticketTotalAmt -= item.salePrice;
        item.quantity--;
        this.$set(this.ticketType, index, item);
        // this.$refs.posOrderList.refreshTicketData();
      }
      refreshTicketData();
      // this.$forceUpdate();
    },
    addNum: function (item, index) {
      var vm = this;
      item.quantity++;
      var result = vm.checkOverLimit();

      if (result.overLimit) {
        item.quantity--;
        showAlert({
          title: result.msg,
          type: "info",
          confirm: "確認",
        });
      } else {
        this.$set(this.ticketType, index, item);
        // this.$refs.posOrderList.refreshTicketData();
      }
      refreshTicketData();
      // this.$forceUpdate();
    },
    checkOverLimit: function () {
      var vm = this;
      var inventoryMode = vm.currentProduct.inventoryMode;
      var total = 0;
      var result = {
        overLimit: false,
        msg: "",
      };
      for (
        i = 0;
        i < vm.currentProduct.ticketData.saleProductSpecList.length;
        i++
      ) {
        //loop through the array
        total += vm.currentProduct.ticketData.saleProductSpecList[i].quantity;
      }
      var overNum = 10000;
      var overTmpVal = 0;
      /**
       * 1 庫存量
       * 2 單次上限
       * 3 購買量
       */
      var overType = 0;

      switch (inventoryMode) {
        case "BY_PRODUCT":
          // 判斷外層的 inventory & 判斷最大購買量
          if (total > vm.currentProduct.inventory) {
            result.overLimit = true;
            // result.msg = '超出庫存量 : ' + vm.currentProduct.inventory + "張";
            result.msg = vm.model.MaxLimit
              ? vm.model.MaxLimit.format(vm.currentProduct.inventory)
              : "";
            if (overNum > total - vm.currentProduct.inventory) {
              overNum = total - vm.currentProduct.inventory;
              overTmpVal = vm.currentProduct.inventory;
              overType = 1;
            }
          }
          break;
        case "BY_SPEC":
          // 判斷saleProductSpecList[i].inventory & 判斷最大購買量
          for (
            i = 0;
            i < vm.currentProduct.ticketData.saleProductSpecList.length;
            i++
          ) {
            //loop through the array
            if (
              vm.currentProduct.ticketData.saleProductSpecList[i].quantity >
              vm.currentProduct.ticketData.saleProductSpecList[i].inventory
            ) {
              result.overLimit = true;
              result.msg = vm.model.MaxLimit
                ? vm.model.MaxLimit.format(
                    vm.currentProduct.ticketData.saleProductSpecList[i]
                      .inventory
                  )
                : "";
              if (
                overNum >
                vm.currentProduct.ticketData.saleProductSpecList[i].quantity -
                  vm.currentProduct.ticketData.saleProductSpecList[i].inventory
              ) {
                overNum =
                  vm.currentProduct.ticketData.saleProductSpecList[i].quantity -
                  vm.currentProduct.ticketData.saleProductSpecList[i].inventory;
                overTmpVal =
                  vm.currentProduct.ticketData.saleProductSpecList[i].inventory;
                overType = 2;
              }
            }
          }
          break;
        case "UNLIMITED":
          // 判斷最大購買量
          break;
        default:
          result.overLimit = true;
          result.msg = "未知異常";
          // 其他銷售類別
          break;
      }

      if (total > vm.currentProduct.limitQuantity) {
        result.overLimit = true;
        result.msg = vm.model.MaxLimit
          ? vm.model.MaxLimit.format(vm.currentProduct.limitQuantity)
          : "";
        // result.msg = "超出購買量 : " + vm.currentProduct.limitQuantity + "張";
        if (overNum > (total > vm.currentProduct.limitQuantity)) {
          overNum = total > vm.currentProduct.limitQuantity;
          overTmpVal = vm.currentProduct.limitQuantity;
          overType = 3;
        }
      }
      switch (overType) {
        case 1:
          result.msg = vm.model.MaxLimit
            ? vm.model.MaxLimit.format(overTmpVal)
            : "";
          // result.msg = '超出庫存量 : ' + overTmpVal + "張";
          break;
        case 2:
          result.msg = vm.model.MaxLimit
            ? vm.model.MaxLimit.format(overTmpVal)
            : "";
          break;
        case 3:
          result.msg = vm.model.MaxLimit
            ? vm.model.MaxLimit.format(overTmpVal)
            : "";
          2;
          // result.msg = "超出購買量 : " + overTmpVal + "張";
          break;
      }
      return result;
    },
  },
  created: function () {
    console.log("create ProductChoiceTicket");
    kiosk.app.updateLoading(true);
    var vm = this;
    if (kiosk.status.posSaleProductList.saleProductList) {
      kiosk.status.posSaleProductList.saleProductList.map(function (
        productItem
      ) {
        if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
          vm.ticketType_ori = JSON.parse(
            JSON.stringify(productItem.ticketData.saleProductSpecList)
          );
          vm.ticketType = productItem.ticketData.saleProductSpecList;
          vm.saleProductName = productItem.saleProductName;
          vm.features = productItem.feature;
          vm.currentProduct = productItem;
          vm.saleCode = productItem.saleCode;
          vm.imgUri = productItem.mainPhotoPath;
        }
      });
    }
    kiosk.status.goBack = function () {
      if (kiosk.status.posSaleProductList.saleProductList) {
        kiosk.status.posSaleProductList.saleProductList.map(function (
          productItem
        ) {
          if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
            productItem.ticketData.saleProductSpecList.map(function (itemList) {
              itemList.quantity = 0;
            });
          }
        });
      }
      kiosk.API.goToNext("ProductChoice");
    };
  },
  mounted: function () {
    var vm = this;
    kiosk.OMG = false;
    this.$nextTick(function () {
      refreshTicketData();
      vm.initSwiper();
      vm.$forceUpdate();
    });
  },
  updated: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
      kiosk.app.updateLoading(false);
    });
  },
});

// NavBar
Vue.component("component-ProductChoiceTicket-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
