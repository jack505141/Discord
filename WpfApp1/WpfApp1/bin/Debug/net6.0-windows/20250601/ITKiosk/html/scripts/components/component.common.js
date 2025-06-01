Vue.component("component-TVMcommon-navBar", {
  template: "#template-TVMcommon-navBar",
  props: ["culture", "isShowBack", "isShowHome", "model"],
  data: function () {
    return {
      activeLang: this.culture,
      CONNECTSTATUS: undefined,
      clockT: "",
      clockD: "",
      Back: "",
      modal: kiosk.app.currentNavBar,
      // 熱感
      PRINTERSTATUE: undefined,
      // 出票
      TSCSTATUS: undefined,
    };
  },
  methods: {
    handleMouseDown: function (nextId) {
      kiosk.API.goToNext(nextId);
    },
    changeCulture: function (el) {
      kiosk.API.changeCulture(kiosk.enum.culture[el]);
      // alert(kiosk.culture)
      kiosk.currentCulture = returnCulture[kiosk.culture];
      // alert(kiosk.currentCulture)
    },
    isActive: function (culture) {
      var result = this.culture == culture;
      return result;
    },
    checkConnectStatus: function () {
      var vm = this;
      if (!testFlag.viewDebugger) {
        if (
          kiosk.currentModelKey !== "Payment" &&
          kiosk.currentModelKey !== "PaySuccess"
        ) {
          var cacheBuster = "?cb=" + Date.now();
          axios
            .get("https://www.google.com/" + cacheBuster)
            .then(function (response) {
              if (response.status == "200") {
                vm.CONNECTSTATUS = true;
                kiosk.app.deviceStatus.CONNECTSTATUS = true;
              } else {
                vm.CONNECTSTATUS = false;
                kiosk.app.deviceStatus.CONNECTSTATUS = false;
              }
            })
            .catch(function (error) {
              vm.CONNECTSTATUS = false;
              kiosk.app.deviceStatus.CONNECTSTATUS = false;
            });
        }
      }
    },
    checkServerAlive: function () {
      var vm = this;
      if (!testFlag.testFlag) {
        // --- Connect Check START ---
        var cacheBuster = "?cb=" + Date.now();
        axios
          .get(kiosk.BESync.APIURL + "admin/checkServerAlive" + cacheBuster)
          .then(function (response) {
            WriteLog("checkServerAlive--傳出：" + JSON.stringify(response));
            if (response.status == "200") {
              vm.CONNECTSTATUS = true;
              kiosk.app.deviceStatus.CONNECTSTATUS = true;
              kiosk.app.deviceStatus.isServerAlive = true;
            } else {
              vm.CONNECTSTATUS = false;
              kiosk.app.deviceStatus.CONNECTSTATUS = false;
              kiosk.app.deviceStatus.isServerAlive = false;
            }
            vm.$forceUpdate();
          })
          .catch(function (error) {
            WriteLog("checkServerAlive--傳出：" + JSON.stringify(error));
            BackEnd.AddActionLog(
              "2",
              "checkServerAlive",
              JSON.stringify(error)
            );
            vm.CONNECTSTATUS = false;
            kiosk.app.deviceStatus.CONNECTSTATUS = false;
            kiosk.app.deviceStatus.isServerAlive = false;
            vm.$forceUpdate();
          });
        // --- Connect Check E N D ---
      }
    },
    clockFn: function () {
      var clock = moment();
      var week = ["日", "一", "二", "三", "四", "五", "六"];
      this.clockT = clock.format("HH:mm");
      kiosk.status.clockT = clock.format("HH:mm");
      this.clockD =
        clock.format("YYYY-MM-DD") + " (" + week[clock.weekday()] + ")";
      kiosk.status.clockD =
        clock.format("YYYY-MM-DD") + " (" + week[clock.weekday()] + ")";
    },
    goBack: function () {
      if (kiosk.status.goBack != null) {
        kiosk.status.goBack();
        return;
      } else {
        this.goHome();
      }
      // if (kiosk.status.ticketTotalNum && kiosk.status.ticketTotalNum > 0) {
      //   // this.checkBuyList()
      // } else {
      //   kiosk.API.goToNext(this.goBackKey)
      // }
    },
    goHome: function () {
      this.checkBuyList();
    },
    checkBuyList: function () {
      var vm = this;
      var sp_config = {
        spTitleText: viewModel[kiosk.culture]["TVMcommon"].spTitleText,
        spContentTitle: viewModel[kiosk.culture]["TVMcommon"].spContentTitle,
        // spContentText: '訂單編號 : PN1371330858<br>#123-12345678',
        spBtnLeftText:
          '<img src="./img/Path5751.png" alt="">   ' +
          viewModel[kiosk.culture]["TVMcommon"].spBtnLeftText,
        // spBtnLeftFn: function () {},
        spBtnRightText:
          '<img src="./img/MaskGroup3.png" alt="">   ' +
          viewModel[kiosk.culture]["TVMcommon"].spBtnRightText,
        spBtnRightFn: function () {
          kiosk.API.goToNext("mainMenu");
        },
      };
      TVMSwal(sp_config);
    },
  },
  created: function () {
    this.CONNECTSTATUS = kiosk.app.deviceStatus.CONNECTSTATUS;
    this.Back = viewModel[kiosk.culture]["TVMcommon"].goBack;
    this.clockT = kiosk.status.clockT;
    this.clockD = kiosk.status.clockD;
    this.checkConnectStatus();
    this.checkServerAlive();
    this.clockFn();
    console.log(this.modal + " created");
  },
  mounted: function () {
    this.clockTimer = setInterval(this.clockFn, 1000);
    this.connectStatusTimer = setInterval(this.checkConnectStatus, 5000);
    this.serverAliveTimer = setInterval(this.checkServerAlive, 300000);
  },
  beforeDestroy: function () {
    if (this.checkDevicetimer != null) clearTimeout(this.checkDevicetimer);
    if (this.clockTimer != null) clearTimeout(this.clockTimer);
    if (this.connectStatusTimer != null) clearTimeout(this.connectStatusTimer);
    if (this.serverAliveTimer != null) clearTimeout(this.serverAliveTimer);
    console.log(this.modal + " beforeDestroy");
  },
});

Vue.component("component-common-footer", {
  template: "#template-common-foot",
  props: ["culture", "model"],

  data: function () {
    var _data = $.extend(
      {
        loading: true,
        showNext: true,
        showBack: true,
        showCancel: true,
        enableNext: false,
        enableBack: false,
        enableCancel: false,
        callback: undefined,
      },
      this.model
    );
    kiosk.app.currentFootModel = _data;
    return _data;
  },
  methods: {
    backHome: function () {
      swal({
        title: "您將返回首頁",
        text: "確定返回嗎？",
        type: "info",
        cancelButtonText: "取消",
        showCancelButton: true,
        confirmButtonText: "返回",
      }).then(function (isConfirm) {
        if (isConfirm.value) {
          kiosk.API.log.logInfo(
            "點擊返回，目前在：" + kiosk.currentModelKey + "頁"
          );
          kiosk.API.goToNext("mainMenu");
        } else if (isConfirm.dismiss === "cancel") {
          kiosk.API.log.logInfo("點擊取消");
          return;
        }
      });
    },
  },
  computed: {
    disableNext: function () {
      return !this.enableNext && this.directPage;
    },
    disableBack: function () {
      return !this.enableBack && this.backPage;
    },
    disableCancel: function () {
      return !this.enableCancel;
    },
  },
});

Vue.component("component-common-langmenu", {
  template: "#template-navbar-common-culture",
  props: ["culture"],
  data: function () {
    return {
      activeLang: this.culture,
      CONNECTSTATUS: undefined,
    };
  },
  methods: {
    handleMouseDown: function (nextId) {
      kiosk.API.goToNext(nextId);
    },
    changeCulture: function (el) {
      kiosk.API.changeCulture(kiosk.enum.culture[el]);
      // alert(kiosk.culture)
      kiosk.currentCulture = returnCulture[kiosk.culture];
      // alert(kiosk.currentCulture)
    },
    isActive: function (culture) {
      var result = this.culture == culture;
      return result;
    },
    checkDevice: function () {
      // console.log(Date());
      var vm = this;
      if (!testFlag.viewDebugger) {
        // //--- Printer Check START ---
        // customLibDevice.Thermal.Status()
        //     .then(function (res) {
        //         vm.PRINTERSTATUE = true;
        //         kiosk.app.deviceStatus.PRINTERSTATUE = true;
        //         if (kiosk.BESync.TicketPrinterName != 'TSP-247') {
        //             vm.PRINTERSTATUE = '1'
        //             kiosk.app.deviceStatus.PRINTERSTATUE = '1'
        //             vm.TSCSTATUS = '1'
        //             kiosk.app.deviceStatus.TSCSTATUS = '1'
        //         }
        //         vm.$forceUpdate();
        //     })
        //     .catch(function (res) {
        //         vm.PRINTERSTATUE = false;
        //         kiosk.app.deviceStatus.PRINTERSTATUE = false;
        //         if (kiosk.BESync.TicketPrinterName != 'TSP-247') {
        //             if (res.IsNearEnd) {
        //                 vm.PRINTERSTATUE = '2'
        //                 kiosk.app.deviceStatus.PRINTERSTATUE = '2'
        //                 vm.TSCSTATUS = '2'
        //                 kiosk.app.deviceStatus.TSCSTATUS = '2'
        //             } else {
        //                 vm.PRINTERSTATUE = '0'
        //                 kiosk.app.deviceStatus.PRINTERSTATUE = '0'
        //                 vm.TSCSTATUS = '0'
        //                 kiosk.app.deviceStatus.TSCSTATUS = '0'
        //             }
        //         }
        //         vm.$forceUpdate();
        //     })
        // // kiosk.API.Device.Thermal.getStatus(kiosk.BESync.TicketPrinterName, function (res) {
        // //     // alert(JSON.stringify(res));
        // //     if (res.IsSuccess) {
        // //         vm.PRINTERSTATUE = true;
        // //         kiosk.app.deviceStatus.PRINTERSTATUE = true;
        // //     } else {
        // //         vm.PRINTERSTATUE = false;
        // //         kiosk.app.deviceStatus.PRINTERSTATUE = false;
        // //     }
        // //     vm.$forceUpdate();
        // // })
        // // //--- Printer Check E N D ---

        // //--- Ticket Printer Check START ---
        // if (kiosk.BESync.TicketPrinterName == 'TSP-247') {
        //     kiosk.API.Device.TSC247Lib.GetStatus(function (result) {
        //         if (result.IsSuccess == true) {
        //             vm.TSCSTATUS = true;
        //             kiosk.app.deviceStatus.TSCSTATUS = true;
        //         } else {
        //             vm.TSCSTATUS = false;
        //             kiosk.app.deviceStatus.TSCSTATUS = false;
        //         }
        //     })
        // }
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
        //--- Connect Printer Check E N D ---
      }
    },
    clockFn: function () {
      this.clock = moment();
    },
    goBack: function () {
      kiosk.API.goToNext("mainMenu");
    },
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
    },
  },
  created: function () {
    this.CONNECTSTATUS = kiosk.app.deviceStatus.CONNECTSTATUS;
    this.checkDevice();
  },
  mounted: function () {
    this.timer = setInterval(this.checkDevice, 5000);
    this.clockTimer = setInterval(this.clockFn, 1000);
  },
  beforeDestroy: function () {
    clearTimeout(this.timer);
    clearTimeout(this.clockTimer);
  },
});

Vue.component("component-common-loading", {
  template: "#template-common-loading",
  props: ["culture"],
  data: function () {
    return {};
  },
  methods: {},
  mounted: function () {},
});

Vue.component("component-common-dailogbox", {
  template: "#template-common-dailogbox",
  props: ["culture", "model"],
  data: function () {
    return {};
  },
  methods: {
    delegate: function (callback) {
      if (callback) {
        callback();
      }
      kiosk.app.clearDailogBox();
    },
  },
  mounted: function () {
    var vm = this;
    if (this.model.timer) {
      this.model.timer();
    }
  },
});
