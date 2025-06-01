// MainPage
Vue.component("component-ChooseSeat-main", {
  props: ["model"],
  template: "#template-ChooseSeat-main",
  data: function () {
    return {
      seatMap: [],
      saleProductName: "",
      queryDate: "",
      sessionStartTime: "",
      bookingSpecName: "",
      orderList: kiosk.status.orderListForCart,
    };
  },
  methods: {
    goNext: function () {
      var vm = this;
      var isSeatUnallocated = false;
      kiosk.status.posSaleProductList.saleProductList.map(function (
        productItem
      ) {
        if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
          if (productItem.saleProductSum != null) {
            productItem.saleProductSum.map(function (saleProductItem) {
              if (saleProductItem.detail != null) {
                saleProductItem.detail.map(function (detailItem) {
                  if (
                    detailItem.bookingSpecId ==
                    kiosk.status.currentBookingSpecId
                  ) {
                    for (
                      var i = 0, lengthA = detailItem.ticketType.length;
                      i < lengthA;
                      i++
                    ) {
                      if (isSeatUnallocated) break;
                      var ticketItem = detailItem.ticketType[i];
                      for (
                        var j = 0, lengthB = ticketItem.seatDataList.length;
                        j < lengthB;
                        j++
                      ) {
                        if (!ticketItem.seatDataList[j].coordinate) {
                          isSeatUnallocated = true;
                          break;
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        }
      });

      if (isSeatUnallocated) {
        kiosk.app.updateLoading(false);
        showAlert({
          // title: "您還沒有完成票券/預約的選擇",
          title: vm.model.CheckCount,
          type: "info",
          confirm: "確認",
        });
      } else {
        if (kiosk.status.needInvoice) {
          checkIfFreePayment(function () {
            kiosk.API.goToNext("BillSetting");
          });
        } else {
          checkIfFreePayment(function () {
            kiosk.API.goToNext("Unumber");
          });
        }
      }
    },
    showTutorial: function () {
      var vm = this;
      showAlert({
        imageUrl: "./img/rollToSeeSeats.gif",
        imageClass: "rollToSeeSeatsGIF",
        // title: '移動捲軸查看座位',
        title: vm.model.ScrollSeatMap,
        // type: "info",
        confirm: "確認",
      });
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper_orderList != undefined) {
        vm.swiper_orderList.update();
      } else {
        vm.swiper_orderList = new Swiper(".chooseSeatcontainer", {
          direction: "vertical",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: ".swiper-scrollbar",
          },
          mousewheel: true,
          noSwiping: true,
        });
      }

      if (vm.swiper_h != undefined) {
        vm.swiper_h.update();
      } else {
        vm.swiper_h = new Swiper(".ChooseSeat-h-Container", {
          direction: "horizontal",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: ".swiper-scrollbar",
          },
          mousewheel: true,
          noSwiping: true,
        });
      }

      if (vm.swiper_v != undefined) {
        vm.swiper_v.update();
      } else {
        vm.swiper_v = new Swiper(".ChooseSeat-v-Container", {
          direction: "vertical",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: ".swiper-scrollbar",
          },
          mousewheel: true,
          noSwiping: true,
        });
      }
    },
    chooseSeat: function (seatData) {
      var vm = this;
      var id = "#" + seatData.coordinate;
      kiosk.app.updateLoading(true);
      if ($(id).hasClass("seatAvailable")) {
        kiosk.status.posSaleProductList.saleProductList.map(function (
          productItem
        ) {
          if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
            if (productItem.saleProductSum != null) {
              productItem.saleProductSum.map(function (saleProductItem) {
                if (saleProductItem.detail != null) {
                  saleProductItem.detail.map(function (detailItem) {
                    if (
                      detailItem.bookingSpecId ==
                      kiosk.status.currentBookingSpecId
                    ) {
                      for (
                        var i = 0,
                          isUpdate = false,
                          lengthA = detailItem.ticketType.length;
                        i < lengthA;
                        i++
                      ) {
                        if (isUpdate) break;
                        var ticketItem = detailItem.ticketType[i];
                        for (
                          var j = 0, lengthB = ticketItem.seatDataList.length;
                          j < lengthB;
                          j++
                        ) {
                          if (!ticketItem.seatDataList[j].coordinate) {
                            ticketItem.seatDataList[j] = JSON.parse(
                              JSON.stringify(seatData)
                            );
                            isUpdate = true;
                            break;
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        });
      } else if ($(id).hasClass("seatChosen")) {
        kiosk.status.posSaleProductList.saleProductList.map(function (
          productItem
        ) {
          if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
            if (productItem.saleProductSum != null) {
              productItem.saleProductSum.map(function (saleProductItem) {
                if (saleProductItem.detail != null) {
                  saleProductItem.detail.map(function (detailItem) {
                    if (
                      detailItem.bookingSpecId ==
                      kiosk.status.currentBookingSpecId
                    ) {
                      for (
                        var i = 0,
                          isUpdate = false,
                          lengthA = detailItem.ticketType.length;
                        i < lengthA;
                        i++
                      ) {
                        if (isUpdate) break;
                        var ticketItem = detailItem.ticketType[i];
                        for (
                          var j = 0, lengthB = ticketItem.seatDataList.length;
                          j < lengthB;
                          j++
                        ) {
                          if (
                            ticketItem.seatDataList[j].coordinate &&
                            ticketItem.seatDataList[j].coordinate ==
                              seatData.coordinate
                          ) {
                            ticketItem.seatDataList[j] = {};
                            isUpdate = true;
                            break;
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
          }
        });
      }
      refreshTicketData();
      kiosk.app.updateLoading(false);
      vm.$forceUpdate();
    },
    updateSeatMap: function () {
      var vm = this;
      for (var i = 0, lengthA = vm.seatMap.length; i < lengthA; i++) {
        for (var j = 0, lengthB = vm.seatMap[i].length; j < lengthB; j++) {
          var id = "#" + vm.seatMap[i][j].coordinate;
          if ($(id).hasClass("seatChosen")) {
            $(id).removeClass("seatChosen");
            $(id).addClass("seatAvailable");
          }
        }
      }
      kiosk.status.posSaleProductList.saleProductList.map(function (
        productItem
      ) {
        if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
          if (productItem.saleProductSum != null) {
            productItem.saleProductSum.map(function (saleProductItem) {
              if (saleProductItem.detail != null) {
                saleProductItem.detail.map(function (detailItem) {
                  if (
                    detailItem.bookingSpecId ==
                    kiosk.status.currentBookingSpecId
                  ) {
                    for (
                      var i = 0, lengthA = detailItem.ticketType.length;
                      i < lengthA;
                      i++
                    ) {
                      var ticketItem = detailItem.ticketType[i];
                      for (
                        var j = 0, lengthB = ticketItem.seatDataList.length;
                        j < lengthB;
                        j++
                      ) {
                        if (ticketItem.seatDataList[j].coordinate) {
                          var id = "#" + ticketItem.seatDataList[j].coordinate;
                          if ($(id).hasClass("seatAvailable")) {
                            $(id).removeClass("seatAvailable");
                            $(id).addClass("seatChosen");
                          }
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        }
      });
    },
    initSeatMap: function () {
      var vm = this;
      var InventoryDetail =
          kiosk.status.posQueryReservedSaleProductInventoryDetail,
        seatStatus = kiosk.status.posQueryReservedSaleProductSeatingDetail,
        rowTagList = InventoryDetail.rowTagList,
        columnTagList = InventoryDetail.columnTagList;

      vm.saleProductName = kiosk.status.orderList[0].saleProductName;
      vm.queryDate = moment(InventoryDetail.queryDate, "YYYYMMDD").format(
        "YYYY/MM/DD"
      );
      for (
        var i = 0, length = InventoryDetail.bookingSpecList.length;
        i < length;
        i++
      ) {
        var bookingSpec = InventoryDetail.bookingSpecList[i];
        if (bookingSpec.bookingSpecId == kiosk.status.currentBookingSpecId) {
          vm.sessionStartTime = bookingSpec.sessionStartTime;
          vm.bookingSpecName = bookingSpec.bookingSpecName;
          break;
        }
      }

      for (
        var i = 0, lengthA = rowTagList.length, seatMap = [];
        i < lengthA;
        i++
      ) {
        var rowArr = [],
          rowTag = rowTagList[i],
          rowTagOrder = i + 1;

        for (var j = 0, lengthC = columnTagList.length; j < lengthC; j++) {
          var columnTag = columnTagList[j],
            columnTagOrder = j + 1;
          rowArr.push({
            rowTag: rowTag,
            columnTag: columnTag,
            seatNumber: rowTag + "-" + columnTag,
            coordinate: rowTagOrder + "-" + columnTagOrder,
            seatStatus: seatStatus.seatingChart[
              rowTagOrder + "-" + columnTagOrder
            ]
              ? seatStatus.seatingChart[rowTagOrder + "-" + columnTagOrder]
              : 0,
          });
        }
        seatMap.push(rowArr);
      }
      vm.seatMap = seatMap;
    },
  },
  created: function () {
    var vm = this;

    kiosk.status.goBack = function () {
      kiosk.API.goToNext("ProductChoiceReserTicket");
    };
  },
  mounted: function () {
    var vm = this;
    kiosk.app.updateLoading(true);
    vm.initSeatMap();
    kiosk.app.updateLoading(false);
  },
  updated: function () {
    var vm = this;
    kiosk.app.updateLoading(true);
    vm.updateSeatMap();
    kiosk.app.updateLoading(false);
    this.$nextTick(function () {
      vm.initSwiper();
    });
  },
});

// NavBar
Vue.component("component-ChooseSeat-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
