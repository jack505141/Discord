var WriteLogFlag = true;

function WriteLog(log) {
  if (WriteLogFlag) {
    WriteLogFlag = false;
    External.KioskCommon.CommonService.WriteLog(
      log,
      function (res) {
        WriteLogFlag = true;
        // alert(JSON.stringify(res));
      },
      function () {}
    );
  } else {
    setTimeout(function () {
      return WriteLog(log);
    }, 1);
  }
}

var commonExt = {
  /**
   * 傳入json檔名,resolve取得的資料,retry3次,失敗reject
   * @param {String} fileName
   */
  getJson: function (fileName) {
    return new Promise(function (resolve, reject) {
      var retryCount = 0;
      var storageType = "";

      function getSqliteData() {
        storageType = "Sqlite";
        var _getSystemInfo = {
          SystemInfoKey: fileName,
        };
        External.TicketingServiceBizExt.TicketingService.getSystemInfo(
          JSON.stringify(_getSystemInfo),
          CheckRes(),
          function () {}
        );
      }

      function getJsonFile() {
        storageType = "Json";
        var json_string = {
          FilePath:
            "C:\\ITKiosk\\ExtermalSettings\\PalaceTVM\\" + fileName + ".json",
        };
        External.KioskCommon.CommonService.GetAssignData(
          JSON.stringify(json_string),
          CheckRes(),
          function () {}
        );
      }

      function CheckRes() {
        return function (res) {
          if (JSON.parse(res).isSuccess) {
            try {
              if (
                storageType === "Sqlite" &&
                (JSON.parse(res).result === null ||
                  JSON.parse(res).result.SystemInfoValue === "{}")
              ) {
                if (fileName === "BESync") {
                  BackEnd.GetBasicData("")
                    .then(function (res) {
                      return modifyBasicDataToBESync(res);
                    })
                    .then(function (res) {
                      setTimeout(function () {
                        getSqliteData();
                      }, 0);
                    })
                    .catch(function (err) {
                      WriteLog(
                        fileName + " getJson fail " + JSON.stringify(err)
                      );
                      reject("取得" + fileName + "異常");
                    });
                } else {
                  retryCount = 0;
                  setTimeout(function () {
                    getJsonFile();
                  }, 0);
                }
              } else {
                if (storageType === "Json") {
                  kiosk[fileName] = JSON.parse(JSON.parse(res).result);
                  commonExt
                    .setJson(fileName, kiosk[fileName])
                    .then(function (res) {
                      resolve(kiosk[fileName]);
                    })
                    .catch(function (msg) {
                      WriteLog(fileName + " JSON檔更新失敗");
                      resolve(kiosk[fileName]);
                    });
                } else {
                  kiosk[fileName] = JSON.parse(
                    JSON.parse(res).result.SystemInfoValue
                  );
                  resolve(kiosk[fileName]);
                }
              }
            } catch (err) {
              WriteLog(fileName + " getJson fail " + JSON.stringify(err));
              reject("取得" + fileName + "異常");
            }
          } else {
            if (retryCount < 3) {
              retryCount++;
              storageType === "Sqlite" ? getSqliteData() : getJsonFile();
            } else {
              WriteLog(fileName + " getJson fail " + JSON.stringify(res));
              reject("取得" + fileName + "失敗");
            }
          }
        };
      }

      getSqliteData();
    });
  },
  /**
   * 傳入json檔名及物件資料, 複寫至該路徑json檔, retry3次, 失敗reject
   * @param {String} fileName
   * @param {Object} data
   */
  setJson: function (fileName, data) {
    return new Promise(function (resolve, reject) {
      if (
        !fileName ||
        !data ||
        typeof data !== "object" ||
        (typeof data === "string" && typeof JSON.parse(data) !== "object")
      ) {
        WriteLog(
          "複寫json失敗 - fileName:" +
            fileName +
            ", data:" +
            data +
            ", typeof data:" +
            typeof data
        );
        reject("複寫json失敗");
        return;
      }

      var retryCount = 0;
      var storageType = "";

      function insertIntoSqlite() {
        storageType = "Sqlite";
        return (function retry() {
          var _updateSystemInfo = {
            SystemInfoKey: fileName,
            SystemInfoValue: JSON.stringify(data),
          };
          External.TicketingServiceBizExt.TicketingService.updateSystemInfo(
            JSON.stringify(_updateSystemInfo),
            CheckRes(),
            function () {}
          );
        })();
      }

      // function WriteJsonFile() {
      //   storageType = "Json";
      //   return (function retry() {
      //     var json_string = {
      //       FilePath:
      //         "C:\\ITKiosk\\ExtermalSettings\\PalacePOS\\" + fileName + ".json",
      //       Content: JSON.stringify(data),
      //     };
      //     External.KioskCommon.CommonService.WriteAssignData(
      //       JSON.stringify(json_string),
      //       CheckRes(),
      //       function () {}
      //     );
      //   })();
      // }

      function CheckRes() {
        return function (res) {
          if (JSON.parse(res).isSuccess) {
            retryCount = 0;
            kiosk[fileName] = data;
            resolve(res);
          } else {
            if (retryCount < 3) {
              retryCount++;
              insertIntoSqlite();
            } else {
              WriteLog(fileName + " setJson fail: " + JSON.stringify(res));
              reject("複寫json失敗");
            }
          }
        };
      }

      insertIntoSqlite();
    });
  },
};

function PrintItem(e) {
  return new Promise(function (resolve, reject) {
    kiosk.API.Device.TSC247Lib.GetStatus(function (res) {
      if (res.IsSuccess) {
        kiosk.API.Device.TSC247Lib.GoPrint(
          function (res) {
            if (res.IsSuccess) {
              resolve();
            } else {
              reject();
              // showAlert({
              //     title: msg,
              //     type: 'error',
              //     confirm: '確認',
              //     confirmFn: function () {
              //         // 待補
              //     }
              // })
            }
            // count++;
            // goPrint();
          },
          function (error) {
            console.log("Fail ---- START ----");
            console.log(error);
            console.log("Fail ---- E N D ----");
          },
          "ticket-pos",
          e
        );
      } else {
        reject();
        // showAlert({
        //     title: res.msg,
        //     type: 'error',
        //     confirm: '確認',
        //     confirmFn: function () {
        //         count++;
        //         goPrint();
        //     }
        // })
      }
    });
  });
}
