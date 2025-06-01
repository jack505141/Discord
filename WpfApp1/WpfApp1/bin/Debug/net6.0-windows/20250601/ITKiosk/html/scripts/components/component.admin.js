Vue.component("component-admin-main", {
  props: ["model"],
  template: "#template-admin-main",
  data: function () {
    kiosk.systemSetting.lang = "zh_TW";
    var _data = {
      merchantName: kiosk.systemSetting.merchantName,
      merchantCode: kiosk.systemSetting.merchantCode,
      merchantSiteName: kiosk.systemSetting.merchantSiteName,
      merchantSiteGroupName: kiosk.systemSetting.merchantSiteGroupName,
      deviceId: kiosk.systemSetting.deviceCode,
      deviceName: kiosk.systemSetting.deviceName,
      currentList: "deviceInfo",
      currentOrderDetail: "",
      systemSetting: kiosk.status.posCheckDevice == null,
      maintenance: kiosk.systemSetting.Maintenance,
      PRINTERSTATUE: kiosk.app.deviceStatus.PRINTERSTATUE,
      TSCSTATUS: kiosk.app.deviceStatus.TSCSTATUS,
      CONNECTSTATUS: kiosk.app.deviceStatus.CONNECTSTATUS,
      orderListDetail: {},
      currentOrderListDetail: null,
      paymentData: null,
      paymentDataList: [],
      history: [],
      allHistory: [],
      orderData: [],
      productNum: [],

      posQueryReconciliationList: [],

      thisPaymentSettingList: null,
      otherPaymentSettingList: null,
      paymentTotalPrice: null,
      refundmentTotalPrice: null,
      paymentQuantity: null,
      totalSaleQuantity: null,
      refundmentQuantity: null,
      totalRefundQuantity: null,
      saleProductSummary: null,
      refundProductSummary: null,
    };
    return _data;
  },
  watch: {
    maintenance: function (val) {
      kiosk.systemSetting.Maintenance = this.maintenance;

      // 當「點擊」維護按鈕時，才會改變ManualMaintenance，影響首頁判斷
      // 因此可能產生「按鈕顯示(Maintenance) 與 ManualMaintenance 狀態不同」的狀況
      kiosk.systemSetting.Maintenance
        ? (kiosk.app.ManualMaintenance = true)
        : (kiosk.app.ManualMaintenance = false);

      commonExt.setJson("systemSetting", kiosk.systemSetting);
    },
  },
  destroyed: function () { },
  methods: {
    // System START
    handleMouseDown: function (action) {
      var vm = this;
      if (action == "Cancel") {
        kiosk.API.goToNext("mainMenu");
      } else {
        if (action == "ShudDown") {
          console.log("關機");
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          kiosk.API.log.logInfo("使用者執行關機！", "ShudDown", "admin.js");
          kiosk.API.System.ShudDown();
        } else if (action == "Reboot") {
          console.log("重開機");
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          kiosk.API.log.logInfo("使用者執行重開機！", "Reboot", "admin.js");
          kiosk.API.System.Reboot();
        } else if (action == "ShotDownApp") {
          console.log("關閉APP");
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          kiosk.API.log.logInfo(
            "使用者執行關閉程式！",
            "ShotDownApp",
            "admin.js"
          );
          External.KioskCommon.CommonService.CloseSecondMonitor(
            "",
            function (res) { }
          );
          kiosk.API.System.ShotDownApp();
        } else if (action == "Idle") {
          kiosk.API.log.logInfo("重啟程式！", "Idle", "admin.js");
          kiosk.API.idle.GoHome();
        } else if (action == "PrintLogoutReport") {
          kiosk.app.updateLoading(true);
          vm.PrintLogoutReport()
            .then(function (res) {
              kiosk.app.updateLoading(false);
              WriteLog("PrintLogoutReport then:" + JSON.stringify(res));
              showAlert({
                title: "列印成功",
                type: "info",
                confirm: "確認",
              });
            })
            .catch(function (msg) {
              kiosk.app.updateLoading(false);
              WriteLog("PrintLogoutReport catch:" + JSON.stringify(msg));
              showAlert({
                title: "列印失敗",
                type: "error",
                confirm: "確認",
              });
            });
        }
      }
    },
    switchSystemSetting: function (type, bool) {
      if (type === "maintenance") {
        kiosk.systemSetting.Maintenance = bool;
        this.maintenance = bool;
      } else if (type === "needVerify") {
        kiosk.systemSetting.NeedVerify = bool;
        this.needVerify = bool;
      }

      var data = {
        systemSetting: kiosk.systemSetting,
      };

      var json_string = {
        FilePath: "C:\\ITKiosk\\ExtermalSettings\\開發用\\systemSetting.json",
        Content: JSON.stringify(data),
      };
      External.KioskCommon.CommonService.WriteAssignData(
        JSON.stringify(json_string),
        function (res) {
          if (JSON.parse(res).isSuccess) {
            WriteLog("複寫維護功能,目前維護功能:" + type);
          } else {
          }
        },
        function () { }
      );
    },
    setPage: function (pageId) {
      var vm = this;
      if (pageId === "cashBalance" && kiosk.systemSetting.useICTCash != true) {
        return;
      }

      vm.currentList = pageId;
      if (pageId === "cashBalance") {
        vm.timer = setInterval(function () {
          if (
            kiosk.CashBox.cc1_stock_now !== "載入中" &&
            kiosk.CashBox.cc5_stock_now !== "載入中" &&
            kiosk.CashBox.cc10_stock_now !== "載入中" &&
            kiosk.CashBox.cc50_stock_now !== "載入中"
          ) {
            vm.$forceUpdate();
            if (vm.timer != null) {
              clearInterval(vm.timer);
            }
          }
        }, 1000);
      }
      vm.$forceUpdate();
    },

    // === 2D Scanner Auto ===
    Scanner2DAuto_Open: function () {
      kiosk.API.Device.SCANNER2DAUTO.Open(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { },
        "19"
      );
    },

    Scanner2DAuto_Close: function () {
      kiosk.API.Device.SCANNER2DAUTO.Close(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { }
      );
    },

    Scanner2DAuto_Start: function () {
      kiosk.API.Device.SCANNER2DAUTO.GetDataAuto(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { }
      );
    },

    Scanner2DAuto_Stop: function () {
      kiosk.API.Device.SCANNER2DAUTO.StopAuto(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { }
      );
    },

    Scanner2DAuto_Status: function () {
      kiosk.API.Device.SCANNER2DAUTO.DeviceStatus(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { }
      );
    },
    // === 歐光Scanner END ===
    // === EZ100 START ===
    EZM_getData: function () {
      alert("test");
      kiosk.API.Device.EZM.getData(
        function (res) {
          alert(JSON.stringify(res));
        },
        function () { }
      );
    },
    EZM_StopGet: function () {
      kiosk.API.Device.EZM.stopGet(function (res) {
        alert(JSON.stringify(res));
      });
    },
    initSwiper: function () {
      var vm = this;
      deviceInfoSwiper();

      function deviceInfoSwiper() {
        vm.swiper = new Swiper(".swiper-posAdmin-deviceInfo", {
          direction: "vertical",
          slidesPerView: "auto",
          draggable: true,
          freeMode: true,
          scrollbar: {
            el: ".swiper-scrollbar-deviceInfo",
          },
          mousewheel: true,
        });
      }

      // if (kiosk.status.orderListSwiper) {
      //   orderListSwiper();
      // }

      // function orderListSwiper() {
      //   vm.swiper2 = new Swiper(".swiper-posAdmin-orderList", {
      //     direction: "vertical",
      //     slidesPerView: "auto",
      //     draggable: true,
      //     freeMode: true,
      //     scrollbar: {
      //       el: ".swiper-scrollbar-orderList",
      //     },
      //     mousewheel: true,
      //     // on: {
      //     //   tap: function (e) {
      //     //     e.stopPropagation();
      //     //     var clickEvent = document.createEvent("MouseEvents");
      //     //     clickEvent.initEvent("mousedown", true, true);
      //     //     e.target.dispatchEvent(clickEvent);
      //     //   },
      //     // },
      //   });
      // }
    },
    // === EZ100 END ===
    executeSettle: function () {
      var vm = this;

      kiosk.app.updateLoading(true);
      TVMSettle()
        .then(function (res) {
          kiosk.app.updateLoading(false);
          kiosk.systemSetting.settle = moment().format("YYYY/MM/DD HH:mm");
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          WriteLog(res);
          vm.$forceUpdate();
        })
        .catch(function (err) {
          kiosk.app.updateLoading(false);
          WriteLog(res);
        });
    },
    checkDevice: function () {
      // console.log(Date());
      var vm = this;
      if (!testFlag.viewDebugger) {
        // //--- Printer Check START ---
        vm.checkDetailsStatus();
        // //--- Printer Check E N D ---

        //--- Ticket Printer Check START ---
        if (kiosk.BESync.TicketPrinterName == "TSP-247") {
          vm.checkTSCStatus();
        }
        //--- Ticket Printer Check E N D ---

        //--- Connect Check START ---
        if (kiosk.BESync && kiosk.BESync.APIURL) {
          axios
            .get(kiosk.BESync.APIURL)
            .then(function (response) {
              if (response.status == "200") {
                vm.CONNECTSTATUS = true;
                kiosk.app.deviceStatus.CONNECTSTATUS = true;
              } else {
                vm.CONNECTSTATUS = false;
                kiosk.app.deviceStatus.CONNECTSTATUS = false;
              }
              vm.$forceUpdate();
            })
            .catch(function (error) {
              vm.CONNECTSTATUS = false;
              kiosk.app.deviceStatus.CONNECTSTATUS = false;
            });
        }
        //--- Connect Check E N D ---
      }
    },
    checkDetails: function () {
      var vm = this;
      var item = {
        productName: "測試單據",
        productCode: "PRD1673427526",
        saleProductId: "8pA0MQZ0n7XqLwoW",
        productMainPhoto: "",
        ticketTypeName: "測試票",
        productOrderId: "l4kgzJgknmJvqVEB",
        ticketNumber: "TN123456789012",
        status: "AVAILABLE",
        statusName: "可使用",
        timeMode: "NONE",
        dateMode: "NONE",
        displayLimitation: "",
        dateTypeList: "",
        effectiveDate: "20210811163752",
        expiredDate: "20210811235959",
        totalPrice: 0,
        salePrice: 0,
        averagePrice: 0,
        purchaseQuantity: 1,
        quantity: 1,
        remainQuantity: 1,
        periodStartTime: "0000",
        periodFinishTime: "2359",
        redeemMode: "SINGLE",
        redeemModeValue: 1,
        printable: true,
        redeemCode: "6275059551559750",
        precaution: "",
        instruction: "",
        touristInformation: [],
        instructionPhotoList: [],
        bundleProductOrderList: [],
      };
      BackEnd.AddActionLog(
        "4",
        "測試列印 TestPrintD",
        JSON.stringify({
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          printType: "single",
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );

      function updateStauts(callBack) {
        vm.checkDetailsStatus().then(function (res) {
          callBack();
        });
      }

      kiosk.app.updateLoading(true);
      printTicket(kiosk.BESync.ReveivePrinterName, item, 1)
        .then(function (res) {
          updateStauts(function () {
            kiosk.app.updateLoading(false);
            BackEnd.AddPrintTicketCount(3, 1);
            showAlert({
              title: "列印成功",
              type: "info",
              confirm: "確認",
            });
            vm.$forceUpdate();
          });
        })
        .catch(function (msg) {
          updateStauts(function () {
            kiosk.app.updateLoading(false);
            showAlert({
              title: "列印失敗",
              type: "error",
              confirm: "確認",
            });
            vm.$forceUpdate();
          });
        });
      vm.$forceUpdate();
    },
    checkDetailsStatus: function (isShowAlert) {
      var vm = this;
      if (isShowAlert) kiosk.app.updateLoading(true);

      return new Promise(function (resolve, reject) {
        //--- Printer Check START ---
        customLibDevice.Thermal.ReveiveStatus()
          .then(function (res) {
            vm.PRINTERSTATUE = "1";
            kiosk.app.deviceStatus.PRINTERSTATUE = "1";

            // 若非低水位且狀態正常，則歸零可再印製張數
            kiosk.systemSetting.ReceiptPrinterNearEndPrintCount = 0;
            commonExt.setJson("systemSetting", kiosk.systemSetting);

            if (
              kiosk.BESync.TicketPrinterName != "TSP-247" &&
              kiosk.BESync.TicketPrinterName === kiosk.BESync.ReveivePrinterName
            ) {
              vm.TSCSTATUS = vm.PRINTERSTATUE;
              kiosk.app.deviceStatus.TSCSTATUS =
                kiosk.app.deviceStatus.PRINTERSTATUE;
            }
            if (isShowAlert) {
              kiosk.app.updateLoading(false);
              showAlert({
                title: "連線正常",
                type: "info",
                confirm: "確認",
              });
            }
            vm.$forceUpdate();
            resolve();
          })
          .catch(function (err) {
            // 若設備一切正常，單純低水位，才會顯示"紙張將盡"
            if (err.IsSuccess && err.IsNearEnd) {
              vm.PRINTERSTATUE = "2";
              kiosk.app.deviceStatus.PRINTERSTATUE = "2";
            } else {
              vm.PRINTERSTATUE = "0";
              kiosk.app.deviceStatus.PRINTERSTATUE = "0";
            }
            if (
              kiosk.BESync.TicketPrinterName != "TSP-247" &&
              kiosk.BESync.TicketPrinterName === kiosk.BESync.ReveivePrinterName
            ) {
              vm.TSCSTATUS = vm.PRINTERSTATUE;
              kiosk.app.deviceStatus.TSCSTATUS =
                kiosk.app.deviceStatus.PRINTERSTATUE;
            }
            if (isShowAlert) {
              kiosk.app.updateLoading(false);
              showAlert({
                title:
                  kiosk.app.deviceStatus.PRINTERSTATUE == "2"
                    ? "紙張將盡"
                    : "連線異常",
                type: "error",
                confirm: "確認",
              });
            }
            vm.$forceUpdate();
            resolve();
          });
        //--- Ticket Printer Check E N D ---
      });
    },
    checkTSC: function () {
      var vm = this;
      var item = {
        productName: "測試單據",
        productCode: "PRD1673427526",
        saleProductId: "8pA0MQZ0n7XqLwoW",
        productMainPhoto: "",
        ticketTypeName: "測試票",
        productOrderId: "l4kgzJgknmJvqVEB",
        ticketNumber: "TN123456789012",
        status: "AVAILABLE",
        statusName: "可使用",
        timeMode: "NONE",
        dateMode: "NONE",
        displayLimitation: "",
        dateTypeList: "",
        effectiveDate: "20210811163752",
        expiredDate: "20210811235959",
        totalPrice: 0,
        salePrice: 0,
        averagePrice: 0,
        purchaseQuantity: 1,
        quantity: 1,
        remainQuantity: 1,
        periodStartTime: "0000",
        periodFinishTime: "2359",
        redeemMode: "SINGLE",
        redeemModeValue: 1,
        printable: true,
        redeemCode: "6275059551559750",
        precaution: "",
        instruction: "",
        touristInformation: [],
        instructionPhotoList: [],
        bundleProductOrderList: [],
      };
      BackEnd.AddActionLog(
        "4",
        "測試列印 TestPrintT",
        JSON.stringify({
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          printType: "single",
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );

      function updateStauts(callBack) {
        vm.checkTSCStatus().then(function (res) {
          callBack();
        });
      }

      kiosk.app.updateLoading(true);
      printTicket(kiosk.BESync.TicketPrinterName, item, 1)
        .then(function (res) {
          updateStauts(function () {
            kiosk.app.updateLoading(false);
            BackEnd.AddPrintTicketCount(3, 1);
            showAlert({
              title: "列印成功",
              type: "info",
              confirm: "確認",
            });
            vm.$forceUpdate();
          });
        })
        .catch(function (msg) {
          updateStauts(function () {
            kiosk.app.updateLoading(false);
            showAlert({
              title: "列印失敗",
              type: "error",
              confirm: "確認",
            });
            vm.$forceUpdate();
          });
        });
    },
    checkTSCStatus: function (isShowAlert) {
      var vm = this;
      if (isShowAlert) kiosk.app.updateLoading(true);
      return new Promise(function (resolve, reject) {
        if (
          kiosk.BESync.TicketPrinterName !== "TSP-247" &&
          kiosk.BESync.TicketPrinterName === kiosk.BESync.ReveivePrinterName
        ) {
          vm.checkDetailsStatus();
        }
        //--- Printer Check START ---
        customLibDevice.Thermal.Status()
          .then(function (res) {
            if (
              kiosk.BESync.TicketPrinterName == "TSP-247" &&
              kiosk.systemSetting != null &&
              !isNaN(parseInt(kiosk.systemSetting.TSCLimit)) &&
              !isNaN(parseInt(kiosk.systemSetting.printCount)) &&
              parseInt(kiosk.systemSetting.printCount) >
              parseInt(kiosk.systemSetting.TSCLimit)
            ) {
              vm.TSCSTATUS = "2";
              kiosk.app.deviceStatus.TSCSTATUS = "2";
            } else {
              vm.TSCSTATUS = "1";
              kiosk.app.deviceStatus.TSCSTATUS = "1";
              if (
                kiosk.BESync.TicketPrinterName !== "TSP-247" &&
                kiosk.BESync.TicketPrinterName ===
                kiosk.BESync.ReveivePrinterName
              ) {
                // 若非低水位且狀態正常，則歸零可再印製張數
                kiosk.systemSetting.ReceiptPrinterNearEndPrintCount = 0;
                commonExt.setJson("systemSetting", kiosk.systemSetting);
              }
            }

            if (isShowAlert) {
              kiosk.app.updateLoading(false);
              showAlert({
                title: "連線正常",
                type: "info",
                confirm: "確認",
              });
            }
            vm.$forceUpdate();
            resolve();
          })
          .catch(function (res) {
            if (kiosk.BESync.TicketPrinterName == "TSP-247") {
              vm.TSCSTATUS = "0";
              kiosk.app.deviceStatus.TSCSTATUS = "0";
            }
            if (isShowAlert) {
              kiosk.app.updateLoading(false);
              showAlert({
                title: "連線異常",
                type: "error",
                confirm: "確認",
              });
            }
            vm.$forceUpdate();
            resolve();
          });
        //--- Ticket Printer Check E N D ---
      });
    },
    checkConnStatus: function () {
      var vm = this;
      kiosk.app.updateLoading(true);
      //--- Connect Check START ---
      if (kiosk.BESync && kiosk.BESync.APIURL) {
        axios
          .get(kiosk.BESync.APIURL)
          .then(function (response) {
            kiosk.app.updateLoading(false);
            if (response.status == "200") {
              vm.CONNECTSTATUS = true;
              kiosk.app.deviceStatus.CONNECTSTATUS = true;
            } else {
              vm.CONNECTSTATUS = false;
              kiosk.app.deviceStatus.CONNECTSTATUS = false;
            }
            vm.$forceUpdate();
            showAlert({
              title: "連線正常",
              type: "info",
              confirm: "確認",
            });
          })
          .catch(function (error) {
            kiosk.app.updateLoading(false);
            vm.CONNECTSTATUS = false;
            kiosk.app.deviceStatus.CONNECTSTATUS = false;
            showAlert({
              title: "連線異常",
              type: "error",
              confirm: "確認",
            });
          });
      }
      //--- Connect Check E N D ---
    },
    setTSCLimit: function () {
      var vm = this;
      var b =
        "" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid">' +
        "取消" +
        "</button></div>" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid1">' +
        "是" +
        "</button></div>";
      var c =
        '<div id="swContent">' +
        '<div class="w-100 d-flex align-items-center my-5" style="justify-content: space-around;">' +
        "" +
        '<input class="form-control shadow-none col-8" aria-describedby="inputGroup-sizing" aria-label="Small" type="text" data-dpmaxz-eid="5" unselectable="on" id="detailsUnified">' +
        "</div>" +
        '<div class="col-12"><div class="keyboard" style="margin: 0px 20%; height: 100%; opacity: 1;"><div class="row m-0"><div class="key" inKey="1" style="padding: 5px 0 0px 0;">1</div> <div class="key" inKey="2" style="padding: 5px 0 0px 0;">2</div> <div class="key" inKey="3" style="padding: 5px 0 0px 0;">3</div></div> <div class="row m-0"><div class="key" inKey="4" style="padding: 5px 0 0px 0;">4</div> <div class="key" inKey="5" style="padding: 5px 0 0px 0;">5</div> <div class="key" inKey="6" style="padding: 5px 0 0px 0;">6</div></div> <div class="row m-0"><div class="key" inKey="7" style="padding: 5px 0 0px 0;">7</div> <div class="key" inKey="8" style="padding: 5px 0 0px 0;">8</div> <div class="key" inKey="9" style="padding: 5px 0 0px 0;">9</div></div> <div class="row m-0"><div class="key sp" inKey="C" style="padding: 5px 0 0px 0;">C</div> <div class="key" inKey="0" style="padding: 5px 0 0px 0;">0</div> <div class="key" style="background: rgb(2, 167, 240); visibility: hidden;">搜尋</div></div></div></div>' +
        "</div>";

      alertObj = showAlertForPOS({
        title: "可用張數設定",
        html: c,
        footer: b,
        customClass: "",
        onOpen: function () {
          vm.keyin = "";
          $("#detailsUnified").val(vm.keyin);
          $("#swContent .keyboard .key").mousedown(function (e) {
            console.log(e.target.getAttribute("inkey"));
            if (e.target.getAttribute("inkey") === "C") {
              vm.keyDownClear(e.target.getAttribute("inkey"));
            } else {
              vm.keyDown(e.target.getAttribute("inkey"));
            }
            $("#detailsUnified").val(vm.keyin);
          });

          $("#bid").click(function () {
            swal.close();
            vm.$forceUpdate();
          });
          $("#bid1").click(function () {
            if (!testFlag.viewDebugger) {
              kiosk.systemSetting.TSCLimit = parseInt(
                $("#detailsUnified").val()
              ).toString();
              commonExt.setJson("systemSetting", kiosk.systemSetting);
            }
            swal.close();
            vm.$forceUpdate();
          });
        },
      });
    },
    resetTSCPrintCount: function () {
      var vm = this;
      showAlert({
        title: "票卡列印數量將重新計算，是否確認重新計數?",
        type: "warning",
        confirm: "確認",
        cancel: "取消",
        confirmFn: function () {
          kiosk.systemSetting.printCount = "0";
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          vm.$forceUpdate();
        },
        cancelFn: function () { },
      });
    },
    setReceiptPrinterNearEndPrintLimit: function () {
      var vm = this;
      var b =
        "" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid">' +
        "取消" +
        "</button></div>" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid1">' +
        "是" +
        "</button></div>";
      var c =
        '<div id="swContent">' +
        '<div class="w-100 d-flex align-items-center mb-5" style="justify-content: space-around;">' +
        "" +
        '<input class="form-control shadow-none col-8" aria-describedby="inputGroup-sizing" aria-label="Small" type="text" data-dpmaxz-eid="5" unselectable="on" id="detailsUnified">' +
        "</div>" +
        '<div class="col-12"><div class="keyboard" style="margin: 0px 20%; height: 100%; opacity: 1;"><div class="row m-0"><div class="key" inKey="1" style="padding: 5px 0 0px 0;">1</div> <div class="key" inKey="2" style="padding: 5px 0 0px 0;">2</div> <div class="key" inKey="3" style="padding: 5px 0 0px 0;">3</div></div> <div class="row m-0"><div class="key" inKey="4" style="padding: 5px 0 0px 0;">4</div> <div class="key" inKey="5" style="padding: 5px 0 0px 0;">5</div> <div class="key" inKey="6" style="padding: 5px 0 0px 0;">6</div></div> <div class="row m-0"><div class="key" inKey="7" style="padding: 5px 0 0px 0;">7</div> <div class="key" inKey="8" style="padding: 5px 0 0px 0;">8</div> <div class="key" inKey="9" style="padding: 5px 0 0px 0;">9</div></div> <div class="row m-0"><div class="key sp" inKey="C" style="padding: 5px 0 0px 0;">C</div> <div class="key" inKey="0" style="padding: 5px 0 0px 0;">0</div> <div class="key" style="background: rgb(2, 167, 240); visibility: hidden;">搜尋</div></div></div></div>' +
        "</div>";

      alertObj = showAlertForPOS({
        title:
          "熱感印表機低紙量後<br>預期可再印製張數<br>" +
          "<h4 class='text-primary'>目前累計張數 " +
          kiosk.systemSetting.ReceiptPrinterNearEndPrintCount.toString() +
          " 張</h4>",
        html: c,
        footer: b,
        customClass: "",
        onOpen: function () {
          vm.keyin = "";
          $("#detailsUnified").val(vm.keyin);
          $("#swContent .keyboard .key").mousedown(function (e) {
            console.log(e.target.getAttribute("inkey"));
            if (e.target.getAttribute("inkey") === "C") {
              vm.keyDownClear(e.target.getAttribute("inkey"));
            } else {
              vm.keyDown(e.target.getAttribute("inkey"));
            }
            $("#detailsUnified").val(vm.keyin);
          });

          $("#bid").click(function () {
            swal.close();
            vm.$forceUpdate();
          });
          $("#bid1").click(function () {
            if (!testFlag.viewDebugger) {
              kiosk.systemSetting.ReceiptPrinterNearEndPrintLimit = parseInt(
                $("#detailsUnified").val()
              ).toString();
              commonExt.setJson("systemSetting", kiosk.systemSetting);
            }
            swal.close();
            vm.$forceUpdate();
          });
        },
      });
    },
    resetReceiptPrinterNearEndPrintCount: function () {
      var vm = this;
      showAlert({
        title: "預期可再印製張數將重新計算，是否確認重新計數?",
        type: "warning",
        confirm: "確認",
        cancel: "取消",
        confirmFn: function () {
          kiosk.systemSetting.ReceiptPrinterNearEndPrintCount = 0;
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          vm.$forceUpdate();
        },
        cancelFn: function () { },
      });
    },
    setAdminPassword: function () {
      var vm = this;
      var b =
        "" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid">' +
        "取消" +
        "</button></div>" +
        '<div class="px-1" style="width: 40%;"><button class="btn w-100 btn-outline-dark" id="bid1">' +
        "確認" +
        "</button></div>";
      var c =
        '<div id="swContent">' +
        '<div class="w-100 d-flex flex-column align-items-center justify-content-around mt-1">' +
        "" +
        "<div>" +
        '<div class="text-left" style="" id="TextA1">請輸入系統管理密碼</div>' +
        '<input type="password" class="form-control shadow-none" style="border-color: #007bff" inKey="available" aria-describedby="inputGroup-sizing" aria-label="Small" type="text" data-dpmaxz-eid="5" unselectable="on" id="oldPwd">' +
        '<div class="text-left" style="visibility: hidden" id="TextA2">密碼錯誤</div>' +
        '<div class="text-left" style="display: none" id="TextB1">請輸入新密碼</div>' +
        '<input type="password" class="form-control shadow-none" style="display: none" inKey="disable" aria-describedby="inputGroup-sizing" aria-label="Small" type="text" data-dpmaxz-eid="5" unselectable="on" id="newPwdA">' +
        '<div class="text-left" style="display: none" id="TextC1">請確認新密碼</div>' +
        '<input type="password" class="form-control shadow-none" style="display: none" inKey="disable" aria-describedby="inputGroup-sizing" aria-label="Small" type="text" data-dpmaxz-eid="5" unselectable="on" id="newPwdB">' +
        '<div class="text-left" style="display: none" id="TextC2">密碼錯誤</div>' +
        "</div>" +
        "</div>" +
        '<div class="col-12"><div class="keyboard" style="margin: 0px 20%; height: 100%; opacity: 1;"><div class="row m-0"><div class="key" inKey="1" style="padding: 5px 0 0px 0;">1</div> <div class="key" inKey="2" style="padding: 5px 0 0px 0;">2</div> <div class="key" inKey="3" style="padding: 5px 0 0px 0;">3</div></div> <div class="row m-0"><div class="key" inKey="4" style="padding: 5px 0 0px 0;">4</div> <div class="key" inKey="5" style="padding: 5px 0 0px 0;">5</div> <div class="key" inKey="6" style="padding: 5px 0 0px 0;">6</div></div> <div class="row m-0"><div class="key" inKey="7" style="padding: 5px 0 0px 0;">7</div> <div class="key" inKey="8" style="padding: 5px 0 0px 0;">8</div> <div class="key" inKey="9" style="padding: 5px 0 0px 0;">9</div></div> <div class="row m-0"><div class="key sp" inKey="C" style="padding: 5px 0 0px 0;">C</div> <div class="key" inKey="0" style="padding: 5px 0 0px 0;">0</div> <div class="key" style="background: rgb(2, 167, 240); visibility: hidden;">搜尋</div></div></div></div>' +
        "</div>";

      alertObj = showAlertForPOS({
        title: "變更密碼",
        html: c,
        footer: b,
        customClass: "",
        onOpen: function () {
          vm.keyin = "";
          $("#swContent .keyboard .key").mousedown(function (e) {
            if (e.target.getAttribute("inkey") === "C") {
              vm.keyDownClear();
            } else {
              vm.keyDown(e.target.getAttribute("inkey"));
            }
            if ($("#oldPwd").attr("inKey") === "available") {
              $("#oldPwd").val(vm.keyin);
            } else if ($("#newPwdA").attr("inKey") === "available") {
              $("#newPwdA").val(vm.keyin);
            } else if ($("#newPwdB").attr("inKey") === "available") {
              $("#newPwdB").val(vm.keyin);
            }
          });

          $("#bid").click(function () {
            swal.close();
            vm.$forceUpdate();
          });
          $("#bid1").click(function () {
            if (!testFlag.viewDebugger) {
              if ($("#oldPwd").attr("inKey") === "available") {
                vm.keyDownClear();
                switch ($("#oldPwd").val()) {
                  case "52653760":
                  case "42760988":
                  case kiosk.systemSetting.AdminPassword:
                    switchInputFocus(2);
                    switchInputUI(2);
                    break;

                  default:
                    showInputError(1);
                    break;
                }
              } else if ($("#newPwdA").attr("inKey") === "available") {
                vm.keyDownClear();
                switchInputFocus(3);
                switchInputUI(3);
              } else if ($("#newPwdB").attr("inKey") === "available") {
                vm.keyDownClear();
                if ($("#newPwdA").val() === $("#newPwdB").val()) {
                  kiosk.systemSetting.AdminPassword = $("#newPwdB").val();
                  commonExt.setJson("systemSetting", kiosk.systemSetting);
                  swal.close();
                } else {
                  showInputError(2);
                  switchInputFocus(2);
                }
              }
              vm.$forceUpdate();
            }
          });
        },
      });
      function switchInputUI(input) {
        switch (input) {
          case 1:
            break;

          case 2:
            $("#oldPwd").attr("style", "display: none");
            $("#newPwdA").attr("style", "border-color: #007bff");
            $("#newPwdB").attr("style", "");

            $("#TextA1").attr("style", "display: none");
            $("#TextA2").attr("style", "display: none");
            $("#TextB1").attr("style", "");
            $("#TextC1").attr("style", "");
            $("#TextC2").attr("style", "visibility: hidden");
            break;

          case 3:
            $("#newPwdA").attr("style", "");
            $("#newPwdB").attr("style", "border-color: #007bff");
            $("#TextC2").attr("style", "visibility: hidden");
            break;

          default:
            break;
        }
      }

      function switchInputFocus(input) {
        $("#oldPwd").attr("inKey", "disable");
        $("#newPwdA").attr("inKey", "disable");
        $("#newPwdB").attr("inKey", "disable");
        switch (input) {
          case 1:
            $("#oldPwd").attr("inKey", "available");
            break;

          case 2:
            $("#newPwdA").attr("inKey", "available");
            break;

          case 3:
            $("#newPwdB").attr("inKey", "available");
            break;
        }
      }

      function showInputError(input) {
        switch (input) {
          case 1:
            $("#oldPwd").val(vm.keyin);
            $("#oldPwd").attr("style", "border-color: #ff0000");
            $("#TextA2").attr("style", "color: #ff0000");
            break;

          case 2:
          case 3:
            $("#newPwdA").val(vm.keyin);
            $("#newPwdB").val(vm.keyin);
            $("#newPwdA").attr("style", "border-color: #ff0000");
            $("#newPwdB").attr("style", "border-color: #ff0000");
            $("#TextC2").attr("style", "color: #ff0000");
            break;
        }
      }
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

    PrintCashBalance: function () {
      var vm = this;
      if (kiosk.app.deviceStatus && kiosk.app.deviceStatus.CASHBOX == 0) {
        showAlert({
          title: "現金模組未連線",
          type: "error",
          confirm: "確認",
        });
        return;
      }
      if (!kiosk.systemSetting.useICTCash) {
        return;
      }

      kiosk.app.updateLoading(true);
      BackEnd.AddActionLog(
        "4",
        "列印現金水位紀錄表 PrintCashBalanceRecordChart",
        JSON.stringify({
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );

      PrintCashBalanceRecordChart()
        .then(function (res) {
          kiosk.app.updateLoading(false);
          showAlert({
            title: "列印成功",
            type: "info",
            confirm: "確認",
          });
        })
        .catch(function (msg) {
          kiosk.app.updateLoading(false);
          showAlert({
            title: "列印失敗",
            type: "error",
            confirm: "確認",
          });
        });
      vm.$forceUpdate();
    },

    kmsSync: function () {
      var vm = this,
        isResNull = false;
      kiosk.app.updateLoading(true);

      BackEnd.GetBasicData(
        kiosk.systemSetting && kiosk.systemSetting.DataVersion
          ? kiosk.systemSetting.DataVersion
          : ""
      )
        .then(function (res) {
          if (!res) isResNull = true;
          return updateBESync(res);
        })
        .then(function (res) {
          kiosk.systemSetting.DataVersion = kiosk.BESync.DataVersion;

          var index = kiosk.BESync.PayTypes.findIndex(function (res) {
            return res.PayTypeAction === "ICTCash";
          });
          if (index != -1) {
            kiosk.systemSetting.useICTCash = true;
          } else {
            kiosk.systemSetting.useICTCash = false;
          }
          vm.$forceUpdate();
          return commonExt.setJson("systemSetting", kiosk.systemSetting);
        })
        .then(function (res) {
          vm.checkDevice();
          vm.$forceUpdate();
          kiosk.app.updateLoading(false);
          if (isResNull) {
            showAlert({
              title: "目前已為最新版",
              type: "info",
              confirm: "確認",
            });
          } else {
            showAlert({
              title: "同步成功",
              type: "info",
              confirm: "確認",
            });
          }
        })
        .catch(function (res) {
          vm.checkDevice();
          vm.$forceUpdate();
          kiosk.app.updateLoading(false);
          showAlert({
            title: "同步失敗",
            type: "error",
            confirm: "確認",
          });
        });
    },
    getLocalTrans: function () {
      return new Promise(function (resolve, reject) {
        var vm = this;
        // Sqlite 取得訂單資料列表 START -----------
        // kiosk.app.updateLoading(true);
        External.TicketingServiceBizExt.TicketingService.getLocalTrans(
          JSON.stringify({}),
          function (res) {
            // kiosk.app.updateLoading(false);
            WriteLog("getLocalTrans 傳出 :" + JSON.stringify(res));
            resolve(JSON.parse(res).result);
          },
          function (err) {
            reject(err);
          }
        );
        // kiosk.app.updateLoading(false);
        // Sqlite 取得訂單資料列表 E N D -----------
      });
    },
    nextOrderListPage: function () {
      var vm = this;
      var page = kiosk.status.orderListPage;
      var maxPage = kiosk.status.maxOrderListPage;

      if (
        page >= maxPage ||
        typeof history !== "object" ||
        history.length === 0
      ) {
        return;
      }

      vm.history = [];
      for (var i = page * 11, last = (page + 1) * 11; i < last; i++) {
        if (!vm.allHistory[i]) break;
        vm.history.push(vm.allHistory[i]);
      }
      kiosk.status.orderListPage++;
      vm.$forceUpdate();
    },
    prevOrderListPage: function () {
      var vm = this;
      var page = kiosk.status.orderListPage;

      if (1 >= page || typeof history !== "object" || history.length === 0) {
        return;
      }

      vm.history = [];
      for (var i = (page - 2) * 11, last = (page - 1) * 11; i < last; i++) {
        if (!vm.allHistory[i]) break;
        vm.history.push(vm.allHistory[i]);
      }
      kiosk.status.orderListPage--;
      vm.$forceUpdate();
    },
    // 產生指定訂單資訊
    getOrderDetail: function (index, orderNo) {
      var vm = this;
      // 切換template
      vm.currentList = "orderListDetail";
      // 清空當前訂單資訊
      vm.currentOrderListDetail = null;
      var emptyContent = "";
      var errorContent = "";
      kiosk.app.updateLoading(true);

      // 確定此訂單存在於Sqlite，且還沒打api抓過資料
      if (vm.history[index] && !vm.orderListDetail[orderNo]) {
        if (kiosk.BESync.TicketPrinterName !== "TSP-247") {
          var changeLang = "zh_TW";
        } else {
          var changeLang = false;
        }
        PalaceAPI.posQueryPayment(vm.history[index].orderNo, changeLang)
          .then(function (res) {
            // 補印時會使用vm.paymentData
            vm.paymentData = res.payment;
            vm.paymentDataList[orderNo] = res.payment;
            // 若刷卡資訊存在，就先用變數接住
            if (
              res.payment.paymentTransactionData &&
              res.payment.paymentTransactionData.transactionData
            ) {
              var creditCard = true;
              var cardInfo = JSON.parse(
                res.payment.paymentTransactionData.transactionData
              );
            }

            // 產生訂單資訊
            var obj = {
              // 交易資訊
              orderDetail: {
                orderTime: [
                  "訂單時間",
                  vm.history[index].orderTime
                    ? moment(vm.history[index].orderTime).format(
                      "YYYY/MM/DD HH:mm:ss"
                    )
                    : errorContent,
                ],
                paymentNumber: [
                  "訂單編號",
                  vm.history[index].orderNo || errorContent,
                ],
                orderPaymentType: [
                  "付款方式",
                  vm.history[index].orderPaymentType || emptyContent,
                ],
                orderPrice: [
                  "訂單金額",
                  "$" + vm.history[index].orderPrice || "$" + errorContent,
                ],
                statusName: [
                  "訂單狀態",
                  res.payment.statusName || errorContent,
                ],
                buyerVatNumber: [
                  "統一編號",
                  res.payment.receiptType === "INVOICE" &&
                    res.payment.invoiceData &&
                    res.payment.invoiceData.invoiceType === "3COPIES"
                    ? res.payment.invoiceData.buyerVatNumber
                    : emptyContent,
                ],
                invoiceNumber: [
                  "發票號碼",
                  res.payment.invoiceData &&
                    res.payment.invoiceData.invoiceNumber
                    ? res.payment.invoiceData.invoiceNumber
                    : emptyContent,
                ],
                invoiceDeviceTypeName: [
                  "載具類型",
                  res.payment.invoiceData &&
                    res.payment.invoiceData.invoiceDeviceTypeName
                    ? res.payment.invoiceData.invoiceDeviceType === "MOBILE" &&
                      res.payment.invoiceData.invoiceDeviceCode
                      ? res.payment.invoiceData.invoiceDeviceTypeName +
                      " " +
                      res.payment.invoiceData.invoiceDeviceCode
                      : res.payment.invoiceData.invoiceDeviceTypeName
                    : emptyContent,
                ],
                voucherCount: [
                  "購買數量",
                  res.payment.productOrderList &&
                    !isNaN(res.payment.productOrderList.length)
                    ? res.payment.productOrderList.length
                    : emptyContent,
                ],
              },
              // 刷卡資訊
              creditCardDetail: {
                card_no: [
                  "卡號",
                  creditCard && cardInfo.card_no !== ""
                    ? cardInfo.card_no
                    : emptyContent,
                ],
                resp_code: [
                  "交易狀態",
                  creditCard && cardInfo.resp_code !== ""
                    ? cardInfo.resp_code === "0000"
                      ? "交易成功"
                      : "交易失敗 (" + cardInfo.resp_code + ")"
                    : emptyContent,
                ],
                terminal_id: [
                  "端末機號",
                  creditCard && cardInfo.terminal_id !== ""
                    ? cardInfo.terminal_id
                    : emptyContent,
                ],
                invoice_no: [
                  "調閱編號",
                  creditCard && cardInfo.invoice_no !== ""
                    ? cardInfo.invoice_no
                    : emptyContent,
                ],
                approval_code: [
                  "授權碼",
                  creditCard && cardInfo.approval_code !== ""
                    ? cardInfo.approval_code
                    : emptyContent,
                ],
                ref_no: [
                  "交易序號",
                  creditCard && cardInfo.ref_no !== ""
                    ? cardInfo.ref_no
                    : emptyContent,
                ],
                totalPrice: [
                  "刷卡金額",
                  creditCard && cardInfo.amount1 !== ""
                    ? "$" + res.payment.totalPrice
                    : emptyContent,
                  // amount1
                ],
              },
            };

            // 將訂單資訊存於物件中，如要反覆查看時不用一直打API
            vm.orderListDetail[orderNo] = obj;
            // 當前訂單資訊
            vm.currentOrderListDetail = obj;
            kiosk.app.updateLoading(false);
          })
          .catch(function (errMsg) {
            vm.currentOrderListDetail = null;
            kiosk.app.updateLoading(false);
            showAlert({
              title: errMsg,
              type: "error",
              confirm: "確認",
            });
            WriteLog("訂單資訊取得異常：" + JSON.stringify(errMsg));
          });
      }
      // 若此訂單存在於Sqlite，且曾打api抓過資料
      else if (vm.history[index] && vm.orderListDetail[orderNo]) {
        // 補印時會使用vm.paymentData
        // 從物件中拿到當前訂單資訊
        vm.paymentData = vm.paymentDataList[orderNo];
        vm.currentOrderListDetail = vm.orderListDetail[orderNo];
        kiosk.app.updateLoading(false);
      }
      // 訂單資訊異常
      else {
        // 補印時會使用vm.paymentData
        vm.paymentData = null;
        // 清空當前訂單資訊
        vm.currentOrderListDetail = null;
        kiosk.app.updateLoading(false);
        showAlert({
          title: "訂單資訊異常",
          type: "error",
          confirm: "確認",
        });
        WriteLog(
          "訂單資訊異常---SQLite：" +
          vm.history +
          ", index：" +
          index +
          ", orderNo：" +
          orderNo
        );
      }
    },
    ShowPrint: function (printType) {
      var vm = this;
      showAlert({
        title: "確認要重新列印？",
        type: "info",
        confirm: "列印",
        confirmFn: function () {
          switch (printType) {
            case 1:
              vm.PrintDetail();
              break;

            case 2:
              vm.PrintTicket();
              break;
          }
        },
        cancel: "取消",
      });
    },
    PrintTicket: function () {
      var vm = this;
      var count = 0;
      var length = vm.paymentData.productOrderList.length;
      var tmpprintType = "single";
      if (vm.paymentData.voucherMode == "PAYMENT") {
        length = 1;
        tmpprintType = "group";
      }
      BackEnd.AddActionLog(
        "4",
        "補印票券",
        JSON.stringify({
          member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_reprint",
          printType: tmpprintType,
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );

      /**
       * 因Ext 非問題無法使用map & for
       * 設置count = 0; 當count小於newArr長度時
       * 將地址傳入Ext後,回傳結果賦值給MASK_ADDR
       * count++ , Loop
       */
      kiosk.app.updateLoading(true);
      function goRePrint() {
        if (count < length) {
          var item = vm.paymentData.productOrderList[count];
          WriteLog("PrintTicket item : " + JSON.stringify(item));
          item.paymentSettingListName =
            vm.paymentData.paymentSettingList[0].name;
          if (!item.printable) {
            kiosk.app.updateLoading(false);
            showAlert({
              title: item.ticketTypeName + "-無法列印",
              type: "error",
              confirm: "確認",
              confirmFn: function () {
                // 待補
              },
            });
            return;
          }
          if (vm.paymentData.voucherMode == "PAYMENT") {
            // 團體出票
            printPayment(
              kiosk.BESync.TicketPrinterName,
              vm.paymentData,
              count,
              true
            )
              .then(function (res) {
                kiosk.app.updateLoading(false);
                BackEnd.AddPrintTicketCount(2, 1);
                BackEnd.AddActionLog(
                  "4",
                  "補印-團體出票 reprint/group",
                  JSON.stringify({
                    member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                    app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
                    behavior: "request_reprint",
                    printType: "group",
                    printCount: count,
                    version: kiosk.BESync ? kiosk.BESync.Version : "",
                  })
                );
                showAlert({
                  title: "列印成功",
                  type: "info",
                  confirm: "確認",
                });
              })
              .catch(function (msg) {
                kiosk.app.updateLoading(false);
                showAlert({
                  title: "列印失敗",
                  type: "error",
                  confirm: "確認",
                  // confirmFn: function () {
                  //     kiosk.API.idle.GoHome();
                  // }
                });
                WriteLog(msg);
              });
          } else {
            printTicket(kiosk.BESync.TicketPrinterName, item, count, true)
              .then(function (res) {
                count++;
                setTimeout(function () {
                  goRePrint();
                }, 0);
              })
              .catch(function (msg) {
                kiosk.app.updateLoading(false);
                showAlert({
                  title: "列印失敗",
                  type: "error",
                  confirm: "確認",
                  // confirmFn: function () {
                  //     kiosk.API.idle.GoHome();
                  // }
                });
              });
          }
        } else {
          kiosk.app.updateLoading(false);
          BackEnd.AddPrintTicketCount(2, count);
          BackEnd.AddActionLog(
            "4",
            "補印-個別出票 reprint/single",
            JSON.stringify({
              member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
              app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
              behavior: "request_reprint",
              printType: "single",
              printCount: count,
              version: kiosk.BESync ? kiosk.BESync.Version : "",
            })
          );
          showAlert({
            title: "列印成功",
            type: "info",
            confirm: "確認",
          });
        }
      }
      goRePrint();
    },
    PrintDetail: function (e) {
      var vm = this;
      kiosk.app.updateLoading(true);
      printDetails(kiosk.BESync.ReveivePrinterName, vm.paymentData, true)
        .then(function (res) {
          kiosk.app.updateLoading(false);
          showAlert({
            title: "列印成功",
            type: "info",
            confirm: "確認",
          });
        })
        .catch(function (msg) {
          kiosk.app.updateLoading(false);
          WriteLog("printDetail error : " + JSON.stringify(msg));
          showAlert({
            title: "列印失敗",
            type: "error",
            confirm: "確認",
          });
        });
    },
    // 重設現金水位
    resetCashBalance: function () {
      var vm = this;
      if (!kiosk.systemSetting.useICTCash) {
        return;
      }

      kiosk.app.updateLoading(true);

      // var setBanknoteBalance = new Promise(function (resolve, reject) {
      //   customLibDevice.CashBox.setNdNumber(
      //     kiosk.systemSetting.nd_stock.toString()
      //   )
      //     .then(function (res) {
      //       // 確保回傳資料格式正確，也避免產生JS錯誤
      //       var IfSuccess = false;
      //       try {
      //         if (typeof JSON.parse(res.resultJson) === "object") {
      //           IfSuccess = true;
      //         }
      //       } catch (err) {
      //         IfSuccess = false;
      //         handleError(
      //           "resetCashBalance - setBanknoteBalance - setNdNumber error",
      //           err
      //         );
      //         return;
      //       }

      //       if (IfSuccess & res.IsSuccess) {
      //         resolve(res);
      //       } else {
      //         handleError(
      //           "resetCashBalance - setBanknoteBalance - setNdNumber error",
      //           res
      //         );
      //       }
      //     })
      //     .catch(function (err) {
      //       handleError(
      //         "resetCashBalance - setBanknoteBalance - setNdNumber catch",
      //         err
      //       );
      //     });
      // });

      var getCashBalance = new Promise(function (resolve, reject) {
        customLibDevice.CashBox.deviceStatus()
          .then(function (res) {
            // 確保回傳資料格式正確，也避免產生JS錯誤
            var IfSuccess = false;
            try {
              if (typeof JSON.parse(res.resultJson) === "object") {
                IfSuccess = true;
              }
            } catch (err) {
              IfSuccess = false;
              handleError(
                "resetCashBalance - getCashBalance - deviceStatus error",
                err
              );
              reject(err);
              return;
            }

            if (IfSuccess && res.IsSuccess) {
              var result = JSON.parse(res.resultJson);
              if (
                !isNaN(result.cc1_stock) &&
                !isNaN(result.cc5_stock) &&
                !isNaN(result.cc10_stock) &&
                !isNaN(result.cc50_stock) &&
                // !isNaN(result.nd_stock) &&
                result.cc1_stock >= 0 &&
                result.cc5_stock >= 0 &&
                result.cc10_stock >= 0 &&
                result.cc50_stock >= 0
                // && result.nd_stock >= 0
              ) {
                // 存量參數正常
                WriteLog("Return Balance:" + JSON.stringify(result));

                kiosk.CashBox.cc1_stock_now = 0;
                kiosk.CashBox.cc5_stock_now = 0;
                kiosk.CashBox.cc10_stock_now = result.cc10_stock;
                kiosk.CashBox.cc50_stock_now = result.cc50_stock;

                // kiosk.CashBox.cc1_stock_now = result.cc1_stock;
                // kiosk.CashBox.cc5_stock_now = result.cc5_stock;
                // kiosk.CashBox.nd_stock_now = result.nd_stock;
                vm.$forceUpdate();

                resolve(res);
              } else {
                // 存量參數異常
                kiosk.app.deviceStatus.CASHBOX = 0;

                handleBalanceError();
                handleError(
                  "resetCashBalance - getCashBalance - deviceStatus error",
                  res
                );
                reject(res);
              }
            } else {
              kiosk.app.deviceStatus.CASHBOX = 0;
              handleBalanceError();
              handleError(
                "resetCashBalance - getCashBalance - deviceStatus error",
                res
              );
              reject(res);
            }
          })
          .catch(function (err) {
            kiosk.app.deviceStatus.CASHBOX = 0;

            handleBalanceError();
            handleError(
              "resetCashBalance - getCashBalance - deviceStatus catch",
              err
            );
            reject(err);
          });
      });

      Promise.all([getCashBalance])
        .then(function (res) {
          kiosk.app.updateLoading(false);
          vm.$forceUpdate();
          showAlert({
            title: "更新成功",
            // text: res,
            type: "success",
            confirm: "確認",
          });
        })
        .catch(function (err) {
          kiosk.app.updateLoading(false);
          vm.$forceUpdate();
          showAlert({
            title: "更新失敗，請重新嘗試",
            // text: res,
            type: "error",
            confirm: "確認",
          });
          handleError("resetCashBalance catch", err);
        });

      function handleBalanceError() {
        if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = 0;
        if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = 0;
        if (!kiosk.CashBox.cc10_stock_now)
          kiosk.CashBox.cc10_stock_now = "異常";
        if (!kiosk.CashBox.cc50_stock_now)
          kiosk.CashBox.cc50_stock_now = "異常";

        // if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = "異常";
        // if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = "異常";
        // if (!kiosk.CashBox.nd_stock_now) kiosk.CashBox.nd_stock_now = "異常";
      }

      function handleError(text, res) {
        WriteLog(text + "：" + JSON.stringify(res));
      }
    },
    refreshTotal: function () {
      var vm = this;
      var total = {
        ticketTypeName: "總計",
        paymentTotalPrice: 0,
        quantity: 0,
        DiffAmount: 0,
        transTotalPrice: 0,
        refundmentTotalPrice: 0,
        CrossRefundAmount: 0,
      };
      for (var i = 1; i < vm.posQueryReconciliationList.length; i++) {
        total.paymentTotalPrice +=
          vm.posQueryReconciliationList[i].paymentTotalPrice;
        total.quantity += vm.posQueryReconciliationList[i].quantity;
        total.DiffAmount += vm.posQueryReconciliationList[i].DiffAmount;
        total.transTotalPrice +=
          vm.posQueryReconciliationList[i].transTotalPrice;
        total.refundmentTotalPrice +=
          vm.posQueryReconciliationList[i].refundmentTotalPrice;
        total.CrossRefundAmount +=
          vm.posQueryReconciliationList[i].CrossRefundAmount;
      }
      vm.posQueryReconciliationList[0] = total;
      vm.$forceUpdate();
    },
    loadLogoutReportData: function () {
      var vm = this;
      vm.posQueryReconciliationList = [];
      var item = {};

      var posQueryReconciliationReq = {};


      getLogoutReportData();

      function getLogoutReportData() {
        var Reconciliation = new Promise(function (resolve, reject) {
          PalaceAPI.posQueryReconciliation(posQueryReconciliationReq)
            .then(function (res) {
              var total = {
                paymentSettingId: "總計",
                ticketTypeName: "總計",
                paymentTotalPrice: 0,
                quantity: 0,
                DiffAmount: 0,
                transTotalPrice: 0,
                refundmentTotalPrice: 0,
                CrossRefundAmount: 0,
              };
              vm.posQueryReconciliationList.push(total);
              kiosk.status.posQueryReconciliation = res;
              vm.paymentQuantity = res.paymentQuantity;
              vm.refundmentQuantity = res.refundmentQuantity;

              function groupBy(xs, key) {
                return xs.reduce(function (rv, x) {
                  (rv[x[key]] = rv[x[key]] || []).push(x);
                  return rv;
                }, {});
              }
              var paymentData = groupBy(
                res.paymentSettingList,
                "paymentSettingId"
              );
              var paymentDataKeys = Object.keys(paymentData);
              for (j = 0; j < paymentDataKeys.length; j++) {
                var itemDataObj = paymentData[paymentDataKeys[j]];

                item = {};
                // 付款方式
                item.ticketTypeName = itemDataObj[0].paymentSettingName;
                item.transTotalPrice = 0;
                item.refundmentTotalPrice = 0;
                item.CrossRefundAmount = 0;

                for (k = 0; k < itemDataObj.length; k++) {
                  // 銷售小計 (銷售金額)
                  item.transTotalPrice += itemDataObj[k].paymentTotalPrice;
                  // 退貨小計 (退款金額)
                  if (itemDataObj[k].currentDevice) {
                    item.refundmentTotalPrice -=
                      itemDataObj[k].refundmentTotalPrice;
                  }
                  // 退貨小計 (跨機台退款金額)
                  if (!itemDataObj[k].currentDevice) {
                    item.CrossRefundAmount -=
                      itemDataObj[k].refundmentTotalPrice;
                  }
                }
                // (收入 - 退款 - 跨機台退款) (應收金額)
                item.paymentTotalPrice =
                  item.transTotalPrice +
                  item.refundmentTotalPrice +
                  item.CrossRefundAmount;

                // TVM版
                item.quantity = item.paymentTotalPrice;
                item.DiffAmount = 0;

                // ---POS版可手動調整實收金額---
                // item.quantity = 0;
                // item.DiffAmount = item.paymentTotalPrice - item.quantity;
                // ---POS版可手動調整實收金額---

                total.transTotalPrice += item.transTotalPrice;
                total.refundmentTotalPrice += item.refundmentTotalPrice;
                total.CrossRefundAmount += item.CrossRefundAmount;
                total.paymentTotalPrice += item.paymentTotalPrice;

                vm.posQueryReconciliationList.push(item);
              }
              // for (i = 0; i < res.paymentSettingList.length; i++) {
              //     // console.log(i)
              //     if (!res.paymentSettingList[i].currentDevice) {
              //         continue;
              //     }
              //     item = {}
              //     // 付款方式
              //     item.ticketTypeName = res.paymentSettingList[i].paymentSettingName
              //     // 銷售小計 (銷售金額)
              //     item.transTotalPrice = res.paymentSettingList[i].paymentTotalPrice
              //     // 退貨小計 (退款金額)
              //     item.refundmentTotalPrice = -res.paymentSettingList[i].refundmentTotalPrice
              //     // 退貨小計 (跨機台退款金額)
              //     var CrossRefund = res.paymentSettingList.find(
              //         function (item, index, array) {
              //             if (res.paymentSettingList[i].paymentSettingId == item.paymentSettingId &&
              //                 !item.currentDevice) {
              //                 return true
              //             } else {
              //                 return false;
              //             }
              //         }
              //     )
              //     item.CrossRefundAmount = CrossRefund == null ? 0 : -CrossRefund.refundmentTotalPrice
              //     // (收入 - 退款 - 跨機台退款) (應收金額)
              //     item.paymentTotalPrice = item.transTotalPrice + item.refundmentTotalPrice + item.CrossRefundAmount
              //     item.quantity = 0
              //     item.DiffAmount = item.paymentTotalPrice - item.quantity

              //     total.transTotalPrice += item.transTotalPrice
              //     total.refundmentTotalPrice += item.refundmentTotalPrice
              //     total.CrossRefundAmount += item.CrossRefundAmount
              //     total.paymentTotalPrice += item.paymentTotalPrice

              //     vm.posQueryReconciliationList.push(item);
              // }

              // var pettyCashInt = parseInt(kiosk.sfAccount.pettyCash);

              var retryCashInt = 0;
              handleIfUseICTCash();

              function handleIfUseICTCash() {
                if (kiosk.systemSetting.useICTCash) {
                  if (
                    kiosk.CashBox.cc10_stock_now &&
                    kiosk.CashBox.cc50_stock_now
                    // && kiosk.CashBox.nd_stock_now
                  ) {
                    var ICTCashTotal =
                      kiosk.CashBox.cc10_stock_now * 10 +
                      kiosk.CashBox.cc50_stock_now * 50;

                    vm.posQueryReconciliationList.push({
                      paymentSettingId: "零用金",
                      ticketTypeName: "零用金",
                      paymentTotalPrice: ICTCashTotal,
                      quantity: ICTCashTotal,
                      DiffAmount: 0,
                      transTotalPrice: ICTCashTotal,
                      refundmentTotalPrice: 0,
                      CrossRefundAmount: 0,
                    });

                    retryCashInt = 0;
                    updateCurrentData();
                  } else {
                    if (retryCashInt < 40) {
                      retryCashInt++;
                      setTimeout(function () {
                        handleIfUseICTCash();
                      }, 200);
                    } else {
                      WriteLog(
                        "loadLogoutReportData - posQueryReconciliation - handleIfUseICTCash error - retryCashInt:" +
                        retryCashInt
                      );
                      retryCashInt = 0;
                      updateCurrentData();
                    }
                  }
                } else {
                  updateCurrentData();
                }
              }

              function updateCurrentData() {
                vm.thisPaymentSettingList = res.paymentSettingList.filter(
                  function (d) {
                    return d.currentDevice;
                  }
                );
                vm.otherPaymentSettingList = res.paymentSettingList.filter(
                  function (d) {
                    return !d.currentDevice;
                  }
                );

                vm.paymentTotalPrice = res.paymentTotalPrice;
                vm.refundmentTotalPrice = res.refundmentTotalPrice;
                vm.refreshTotal();
                // WriteLog(
                //   "posQueryReconciliation then --- vm.posQueryReconciliationList" +
                //     JSON.stringify(vm.posQueryReconciliationList)
                // );
                vm.$forceUpdate();
                resolve();
              }
            })
            .catch(function (errMsg) {
              WriteLog(
                "loadLogoutReportData - getLogoutReportData - posQueryReconciliation catch:" +
                JSON.stringify(errMsg)
              );
              kiosk.app.updateLoading(false);
              showAlert({
                title: errMsg,
                type: "error",
                confirm: "確認",
                confirmFn: function () { },
              });
              reject(errMsg);
            });
        });

        var DailySaleReport = new Promise(function (resolve, reject) {
          // PalaceAPI.posQueryDailySaleReport(kiosk.sfAccount.username)
          PalaceAPI.posQueryDailySaleReport(posQueryReconciliationReq)
            .then(function (res) {
              vm.totalSaleQuantity = res.totalSaleQuantity;
              vm.totalRefundQuantity = res.totalRefundQuantity;
              vm.saleProductSummary = res.saleProductSummary;
              vm.refundProductSummary = res.refundProductSummary;
              vm.$forceUpdate();
              resolve(res);
              console.log("end1");
            })
            .catch(function (errMsg) {
              WriteLog(
                "loadLogoutReportData - getLogoutReportData - posQueryDailySaleReport catch:" +
                JSON.stringify(errMsg)
              );
              kiosk.app.updateLoading(false);
              showAlert({
                title: errMsg,
                type: "error",
                confirm: "確認",
                confirmFn: function () { },
              });
              reject(errMsg);
            });
        });

        Promise.all([Reconciliation, DailySaleReport])
          .then(function (res) {
            handleLogoutReportData();
          })
          .catch(function (err) { });

        function handleLogoutReportData() {
          var tmpItemTitle = "";
          var tmpItemTitleLen = 0;
          var tmpItemEnd = "";
          var tmpItemEndLen = 0;

          var startDT = moment(
            kiosk.status.posQueryReconciliation.startTime,
            "YYYYMMDDHHmmss"
          ).format("YYYY/MM/DD HH:mm");
          var endDT = moment(
            kiosk.status.posQueryReconciliation.endTime,
            "YYYYMMDDHHmmss"
          ).format("HH:mm");
          var paraseNumber = function (src) {
            return isNaN(src) ? 0 : parseInt(src);
          };
          var printData = {
            // TotalReceivable: 500,
            TotalReceivable: paraseNumber(vm.posQueryReconciliationList[0].paymentTotalPrice),
            PaymentList: vm.posQueryReconciliationList,
            PaymentCount: paraseNumber(vm.paymentQuantity),
            PaymentCountList: vm.saleProductSummary,
            RefundCount: paraseNumber(vm.refundmentQuantity),
            RefundCountList: vm.refundProductSummary,

            TotalSaleQuantity: paraseNumber(vm.totalSaleQuantity),
            TotalRefundQuantity: paraseNumber(vm.totalRefundQuantity),
            dateTimeRange: startDT + " ~ " + endDT,
            userName: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            generateStr: "",
            generateStrPrice: "",

            deviceName: kiosk.systemSetting.deviceName,
            now: moment().format("YYYY/MM/DD HH:mm"),
          };
          if (printData.PaymentList && printData.PaymentList.length != 0) {
            printData.generateStrPrice += sfPaddingStr(
              "應收總額 : ",
              "$ " + (paraseNumber(printData.TotalReceivable))
            );
            for (var p in printData.PaymentList) {
              printData.generateStrPrice += sfPaddingStr(
                "  " + printData.PaymentList[p].ticketTypeName,
                "$ " + (paraseNumber(printData.PaymentList[p].paymentTotalPrice))
              );
              printData.generateStrPrice +=
                "  (實收金額 $ " +
                (printData.PaymentList[p].ticketTypeName !== "總計"
                  ? (paraseNumber(printData.PaymentList[p].quantity))
                  : (paraseNumber(printData.PaymentList[p].paymentTotalPrice))) +
                ", 差異 " +
                (paraseNumber(printData.PaymentList[p].DiffAmount)) +
                ")\r\n";
            }
          }
          if (printData.PaymentCount && printData.PaymentCount != 0) {
            printData.generateStrPrice += sfPaddingStr(
              "交易成功 : ",
              printData.PaymentCount + " 筆"
            );
            var temp = printData.PaymentList.filter(function (res) {
              if (res.transTotalPrice > 0) {
                // alert("true  : " + JSON.stringify(res))
                return true;
              } else {
                // alert("false : " + JSON.stringify(res))
                return false;
              }
            });
            for (var p in temp) {
              printData.generateStrPrice += sfPaddingStr(
                "  " + temp[p].ticketTypeName,
                "$ " + (paraseNumber(temp[p].transTotalPrice))
              );
            }
          }
          if (printData.RefundCount && printData.RefundCount != 0) {
            printData.generateStrPrice += sfPaddingStr(
              "退款成功 : ",
              printData.RefundCount + " 筆"
            );
            var temp = printData.PaymentList.filter(function (res) {
              if (res.refundmentTotalPrice + res.CrossRefundAmount < 0) {
                return true;
              } else {
                return false;
              }
            });
            for (var p in temp) {

              printData.generateStrPrice += sfPaddingStr(
                "  " + temp[p].ticketTypeName,
                "$ " +
                (paraseNumber(temp[p].refundmentTotalPrice) + paraseNumber(temp[p].CrossRefundAmount))
              );
            }
          }

          printData.generateStr += sfPaddingStr(
            "\r\n銷售數量明細",
            "* " + printData.TotalSaleQuantity
          );
          tag = "└";
          count = 0;
          for (var k in vm.saleProductSummary) {
            printData.generateStr += vm.saleProductSummary[k].name + "\r\n";
            count = 0;
            for (var p in vm.saleProductSummary[k].detail) {
              count += paraseNumber(vm.saleProductSummary[k].detail[p].quantity);
              tmpItemTitle =
                " " + tag + vm.saleProductSummary[k].detail[p].name;
              tmpItemEnd = " * " + paraseNumber(vm.saleProductSummary[k].detail[p].quantity);
              printData.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
            }
            printData.generateStr += sfPaddingStr("", "總套數 : " + count);
          }

          printData.generateStr += sfPaddingStr(
            "\r\n銷退數量明細",
            "* " + printData.TotalRefundQuantity
          );
          tag = "└";
          count = 0;
          for (var k in vm.refundProductSummary) {
            printData.generateStr += vm.refundProductSummary[k].name + "\r\n";
            count = 0;
            for (var p in vm.refundProductSummary[k].detail) {
              count += (paraseNumber(vm.refundProductSummary[k].detail[p].quantity));
              tmpItemTitle =
                " " + tag + vm.refundProductSummary[k].detail[p].name;
              tmpItemEnd =
                " * " + vm.refundProductSummary[k].detail[p].quantity;
              printData.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
            }
            printData.generateStr += sfPaddingStr("", "總套數 : " + count);
          }

          // if (!vm.inputSwitch) {
          //   printData.generateStr = "";
          // }
          kiosk.status.LogoutReportPrintData = printData;
        }
      }
    },
    PrintLogoutReport: function () {
      var vm = this;
      kiosk.systemSetting.lang = "zh_TW";
      return new Promise(function (resolve, reject) {
        var retryPrint = 0;
        PrintTicket();

        function PrintTicket() {
          if (!kiosk.status.LogoutReportPrintData) {
            if (retryPrint < 40) {
              retryPrint++;
              setTimeout(function () {
                PrintTicket();
              }, 200);
              return;
            } else {
              reject(
                "PrintLogoutReport - print error - retryPrint:" +
                String(retryPrint)
              );
            }
          }

          BackEnd.AddActionLog(
            "4",
            "交班報表列印",
            JSON.stringify({
              member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
              app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
              behavior: "request_print",
              printType: "close",
              printCount: 1,
              version: kiosk.BESync ? kiosk.BESync.Version : "",
            })
          );

          customLibDevice.Thermal.Print(
            kiosk.BESync.ReveivePrinterName,
            "PrintLogoutReport",
            kiosk.status.LogoutReportPrintData
          )
            .then(function (res) {
              WriteLog("PrintLogoutReport - print then:" + JSON.stringify(res));
              resolve(res);
            })
            .catch(function (err) {
              WriteLog(
                "PrintLogoutReport - print catch:" + JSON.stringify(err)
              );
              // reject("列印失敗");
              reject(err);
            });
        }
      });
    },
  },
  created: function () {
    this.checkDevice();
  },
  mounted: function () {
    var vm = this;

    this.$nextTick(function () {
      vm.initSwiper();
    });

    kiosk.status.keyinValue = "";
    kiosk.status.CheckPassword = "";
    kiosk.status.orderListPage = 1;
    kiosk.status.maxOrderListPage = 1;
    
    kiosk.app.updateLoading(true);

    vm.getLocalTrans()
      .then(function (res) {
        // 若有訂單紀錄
        if (res.length !== 0) {
          var orderPerPage = 11;
          var orderCount = res.length;
          var currentPageOrder = [];
          vm.allHistory = res;
          if (orderCount >= orderPerPage) {
            orderCount % orderPerPage === 0
              ? (kiosk.status.maxOrderListPage = orderCount / orderPerPage)
              : (kiosk.status.maxOrderListPage =
                Math.floor(orderCount / orderPerPage) + 1);
          }
          for (var i = 0; i < orderPerPage; i++) {
            if (!res[i]) break;
            currentPageOrder.push(res[i]);
          }
          vm.history = currentPageOrder;
          // kiosk.status.orderListSwiper = true;
        }
        // 若無訂單紀錄
        else if (res.length === 0) {
          vm.history = undefined;
        } else {
          vm.history = null;
        }
      })
      .catch(function (err) {
        // 若發生異常
        vm.history = null;
        WriteLog("SQLite訂單資料取得失敗：" + JSON.stringify(err));
      });

    //交班表資料紙只能列印中文和英文

    // switch (kiosk.systemSetting.lang) {
    //   case "zh_TW":
    //     kiosk.systemSetting.lang = "zh_TW";
    //     break;
    //   default:
    //     kiosk.systemSetting.lang = "en_US";
    //     break;

    // }

    // 打API取得交班表資料
    vm.loadLogoutReportData();

    kiosk.app.updateLoading(false);
    vm.$forceUpdate();
  },
  updated: function () {
    var vm = this;
    // alert("updated");

    this.$nextTick(function () {
      vm.initSwiper();
    });
  },
  beforeDestroy: function () {
    kiosk.status.LogoutReportPrintData = undefined;
    // kiosk.status.orderListSwiper = false;
  },
});

// NavBar
Vue.component("component-admin-navBar", {
  props: ["culture", "model"],
  template: "#template-admin-navBar",
  data: function () {
    return {
      showHome: true,
    };
  },
  created: function () { },
  methods: {
    goHome: function (nextId) {
      kiosk.API.goToNext("mainMenu");
    },
  },
});
