// MainPage
Vue.component("component-deviceOpen-main", {
  props: ["model"],
  template: "#template-deviceOpen-main",
  data: function () {
    return {
      count: 0,
      showExit: false,
      BESync: "",
      message: "",
      KMSSetting: "",
      CashBoxMsg: "",
      printerMsg: "",
      SecondMonitorMsg: "",
      result: "",
    };
  },
  methods: {
    goNext: function () {
      kiosk.API.goToNext("rigister");
    },
    DeviceOpen: function () {
      var vm = this;

      var CashBox_OPEN = new Promise(function (resolve, reject) {
        // 非測試狀態
        if (!testFlag.viewDebugger) {
          if (kiosk.systemSetting.useICTCash) {
            customLibDevice.CashBox.closeDevice()
              .then(function (res) {
                customLibDevice.CashBox.openDevice()
                  .then(function (res) {
                    checkIfconnected().then(function (res) {
                      if (kiosk.app.deviceStatus.CASHBOX == 1) {
                        resolve();
                      } else {
                        reject();
                      }
                    });
                  })
                  .catch(function (err) {
                    if (vm.CashBoxMsg == "") {
                      vm.CashBoxMsg += "現金模組開啟失敗";
                    }
                    WriteLog(
                      "CashBox - openDevice error" + JSON.stringify(err)
                    );
                    kiosk.app.deviceStatus.CASHBOX = 0;
                    reject();
                  });
              })
              .catch(function (err) {
                if (vm.CashBoxMsg == "") {
                  vm.CashBoxMsg += "現金模組開啟失敗";
                }
                WriteLog("CashBox - openDevice error" + JSON.stringify(err));
                kiosk.app.deviceStatus.CASHBOX = 0;
                reject();
              });
            function checkIfconnected() {
              return new Promise(function (resolve, reject) {
                function handleErr(err) {
                  if (vm.CashBoxMsg == "") {
                    vm.CashBoxMsg += "現金模組開啟失敗";
                  }
                  WriteLog("CashBox - openDevice error" + JSON.stringify(err));
                  kiosk.app.deviceStatus.CASHBOX = 0;
                }

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
                      WriteLog(
                        "CashBox_OPEN - checkIfconnected - deviceStatus error",
                        err
                      );
                      handleErr(err);
                      resolve(err);
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
                        // 正常
                        WriteLog("Return Balance:" + JSON.stringify(result));
                        vm.CashBoxMsg += "現金模組開啟成功";
                        kiosk.app.deviceStatus.CASHBOX = 1;
                        resolve(res);
                      } else {
                        handleErr(res);
                        resolve(res);
                      }
                    } else {
                      handleErr(res);
                      resolve(res);
                    }
                  })
                  .catch(function (err) {
                    handleErr(err);
                    resolve(err);
                  });
              });
            }
          } else {
            resolve();
          }
        }
        // 測試狀態
        else {
          // vm.CashBoxMsg += "現金模組暫時ByPass";
          resolve();
        }
      });

      var SecondMonitor_OPEN = new Promise(function (resolve, reject) {
        // 非測試狀態
        if (!testFlag.viewDebugger) {
          var jsonData = {
            PlayListFile: "C:\\ITKiosk\\html\\content\\ad.mpcpl",
          };
          External.KioskCommon.CommonService.OpenSecondMonitor(
            JSON.stringify(jsonData),
            function (res) {
              if (JSON.parse(res).isSuccess) {
                vm.SecondMonitorMsg += "廣告開啟成功";
                resolve();
              } else {
                vm.SecondMonitorMsg += "廣告開啟失敗";
                reject();
              }
            }
          );
        }
        // 測試狀態
        else {
          vm.SecondMonitorMsg += "廣告暫時ByPass";
          resolve();
        }
      });

      var TicketPrint_OPEN = new Promise(function (resolve, reject) {
        // 非測試狀態
        if (!testFlag.viewDebugger) {
          // vm.printerMsg += "出票機ByPass";
          // resolve();
          customLibDevice.Thermal.Status()
            .then(function (res) {
              vm.printerMsg += "出票機偵測成功";
              resolve();
            })
            .catch(function (res) {
              vm.printerMsg += "出票機偵測失敗";
              reject();
            });
        }
        // 測試狀態
        else {
          vm.printerMsg += "出票機暫時ByPass";
          resolve();
        }
      });

      // 所有裝置Promise統一處理
      Promise.all([CashBox_OPEN, SecondMonitor_OPEN, TicketPrint_OPEN])
        .then(function () {
          commonExt.setJson("systemSetting", kiosk.systemSetting);
          vm.result += "設備檢查完成\n";
          if (vm.clickTimer != null) clearInterval(vm.clickTimer);
          if (
            kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.msg ===
            "請先註冊設備"
          ) {
            showAlert({
              title:
                kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.msg,
              type: "info",
              timer: 4000,
              timerFn: function () {
                kiosk.API.goToNext("register");
              },
            });
          } else {
            setTimeout(function () {
              kiosk.API.goToNext("mainMenu");
            }, 5000);
          }
        })
        .catch(function () {
          vm.showExit = true;
          setTimeout(function () {
            vm.result += "檢查失敗，請洽服務人員\n";
            setTimeout(function () {
              kiosk.API.goToNext("mainMenu");
            }, 3000);
          }, 3000);
        });
    },
    MouseClick: function () {
      var vm = this;
      if (kiosk.currentModelKey !== "deviceOpen") {
        return;
      }
      External.KioskCommon.CommonService.MouseClick(
        "",
        function (res) {},
        function () {}
      );
    },
  },
  created: function () {
    kiosk.API.initStatus();
  },
  mounted: function () {
    var vm = this;
    debugger
    vm.MouseClick();
    vm.clickTimer = setInterval(vm.MouseClick, 10000);

    if (!kiosk.app.deviceStatus) {
      kiosk.app.deviceStatus = {};
    }

    this.$nextTick(function () {
      vm.BESync = "KMS資料同步中...";
      vm.message = "FONTRIP資料取得中...";
      vm.KMSSetting = "KMS Setting...";

      commonExt
        .getJson("systemSetting")
        .then(function (res) {
          kiosk.app.updateLoading(false);
          if (!res.printCount) {
            res.printCount = 0;
          }
          if (!res.ReceiptPrinterNearEndPrintCount) {
            res.ReceiptPrinterNearEndPrintCount = 0;
          }
          if (!res.ReceiptPrinterNearEndPrintLimit) {
            res.ReceiptPrinterNearEndPrintLimit = "0";
          }
          kiosk.systemSetting = res;
          return BackEnd.GetBasicData(
            kiosk.systemSetting && kiosk.systemSetting.DataVersion
              ? kiosk.systemSetting.DataVersion
              : ""
          );
        })
        .then(function (res) {
          return updateBESync(res);
        })
        .then(function (res) {
          vm.BESync += "  完成";
          return res;
        })
        .catch(function (err) {
          alert(JSON.stringify(err));
          vm.BESync += "  略過";
          return commonExt.getJson("BESync");
        })
        .then(function (res) {
          switch (kiosk.BESync.KioskType) {
            case "1":
              kiosk.systemSetting.appName = "FLYTECH_POS";
              break;

            case "2":
              kiosk.systemSetting.appName = "FLYTECH_TVM";
              break;

            case "4":
              kiosk.systemSetting.appName = "FLYTECH_PASS";
              break;

            default:
              break;
          }
          return PalaceAPI.posCheckDevice();
        })
        .then(function (res) {
          kiosk.systemSetting.DataVersion = kiosk.BESync.DataVersion;
          kiosk.systemSetting.settleFailTiming = "";

          var index = kiosk.BESync.PayTypes.findIndex(function (res) {
            return res.PayTypeAction === "ICTCash";
          });
          if (index != -1) {
            kiosk.systemSetting.useICTCash = true;
          } else {
            kiosk.systemSetting.useICTCash = false;
          }
          return updateSystemSettingDeviceInfo(res);
        })
        .then(function (res) {
          vm.message += "  成功";
          return;
        })
        .catch(function (err) {
          // vm.showExit = true;
          vm.message += "  失敗";
        })
        .then(function () {
          function GetKMSSetting() {
            return new Promise(function (resolve, reject) {
              commonExt
                .getJson("KMSSetting")
                .then(function (res) {
                  vm.KMSSetting += "  完成";
                  resolve();
                })
                .catch(function (err) {
                  vm.showExit = true;
                  vm.KMSSetting += "  失敗";
                  resolve();
                });
            });
          }
          function DeleteLog() {
            //FilePath：刪除的路徑。例如：C:\ITKiosk\log
            //Days：幾天前的檔案。例如：3
            //DeleteType：固定值，刪除的類型。File：刪除檔案、Folder：資料夾
            //FileExtension：附檔名名稱(當DeleteType=File時，才有使用；如果為空白時，則全部刪除)。例如：log
            External.KioskCommon.CommonService.DeleteFile(
              JSON.stringify({
                FilePath: "C:\\ITKiosk\\log",
                Days: kiosk.systemSetting.ClearDays,
                DeleteType: "Folder",
                FileExtension: "",
              })
            );
          }

          GetKMSSetting()
            .then(function () {
              DeleteLog();
              WriteLog(
                "刪除舊log: " +
                  JSON.stringify({
                    FilePath: "C:\\ITKiosk\\log",
                    Days: kiosk.systemSetting.ClearDays,
                    DeleteType: "Folder",
                    FileExtension: "",
                  })
              );
            })
            .then(function () {
              if (!vm.showExit) {
                vm.DeviceOpen();
              } else {
                setTimeout(function () {
                  vm.result += "後端資訊錯誤，請洽服務人員\n";
                  if (vm.clickTimer != null) clearInterval(vm.clickTimer);
                  StartErrorNotify();
                }, 5000);
              }
            })
            .catch(function () {
              vm.showExit = true;
              setTimeout(function () {
                vm.result += "後端資訊錯誤，請洽服務人員\n";
                if (vm.clickTimer != null) clearInterval(vm.clickTimer);
                StartErrorNotify();
              }, 5000);
            });
        })
        .catch(function () {
          vm.showExit = true;
          vm.result += "啟動失敗\n";
          if (vm.clickTimer != null) clearInterval(vm.clickTimer);
          StartErrorNotify();
        });
    });

    function StartErrorNotify() {
      if (!kiosk.status.StartErrorNotify) {
        kiosk.status.StartErrorNotify = true;
        vm.timer = setInterval(BackEnd.KioskNotify("服務啟動異常。"), 300000);
      }
    }
  },
  beforeDestroy: function () {
    if (this.timer != null) clearInterval(this.timer);
    if (this.clickTimer != null) clearInterval(this.clickTimer);
    kiosk.status.StartErrorNotify = false;
  },
});
