var BackEnd = {
  /**
   * @param {String} actionType 操作類型
   * 1：View
   * 2：API
   * 3：Action
   * 4：Print
   * 5：Alert
   * @param {String} actionName 操作名稱
   * @param {String} actionLog log內容
   */
  AddActionLog: function (actionType, actionName, actionLog) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        KioskID: window.external.System.GetKioskId,
        ActionType: actionType,
        ActionName: actionName,
        ActionLog: actionLog,
        LocalTime: moment().format("YYYY/MM/DD HH:mm:ss"),
        Version: kiosk.BESync ? kiosk.BESync.Version : "-",
      };

      var isEncrypted = true;

      // 透過event loop確保在Promise function中多次打AddActionLog時，BackEnd.sendAPIReq能照順序打API，避免ActionLog受stack影響導致順序顛倒
      setTimeout(function () {
        BackEnd.sendAPIReq("AddActionLog", requestObj, isEncrypted)
          .then(function (res) {
            resolve(res);
          })
          .catch(function (err) {
            reject(err);
          });
      }, 0);
    });
  },
  /**
   * @param {String} kioskID 設備唯碼
   */
  GetBasicData: function (DataVersion) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        KioskID: window.external.System.GetKioskId,
        DataVersion: DataVersion ? DataVersion : "",
      };

      var isEncrypted = false;

      BackEnd.sendAPIReq("GetBasicData", requestObj, isEncrypted)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  /**
   * @param {String} FTDeviceCode 豐趣系統設備代號(deviceCode，由posCheckDevice回傳)
   */
  UpdateBasicData: function (FTDeviceCode) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        KioskID: window.external.System.GetKioskId,
        FTDeviceCode: FTDeviceCode,
      };

      var isEncrypted = false;

      BackEnd.sendAPIReq("UpdateBasicData", requestObj, isEncrypted)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  /**
   *
   * @param {Number} printType
   * 1 : 銷售製票
   * 2 : 補印
   * 3 : 測試列印
   * @param {Number} printCount 印製張數
   * @returns
   */
  AddPrintTicketCount: function (printType, printCount) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        CorporationID: kiosk.BESync.CorporationID,
        GroupID: kiosk.BESync.GroupID,
        KioskID: window.external.System.GetKioskId,
        PrintType: printType,
        PrintCount: printCount,
        PrintTime: moment().format("YYYY/MM/DD HH:mm:ss"),
      };

      var isEncrypted = true;

      BackEnd.sendAPIReq("AddPrintTicketCount", requestObj, isEncrypted)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  /**
   * @param {String} Message LINE通知訊息內容
   */
  KioskNotify: function (Message) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        KioskID: window.external.System.GetKioskId,
        Message: Message,
      };

      var isEncrypted = false;

      BackEnd.sendAPIReq("KioskNotify", requestObj, isEncrypted)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  /**
   * @param {String} APIname API名稱
   * @param {Object} requestObj request物件
   * @param {Boolean} isEncrypted 是否略過TokenKey加密
   */
  sendAPIReq: function (APIname, requestObj, isEncrypted) {
    return new Promise(function (resolve, reject) {
      // 純頁面流程
      if (testFlag.viewDebugger) {
        var response = fake.PalaceAPI[APIname]
          ? fake.PalaceAPI[APIname]
          : {
              data: { isSuccess: true, message: null, result: null },
              status: 200,
              statusText: "OK",
              headers: {},
              config: {},
              request: {},
            };
        resolve(response.data.result);
        return;
      }

      if (!isEncrypted) {
        isEncrypted = false;
        startSendAPIReq(APIname, requestObj, isEncrypted);
        return;
      }

      var json_string = {
        Key: kiosk.systemSetting.SHA256Key,
        PK: window.external.System.GetKioskId,
        XTime: moment().format("YYYYMMDD"),
      };

      WriteLog("ConvertToSHA256--傳入:" + JSON.stringify(json_string));
      External.TicketingServiceBizExt.TicketingService.ConvertToSHA256(
        JSON.stringify(json_string),
        function (res) {
          WriteLog("ConvertToSHA256--傳出:" + res);
          if (JSON.parse(res).isSuccess) {
            startSendAPIReq(
              APIname,
              requestObj,
              isEncrypted,
              JSON.parse(res).result.SHA256
            );
          } else {
            reject(JSON.parse(res).message);
          }
        },
        function () {}
      );

      function startSendAPIReq(APIname, requestObj, isEncrypted, TokenKey) {
        if (isEncrypted && TokenKey && requestObj) {
          requestObj.TokenKey = TokenKey;
        }
        var request = requestObj;
        var headers = {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000,
        };
        WriteLog(APIname + "--傳入:" + JSON.stringify(request));

        if (kiosk.systemSetting.useFakeData) {
          WriteLog(APIname + "--傳出假資料:" + JSON.stringify(response));
          CheckIfSuccess(fake.PalaceAPI[APIname]);
          return;
        }

        if (!kiosk.systemSetting) {
          commonExt
            .getJson("systemSetting")
            .then(function (res) {
              startAxiosPOST(APIname, request, headers);
            })
            .catch(function (err) {
              WriteLog(
                APIname + " - systemSetting is not exist:" + JSON.stringify(err)
              );
              reject("網路連線異常");
            });
          return;
        }

        startAxiosPOST(APIname, request, headers);

        function startAxiosPOST(APIname, request, headers) {
          axios
            .post(
              kiosk.systemSetting.apiBackEnd + APIname + ".ashx",
              request,
              headers
            )
            .then(function (response) {
              WriteLog(APIname + "--傳出:" + JSON.stringify(response));
              CheckIfSuccess(response);
            })
            .catch(function (error) {
              WriteLog(APIname + "--catch error:" + JSON.stringify(error));
              reject("網路連線異常");
            });
        }

        function CheckIfSuccess(response) {
          try {
            if (response.data.isSuccess === true) {
              var res = response.data.result;
              kiosk[APIname] = res;
              resolve(res);
            } else {
              var errorMsg = response.data.message;
              reject(errorMsg);
            }
          } catch (error) {
            reject(error);
          }
        }
      }
    });
  },
};
