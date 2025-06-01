// MainPage
Vue.component("component-ProductChoiceReserTicket-main", {
  props: ["model"],
  template: "#template-ProductChoiceReserTicket-main",
  data: function () {
    return {
      saleProductId: "",
      bookingSpecId: "",
      selectDate: {},
      ticketType_ori: undefined,
      ticketType: undefined,
      saleProductName: undefined,
      currentProduct: undefined,
      saleCode: undefined,
      features: [],
      imgUri: "",
      nowTime: moment(),
      changeWeek: 0,
      weekArr: [],
      pickDate: undefined,
      selectTicket: {},
      bookingSpecList: undefined,
      //sam 0313
      SaleAvailableDays: undefined,
      //sam0313
      choosepickDate: undefined,
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.initStatus();
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
          if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
            // totalCount = 0;
            // if (productItem.ticketData == undefined) {
            //     return;
            // }
            if (productItem.productType === "TICKET") {
              productItem.ticketData.saleProductSpecList.map(function (
                itemList
              ) {
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
          function goChooseSeat() {
            showAlert({
              imageUrl: "./img/rollToSeeSeats.gif",
              imageClass: "rollToSeeSeatsGIF",
              // title: '移動捲軸查看座位',
              title: vm.model.ScrollSeatMap,
              // type: "info",
              confirm: "確認",
              confirmFn: function () {
                kiosk.app.updateLoading(true);
                Promise.all([
                  PalaceAPI.posQueryReservedSaleProductInventoryDetail(
                    vm.saleProductId,
                    vm.selectDate.date
                  ),
                  PalaceAPI.posQueryReservedSaleProductSeatingDetail(
                    vm.saleProductId,
                    vm.bookingSpecId,
                    vm.selectDate.date
                  ),
                ])
                  .then(function (res) {
                    refreshTicketData();
                    kiosk.app.updateLoading(false);
                    kiosk.API.goToNext("ChooseSeat");
                  })
                  .catch(function (msg) {
                    kiosk.app.updateLoading(false);
                    showAlert({
                      title: msg,
                      type: "error",
                      confirm: "確認",
                    });
                  });
              },
            });
          }
          // TODO START -是否記錄國籍-
          // TODO E N D -------------

          // TODO START -是否開立發票-
          for (var i = 0; i < kiosk.status.orderListUI.length; i++) {
            if (kiosk.status.orderListUI[i].needInvoice) {
              kiosk.status.needInvoice = true;
              if (
                kiosk.status.isSeatReservation == true &&
                kiosk.status.seatAllocatedMode == "MANUAL"
              ) {
                goChooseSeat();
              } else {
                checkIfFreePayment(function () {
                  kiosk.API.goToNext("BillSetting");
                });
              }
              return;
            }
          }
          // TODO E N D -------------

          kiosk.status.invoice = null;
          if (
            kiosk.status.isSeatReservation == true &&
            kiosk.status.seatAllocatedMode == "MANUAL"
          ) {
            goChooseSeat();
          } else {
            checkIfFreePayment(function () {
              kiosk.API.goToNext("Unumber");
            });
          }
        }
      }
    },
    initSwiper: function () {
      var vm = this;
      if (vm.swiper != undefined) {
        vm.swiper.update();
      } else {
        vm.swiper = new Swiper(".swiper-ProductChoiceReserTicket", {
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
        console.log("swiper2 update");
        vm.swiper2.update();
      } else {
        console.log("swiper2 create");
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

      if (vm.swiper3 != undefined) {
        vm.swiper3.update();
      } else {
        vm.swiper3 = new Swiper(".swiper-sessionItemSp", {
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          pagination: {
            el: ".swiper-pagination",
          },
          // scrollbar: {
          //   el: '.swiper-scrollbar',
          // },
          mousewheel: true,
        });
      }
    },
    reduceNum: function (item, index) {
      if (item.quantity > 0) {
        item.quantity--;
        if (
          kiosk.status.isSeatReservation == true &&
          kiosk.status.seatAllocatedMode == "MANUAL"
        ) {
          item.seatDataList.pop();
        }
        // this.$set(this.ticketType, index, item)
        refreshTicketData();
      }
    },
    addNum: function (item, index) {
      var vm = this;
      if (item.quantity < vm.selectTicket.inventory) {
        item.quantity++;
        if (
          kiosk.status.isSeatReservation == true &&
          kiosk.status.seatAllocatedMode == "MANUAL"
        ) {
          item.seatDataList.push({});
        }
        var result = this.checkOverLimit();
        if (result !== 0) {
          var showTitle = "";
          switch (result) {
            case 1:
              // showTitle = "超過上限, 共" + vm.saleProduct.limitQuantity + "張"
              // showTitle = "單次最大可選量" + vm.saleProduct.limitQuantity + "<br>請減少購買量!!";
              showTitle = vm.model.MaxLimit
                ? vm.model.MaxLimit.format(vm.saleProduct.limitQuantity)
                : "";
              break;
            case 2:
              // showTitle = "單次最大可選量" + vm.selectTicket.inventory + "<br>請減少購買量!!";
              showTitle = vm.model.MaxLimit
                ? vm.model.MaxLimit.format(vm.selectTicket.inventory)
                : "";
              break;
          }
          item.quantity--;
          if (
            kiosk.status.isSeatReservation == true &&
            kiosk.status.seatAllocatedMode == "MANUAL"
          ) {
            item.seatDataList.pop();
          }

          var sp_config = {
            spTitleText: vm.model.Hint,
            spContentTitle: showTitle,
            // spContentText: '訂單編號 : PN1371330858<br>#123-12345678',
            // spBtnLeftText: '<img src="./img/Path5751.png" alt="">   ' + model.spBtnLeftText,
            // spBtnLeftFn: function () {},
            spBtnRightText:
              '<img src="./img/MaskGroup3.png" alt="">   ' + vm.model.OK,
            // spBtnRightFn: function () {
            //   kiosk.API.goToNext('mainMenu')
            // },
          };
          TVMSwal(sp_config);
          // showAlert({
          //   // title: "超過上限, 共" + vm.saleProduct.limitQuantity + "張",
          //   title: showTitle,
          //   type: 'info',
          //   confirm: "確認",
          // })
        }
        // this.$set(this.ticketType, index, item)
        refreshTicketData();
      } else {
        showAlert({
          // title: "單次購買張數上限為" + vm.selectTicket.inventory + "張",
          title: vm.model.MaxLimit
            ? vm.model.MaxLimit.format(vm.selectTicket.inventory)
            : "",
          type: "info",
          confirm: "確認",
        });
      }
      // this.$set(this.ticketType, index, item)
      refreshTicketData();
    },
    checkOverLimit: function () {
      var vm = this;
      var total = 0;
      for (i = 0; i < vm.saleProductInventorySummary.length; i++) {
        //loop through the arraya
        if (vm.saleProductInventorySummary[i].detail) {
          for (
            j = 0;
            j < vm.saleProductInventorySummary[i].detail.length;
            j++
          ) {
            for (
              k = 0;
              k < vm.saleProductInventorySummary[i].detail[j].ticketType.length;
              k++
            ) {
              total +=
                vm.saleProductInventorySummary[i].detail[j].ticketType[k]
                  .quantity;
            }
          }
        }
      }
      if (total > vm.saleProduct.limitQuantity) {
        return 1;
      }
      if (total > vm.selectTicket.inventory) {
        return 2;
      }
      return 0;
      // if (total > vm.saleProduct.limitQuantity) {
      //   return true;
      // }
      // return false;
    },
    buildWeekArr: function () {
      this.weekArr = [];
      var vm = this;
      for (var i = 0; i < 7; i++) {
        // this.nowTime為當下的時間 例如:2022-03-13T08:51:52.614Z
        var tmp = this.nowTime
          //clone 複製當下天數
          .clone()
          //this.changeWeek每按一次addWeek 就會增加一個禮拜
          .add(this.changeWeek, "week")
          //startOf("isoWeek") 根据 ISO 8601 设置为本周的第一天上午 12:00
          .startOf("isoWeek")
          //搭配add(i, "day")這樣裡面才會顯示每一天的日期
          .add(i, "day");

        var obj = {
          // 日期
          date: tmp,
          // 是否今日
          today: false,
          // 有無庫存
          has: false,
        };
        // WriteLog("tmp:" + tmp.format("YYYYMMDD"));

        //if(有庫存&&在區間內) 回傳true 否則false
        //依照後台BESync去選則可以買幾天的票
        var starttime = moment().format("YYYYMMDD");
        // WriteLog("起始時間:" + starttime);

        var endtime = moment()
          .add(vm.SaleAvailableDays, "days")
          .format("YYYYMMDD");
        // WriteLog("結束時間:" + endtime);

        // if (starttime < tmp.format("YYYYMMDD") < endtime) {
        //   obj.has = true;
        // } else {
        //   obj.has = false;
        // }

        // some() 方法用于检测数组中的元素是否满足指定条件（函数提供）。 some() 方法会依次执行数组的每个元素： 如果有一个元素满足条件，则表达式返回true , 剩余的元素不会再执行检测。 如果没有满足条件的元素，则返回false。
        var ans = vm.saleProductInventorySummary.some(function (
          item,
          index,
          array
        ) {
          // return item.inventory > 0 && item.date == tmp.format("YYYYMMDD");
          return item.inventory > 0 && item.date == tmp.format("YYYYMMDD");
        });

        // WriteLog("判斷的日期:" + tmp.format("YYYYMMDD") + ":ans:" + ans);
        if (ans == true) {
          if (endtime < tmp.format("YYYYMMDD")) {
            obj.has = false;
            // WriteLog("大於endtime:" + JSON.stringify(obj));
          } else if (starttime <= tmp.format("YYYYMMDD")) {
            obj.has = true;
            // WriteLog("大於starttime" + JSON.stringify(obj));
          }
        } else {
          obj.has = ans;
        }

        this.weekArr.push(obj);
        //sam 0313 this.weekArr儲存所有沒有庫存和有庫存的資料
        // WriteLog("this.weekArr:" + JSON.stringify(this.weekArr));
      }
    },
    addWeek: function () {
      this.changeWeek++;
      this.buildWeekArr();
    },
    reduceWeek: function () {
      this.changeWeek--;
      this.buildWeekArr();
    },
    selectItem: function (sourceDay) {
      var vm = this;
      if (!sourceDay.has) {
        return;
      }
      var day = sourceDay.date.format("YYYYMMDD");
      var ans = vm.saleProductInventorySummary.findIndex(function (item) {
        return item.date === day;
      });
      if (ans != -1) {
        kiosk.app.updateLoading(true);

        if (kiosk.lastModelKey == "ProductChoice" || vm.pickDate != undefined) {
          // 清除已選取資料
          vm.saleProduct.saleProductSum.map(function (productItem) {
            if (productItem.detail != null) {
              productItem.detail.map(function (detailItem) {
                detailItem.ticketType.map(function (ticketItem) {
                  ticketItem.quantity = 0;
                });
              });
            }
          });
          refreshTicketData();
        }

        vm.pickDate = sourceDay.date;
        vm.selectDate = vm.saleProductInventorySummary[ans];
        if (vm.saleProductInventorySummary[ans].detail == null) {
          PalaceAPI.posQueryReservedSaleProductInventoryDetail(
            vm.saleProductId,
            vm.selectDate.date
          )
            .then(function (res) {
              kiosk.app.updateLoading(false);
              // posSaleProductList 銷售總表單
              kiosk.status.posQueryReservedSaleProductInventoryDetail = res;
              res.saleProductSpecList.map(function (productItem) {
                res.ticketTypeList.map(function (ticket) {
                  if (productItem.ticketTypeId == ticket.ticketTypeId) {
                    productItem.ticketTypeName = ticket.ticketTypeName;
                    productItem.ticketTypeRules = ticket.ticketTypeRules;
                  }
                });
              });
              res.bookingSpecList.map(function (bookinglist) {
                bookinglist.ticketType = [];
                bookinglist.bookingDate = res.queryDate;
                res.saleProductSpecList.map(function (productItem) {
                  if (productItem.bookingSpecId == bookinglist.bookingSpecId) {
                    productItem.ticketTotalNum = 0;
                    productItem.productAmt = 0;
                    productItem.quantity = 0;
                    if (
                      kiosk.status.isSeatReservation == true &&
                      kiosk.status.seatAllocatedMode == "MANUAL"
                    ) {
                      productItem.seatDataList = [];
                    }
                    bookinglist.ticketType.push(productItem);
                  }
                });
              });
              vm.saleProductInventorySummary[ans].detail = res.bookingSpecList;
              vm.bookingSpecList = vm.saleProductInventorySummary[ans].detail;

              vm.openSelectDate = false;
              vm.selectTicket = {};
              var count = 0;
              var countIndex = null,
                seatIndex = null;
              vm.bookingSpecList.forEach(function (res, index) {
                if (
                  res.inventory !== 0 &&
                  ((res.isMiniGroup == true &&
                    res.isMiniGroupConfirm == true) ||
                    res.isMiniGroup == false)
                ) {
                  count++;
                  countIndex = index;
                  if (
                    kiosk.status.currentBookingSpecId &&
                    kiosk.status.currentBookingSpecId ==
                      vm.bookingSpecList[index].bookingSpecId
                  ) {
                    seatIndex = index;
                  }
                }
              });

              if (
                kiosk.lastModelKey != "ProductChoice" &&
                kiosk.status.currentBookingSpecId &&
                seatIndex != null
              ) {
                // 最後選擇日期的index
                kiosk.status.lastSelect = vm.bookingSpecList[seatIndex];
                vm.selectTicket = vm.bookingSpecList[seatIndex];
                vm.bookingSpecId = vm.bookingSpecList[seatIndex].bookingSpecId;
                kiosk.status.currentBookingSpecId = vm.bookingSpecId;
              } else if (
                count == 1 &&
                (!kiosk.status.isSeatReservation ||
                  kiosk.status.seatAllocatedMode != "MANUAL") &&
                countIndex != null
              ) {
                // 最後選擇日期的index
                kiosk.status.lastSelect = vm.bookingSpecList[countIndex];
                vm.selectTicket = vm.bookingSpecList[countIndex];
                vm.bookingSpecId = vm.bookingSpecList[countIndex].bookingSpecId;
                kiosk.status.currentBookingSpecId = vm.bookingSpecId;
              }
              vm.$forceUpdate();
            })
            .catch(function (errMsg) {
              kiosk.app.updateLoading(false);
              var sp_config = {
                spTitleText: errMsg.includes("#1040-")
                  ? vm.model.NoAvailableProductTitle
                  : vm.model.NetworkErrTtitle,
                spContentTitle: errMsg.includes("#1040-")
                  ? vm.model.NoAvailableProduct
                  : vm.model.NetworkErr,
                spBtnLeftText:
                  '<img src="./img/Path5751.png" alt="">   ' +
                  vm.model.NetworkErrLeft,
                spBtnLeftFn: function () {
                  vm.goHome();
                },
                spBtnRightText:
                  '<img src="./img/MaskGroup3.png" alt="">   ' +
                  vm.model.NetworkErrRight,
                spBtnRightFn: function () {},
              };
              TVMSwal(sp_config);
            });
        } else {
          kiosk.app.updateLoading(false);
          vm.bookingSpecList = vm.saleProductInventorySummary[ans].detail;
          vm.ticketType = vm.saleProductInventorySummary[ans].detail.ticketType;
          vm.openSelectDate = false;
          vm.selectTicket = {};

          var count = 0;
          var countIndex = null,
            seatIndex = null;
          vm.bookingSpecList.forEach(function (res, index) {
            if (
              res.inventory !== 0 &&
              ((res.isMiniGroup == true && res.isMiniGroupConfirm == true) ||
                res.isMiniGroup == false)
            ) {
              count++;
              countIndex = index;
              if (
                kiosk.status.currentBookingSpecId &&
                kiosk.status.currentBookingSpecId ==
                  vm.bookingSpecList[index].bookingSpecId
              ) {
                seatIndex = index;
              }
            }
          });

          if (
            kiosk.lastModelKey != "ProductChoice" &&
            kiosk.status.currentBookingSpecId &&
            seatIndex != null
          ) {
            // 最後選擇日期的index
            kiosk.status.lastSelect = vm.bookingSpecList[seatIndex];
            vm.selectTicket = vm.bookingSpecList[seatIndex];
            vm.bookingSpecId = vm.bookingSpecList[seatIndex].bookingSpecId;
            kiosk.status.currentBookingSpecId = vm.bookingSpecId;
          } else if (
            count == 1 &&
            (!kiosk.status.isSeatReservation ||
              kiosk.status.seatAllocatedMode != "MANUAL") &&
            countIndex != null
          ) {
            // 最後選擇日期的index
            kiosk.status.lastSelect = vm.bookingSpecList[countIndex];
            vm.selectTicket = vm.bookingSpecList[countIndex];
            vm.bookingSpecId = vm.bookingSpecList[countIndex].bookingSpecId;
            kiosk.status.currentBookingSpecId = vm.bookingSpecId;
          }
          vm.$forceUpdate();
        }
      }
      vm.initSwiper();
    },
    selectTicketBtn: function (index) {
      var vm = this;

      // 清除已選取資料
      vm.saleProduct.saleProductSum.map(function (productItem) {
        if (productItem.detail != null) {
          productItem.detail.map(function (detailItem) {
            detailItem.ticketType.map(function (ticketItem) {
              ticketItem.quantity = 0;
              if (
                kiosk.status.isSeatReservation == true &&
                kiosk.status.seatAllocatedMode == "MANUAL"
              ) {
                ticketItem.seatDataList = [];
              }
            });
          });
        }
      });
      refreshTicketData();

      vm.selectTicket = vm.bookingSpecList[index];
      kiosk.status.lastSelect = vm.bookingSpecList[index];
      vm.bookingSpecId = vm.bookingSpecList[index].bookingSpecId;
      kiosk.status.currentBookingSpecId = vm.bookingSpecId;
      vm.openSelectTicket = false;
      vm.$forceUpdate();
    },
  },
  created: function () {
    var vm = this;
    kiosk.status.posSaleProductList.saleProductList.map(function (productItem) {
      if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
        kiosk.status.isSeatReservation = productItem.isSeatReservation;
        kiosk.status.seatAllocatedMode = productItem.seatAllocatedMode;
      }
    });

    kiosk.status.goBack = function () {
      kiosk.API.goToNext("ProductChoice");
      if (vm.saleProduct.saleProductSum) {
        vm.saleProduct.saleProductSum.map(function (productItem) {
          if (productItem.detail != null) {
            productItem.detail.map(function (detailItem) {
              detailItem.ticketType.map(function (ticketItem) {
                ticketItem.quantity = 0;
              });
            });
          }
        });
      }
    };
  },
  mounted: function () {
    var vm = this;

    vm.SaleAvailableDays = kiosk.status.TicketTemplates[2].SaleAvailableDays;
    // WriteLog("vm.SaleAvailableDays:" + vm.SaleAvailableDays);

    if (testFlag.testFlag) {
      vm.saleProductId = "V3EJkNXvG9RlPAQd";
    } else {
      vm.saleProductId = kiosk.status.sfSelectProductId;
    }

    kiosk.app.updateLoading(true);
    this.$nextTick(function () {
      kiosk.status.posSaleProductList.saleProductList.map(function (
        productItem
      ) {
        if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
          vm.saleProductName = productItem.saleProductName;
          vm.saleCode = productItem.saleCode;
          vm.features = productItem.feature;
          vm.imgUri = productItem.mainPhotoPath;
          vm.saleProduct = productItem;
          // vm.ticketType = productItem.ticketData.saleProductSpecList;
          if (productItem.saleProductSum == null) {
            PalaceAPI.posQueryReservedSaleProductInventorySummary(
              vm.saleProductId
            )
              .then(function (res) {
                kiosk.app.updateLoading(false);
                // posSaleProductList 銷售總表單
                productItem.saleProductSum = res.inventorySummaryList;
                vm.saleProductInventorySummary = res.inventorySummaryList;
                vm.saleProductInventorySummary_ori = JSON.parse(
                  JSON.stringify(productItem.saleProductSum)
                );

                if (
                  kiosk.status.orderList &&
                  kiosk.status.orderList[0] &&
                  kiosk.status.orderList[0].bookingDate
                ) {
                  var dayStr = kiosk.status.orderList[0].bookingDate;
                } else {
                  // find today
                  var dayStr = moment().format("YYYYMMDD");
                }
                var date = vm.saleProductInventorySummary.filter(function (e) {
                  return e.inventory > 0 && e.date === dayStr;
                });

                var sourceDay = {
                  // 日期
                  date: moment(dayStr, "YYYYMMDD"),
                  // 是否今日
                  today: true,
                  // 有無庫存
                  has: true,
                };

                vm.buildWeekArr();
                if (date.length != 0) {
                  if (
                    kiosk.status.orderList &&
                    kiosk.status.orderList[0] &&
                    kiosk.status.orderList[0].bookingDate &&
                    kiosk.status.orderList[0].bookingDate !=
                      moment().format("YYYYMMDD")
                  ) {
                    sourceDay.today = false;
                  }
                  vm.selectItem(sourceDay);
                }
                refreshTicketData();
                vm.$forceUpdate();
              })
              .catch(function (errMsg) {
                kiosk.app.updateLoading(false);
                var sp_config = {
                  spTitleText: errMsg.includes("#1040-")
                    ? vm.model.NoAvailableProductTitle
                    : vm.model.NetworkErrTtitle,
                  spContentTitle: errMsg.includes("#1040-")
                    ? vm.model.NoAvailableProduct
                    : vm.model.NetworkErr,
                  spBtnLeftText:
                    '<img src="./img/Path5751.png" alt="">   ' +
                    vm.model.NetworkErrLeft,
                  spBtnLeftFn: function () {
                    vm.goHome();
                  },
                  spBtnRightText:
                    '<img src="./img/MaskGroup3.png" alt="">   ' +
                    vm.model.NetworkErrRight,
                  spBtnRightFn: function () {},
                };
                TVMSwal(sp_config);
              });
          } else {
            kiosk.app.updateLoading(false);
            vm.saleProductInventorySummary = productItem.saleProductSum;
            vm.saleProductInventorySummary_ori = JSON.parse(
              JSON.stringify(productItem.saleProductSum)
            );

            if (
              kiosk.status.orderList &&
              kiosk.status.orderList[0] &&
              kiosk.status.orderList[0].bookingDate
            ) {
              var dayStr = kiosk.status.orderList[0].bookingDate;
            } else {
              // find today
              var dayStr = moment().format("YYYYMMDD");
            }
            var date = vm.saleProductInventorySummary.filter(function (e) {
              return e.inventory > 0 && e.date === dayStr;
            });

            var sourceDay = {
              // 日期
              date: moment(dayStr, "YYYYMMDD"),
              // 是否今日
              today: true,
              // 有無庫存
              has: true,
            };

            vm.buildWeekArr();
            if (date.length != 0) {
              if (
                kiosk.status.orderList &&
                kiosk.status.orderList[0] &&
                kiosk.status.orderList[0].bookingDate &&
                kiosk.status.orderList[0].bookingDate !=
                  moment().format("YYYYMMDD")
              ) {
                sourceDay.today = false;
              }
              vm.selectItem(sourceDay);
            }
            refreshTicketData();
            vm.$forceUpdate();
          }
        }
      });
    });
  },
  updated: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
      // kiosk.app.updateLoading(false);
    });
  },
});

// NavBar
Vue.component("component-ProductChoiceReserTicket-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: true,
      isShowHome: true,
    };
  },
});
