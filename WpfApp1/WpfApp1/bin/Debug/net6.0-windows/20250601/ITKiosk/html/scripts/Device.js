//==============================================================
//儲存 Kiosk 呼叫 外接裝置 的共用Method
//如有修改須求，前請告知ted或hank
//Mvoed by ted 2017/08/28

//修改歷程
//2017/08/28 Moved by ted

//==============================================================
//2017/09/01 從Mainapp搬移過來
kiosk.API.Device = kiosk.API.Device || {};
(function () {
  // Scanner 相關 Method
  kiosk.API.Device = kiosk.API.Device || {};

  // Control Box
  kiosk.API.Device.ControlBox = {
    DeviceAction: {
      DisConnect: 0,
      Connect: 1,
      LEDA: 2,
      LEDB: 3,
      LEDC: 4,
      LEDD: 5,
      SystemFAN: 6,
      SystemSpeaker: 7,
      USB1: 8,
      USB2: 9,
      USB3: 10,
      USB4: 11,
      USB5: 12,
      USB6: 13,
      SecondMonitor: 14,
      GetUPSBackupBattery: 15,
      GetFANSpeed: 16,
      GetTemperature: 17,
      GetCPUUsage: 18,
      GetMemorySpace: 19,
      GetHDDStatus: 20,
      ResetSystem: 21,
      ControlBoxStatus: 22,
    },
    KioskOption: {
      Close: 0,
      Open: 1,
      Get_status_for_now: 2,
      LEDFlashMode: 3,
    },
    KioskFAN: {
      FAN1_Off_FAN2_Off: 0,
      FAN1_On_FAN2_Off: 1,
      FAN1_Off_FAN2_On: 2,
      FAN1_On_FAN2_On: 3,
    },
    generuteParemater: function (action, paremater) {
      var deviceCmd = {
          option: 0,
          sysFAN: 0,
          hddStr: "C:",
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify($.extend(deviceCmd, paremater)),
        },
        cmd = {
          DeviceName: "ControlBox",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    DisConnect: function (success, fail) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(self.DeviceAction.DisConnect)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success(result);
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
    Connect: function (success, fail) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(self.DeviceAction.Connect)),
        function (res) {
          kiosk.API.log.logInfo(res, "Connect");
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success(result);
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },

    /*
     * option @KioskFAN
     */
    SetSystemFAN: function (option, success, fail) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(self.DeviceAction.SystemFAN, {
            sysFAN: option,
          })
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success();
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
    /*
     * option @KioskOption
     */
    SetSystemSpeaker: function (option, success, fail) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(self.DeviceAction.SystemSpeaker, {
            option: option,
          })
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success();
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
    /*
     * action @StatusAction
     */
    GetStatus: function (action, success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(action)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success(result);
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
    /*
     * action @LEDAction
     * option @KioskOption
     * para @object {flashOffTime:@int,flashOnTime:@int}
     */
    SetLED: function (action, option, success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(action, {
            option: option,
          })
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success();
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
    /*
     * action @USBAction
     * option @KioskOption
     */
    SetUSB: function (action, option, success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(action, {
            option: option,
          })
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            if (success) success();
          } else {
            if (fail) fail(result.message);
          }
        }
      );
    },
  };

  // === 2D Scanner Auto ===
  kiosk.API.Device.SCANNER2DAUTO = {
    DeviceAction: {
      DisConnect: 0,
      Connect: 1,
      GetDataAuto: 2,
      StopAuto: 3,
      GetDataManual: 4,
      StopManual: 5,
      DeviceStatus: 6,
      SendCommand: 7,
    },
    generuteParemater: function (action, comPort) {
      var DeviceCmd = {
          comPort: comPort,
          rate: "115200",
          serialTimeout: "50",
          is_autoScanner: true,
          commStr: "",
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "SCANNER2DAUTO",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    Open: function (success, fail, comPort) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.Connect, comPort)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "2DScannerAuto_Connect",
              "2DScanner_Auto"
            );
          }
        }
      );
    },
    Close: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.DisConnect)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "2DScannerAuto_DisConnect",
              "2DScanner_Auto"
            );
          }
        }
      );
    },
    GetDataAuto: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.GetDataAuto)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "2DScannerAuto_GetData",
              "2DScanner_Auto"
            );
          }
        }
      );
    },
    StopAuto: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.StopAuto)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "2DScannerAuto_Stop", "2DScanner_Auto");
          }
        }
      );
    },
    DeviceStatus: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.DeviceStatus)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "2DScannerAuto_Status",
              "2DScanner_Auto"
            );
          }
        }
      );
    },
  };
  // =======================
  kiosk.API.Device.EZM = {
    status: {
      isConnect: false,
      isGetting: false,
    },
    DeviceAction: {
      disConnect: 0,
      connect: 1,
      getData: 2,
      stopGet: 3,
      deviceStatus: 4,
    },
    generuteParemater: function (action) {
      var DeviceCmd = {
          // readerName: 'CASTLES EZCCID Smart Card Reader 0'
          // readerName: 'CASTLES EZ100PU 1'
          readerName: "Generic EMV Smartcard Reader 0",
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "EZM",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    disConnect: function (success, fail) {
      var self = this;
      if (!self.status.isConnect) {
        success();
        return;
      }
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.disConnect)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            self.status.isConnect = false;
            success(result.result);
          } else {
            fail(result.message);
          }
        }
      );
    },
    connect: function (success, fail) {
      
      var self = this;
      if (self.status.isConnect) {
        success();
        return;
      }
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.connect)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            self.status.isConnect = true;
            success(result);
          } else {
            fail(result.Error);
          }
        }
      );
    },
    getData: function (success, fail) {
      var self = this,
        excute = function () {
          if (self.status.isGetting) {
            fail("重複執行");
            return;
          }
          self.status.isGetting = true;
          kiosk.API.Device.postToDeviceWithCallback(
            JSON.stringify(self.generuteParemater(self.DeviceAction.getData)),
            function (res) {
              self.status.isGetting = false;
              var result = JSON.parse(res);
              if (result.IsSuccess && !result.isCancel)
                success(result.personalObj);
              else if (result.IsSuccess) fail(result.message, result.isCancel);
              // else
              //     fail(result.message);
            }
          );
        };
      if (!self.status.isConnect) {
        self.connect(excute, fail);
        return;
      }

      excute();
    },
    stopGet: function (success, fail) {
      var self = this,
        excute = function () {
          kiosk.API.Device.postToDeviceWithCallback(
            JSON.stringify(self.generuteParemater(self.DeviceAction.stopGet)),
            function (res) {
              var result = JSON.parse(res);
              if (result.IsSuccess) {
                success(result);
              } else {
                fail(result.message);
              }
            }
          );
        };
      if (!self.status.isConnect) {
        self.connect(excute, fail);
        return;
      }
      excute();
    },
    deviceStatus: function (success, fail) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.deviceStatus)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            fail(result.message);
          }
        }
      );
    },
    getStatus: function (callback) {
      var self = this;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.deviceStatus)),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
  };
  // Thermal 相關 Method
  kiosk.API.Device.Thermal = {
    DeviceName: "",
    setAttr: function (tag, el) {
      if (el.attributes) {
        $.each(el.attributes, function (index, attr) {
          tag.Attubites[attr.name] = attr.value;
        });
      }
    },
    TagModel: {
      THERMAL_CUTPAGE: function (el) {
        return {
          Type: el.localName,
        };
      },

      THERMAL_TEXT: function (el) {
        var self = this,
          tag = {
            Attubites: {
              height: 1,
              width: 1,
              wide_character: 1,
              bold: false,
              tab: 0,
              underline: false,
              alignment: "left",
            },
            InnerText: el.textContent,
            Type: el.localName,
          };
        kiosk.API.Device.Thermal.setAttr(tag, el);
        return tag;
      },

      THERMAL_BITMAP: function (el) {
        var tag = {
          Attubites: {
            file: "",
            size: 0,
            alignment: "left",
          },
          InnerText: el.textContent,
          Type: el.localName,
        };
        kiosk.API.Device.Thermal.setAttr(tag, el);
        return tag;
      },

      THERMAL_BARCODE: function (el) {
        var tag = {
          Attubites: {
            size: 80,
            position: "below",
            code_type: "Code128",
            alignment: "left",
          },
          InnerText: el.textContent,
          Type: el.localName,
        };
        kiosk.API.Device.Thermal.setAttr(tag, el);
        return tag;
      },
      THERMAL_QRCODE: function (el) {
        var tag = {
          Attubites: {
            size: 150,
            alignment: "left",
          },
          InnerText: el.textContent,
          Type: el.localName,
        };
        kiosk.API.Device.Thermal.setAttr(tag, el);
        return tag;
      },
      THERMAL_SUBCONTENT: function (el) {
        var tag = {
          Attubites: {
            datasource: "",
          },
          child: [],
          Type: el.localName,
        };
        kiosk.API.Device.Thermal.setAttr(tag, el);

        $.each(el.childNodes, function (key, child) {
          if (child.nodeType == 1) {
            tag.child.push(
              kiosk.API.Device.Thermal.TagModel[child.tagName](child)
            );
          }
        });
        return tag;
      },
      THERMAL_MARKFEED: function (el) {
        var tag = {
          Attubites: {
            feedtype: "",
          },
          InnerText: el.textContent,
          Type: el.localName,
        };
        kiosk.API.Device.Thermal.setAttr(tag, el);
        return tag;
      },
    },
    receiptTemplate: undefined,
    generateTemplate: function (xmltxt) {
      var self = {};
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(xmltxt, "text/xml");
      $.each(
        xmlDoc.getElementsByTagName("THERMAL_PRINT"),
        function (key, type) {
          self[type.getAttribute("id").toLowerCase()] = [];
          $.each(
            type.getElementsByTagName("THERMAL_PAGE"),
            function (key, page) {
              var pageModel = {
                tags: [],
                rotation: "normal",
                markfeed: undefined,
              };

              if (page.getAttribute("rotation")) {
                pageModel.rotation = page.getAttribute("rotation");
              }
              if (page.getAttribute("markfeed")) {
                pageModel.markfeed = page.getAttribute("markfeed");
              }
              if (page.getAttribute("loop-for")) {
                pageModel.loopfor = page.getAttribute("loop-for");
              }
              $.each(page.childNodes, function (key, child) {
                try {
                  pageModel.tags.push(
                    new kiosk.API.Device.Thermal.TagModel[child.tagName](child)
                  );
                } catch (e) {
                  //console.log(child.tagName);
                  //console.log(child);
                }
              });
              pageModel.tags.push(
                new kiosk.API.Device.Thermal.TagModel.THERMAL_TEXT({
                  textContent: "",
                  localName: "THERMAL_TEXT",
                })
              );
              self[type.getAttribute("id").toLowerCase()].push(pageModel);
            }
          );
        }
      );
      return self;
    },
    generuteParemater: function (action, content, workType) {
      var deviceCmd = {
          Content: content ? content.content || "" : "",
          Size: content ? content.Size || "0" : "0",
          Alignment: content ? content.Alignment || "" : "",
          Position: content ? content.Position || "" : "",
          CodeType: content ? content.CodeType || "" : "",
          DEVICE_NAME: this.DeviceName, //'RP-600_COM1'
        },
        actionCmd = {
          Action: action,
          Paremater: JSON.stringify(deviceCmd),
        },
        cmd = {
          DeviceName: "Thermal",
          Worktype: workType || "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_EPrint: function (action, content, jsonString) {
      var deviceCmd = {
          Content: content ? content.content || "" : "",
          Size: content ? content.Size || "0" : "0",
          Alignment: content ? content.Alignment || "" : "",
          Position: content ? content.Position || "" : "",
          CodeType: content ? content.CodeType || "" : "",
          DEVICE_NAME: this.DeviceName,
          EPageSpcJson: jsonString,
        },
        actionCmd = {
          Action: action,
          Paremater: JSON.stringify(deviceCmd),
        },
        cmd = {
          DeviceName: "Thermal",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    parseSubContent: function (subTag, subData) {
      var tags = [];
      $.each(subData, function (key, obj) {
        $.each(subTag.child, function (k, tag) {
          var tagTemp = $.extend(true, {}, tag);
          if (tagTemp.Type != "THERMAL_SUBCONTENT") {
            if (tagTemp.Type != "THERMAL_CUTPAGE") {
              var isNull = false;
              tagTemp.InnerText = tagTemp.InnerText.replace(
                /\{\{(.*?)\}\}/g,
                function (match, token) {
                  if (obj[token]) return obj[token];
                  isNull = true;
                  return "";
                }
              );
              if (!isNull) {
                tags.push(tagTemp);
              }
            } else {
              tags.push(tagTemp);
            }
          } else {
            global.API.concat(
              tags,
              self.parseSubContent(tagTemp, data[tagTemp.Attubites.datasource])
            );
          }
        });
      });
      return tags;
    },
    Open: function () {
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(this.generuteParemater("Open"))
      );
    },
    CutPaper: function () {
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(
          this.generuteParemater("CutPaper", {
            content: 0,
          })
        )
      );
    },
    PrintText: function (text) {
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(
          this.generuteParemater("PrintText", {
            content: text,
          })
        )
      );
    },
    PrintBitmap: function (filePath, size, alignment) {
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(this.generuteParemater("PrintBitmap"), {
          Content: filePath,
          Size: size || 229,
          Alignment: alignment || "Center",
        })
      );
    },
    PrintBarCode: function (code, size, alignment, position, codeType) {
      
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(this.generuteParemater("PrintBarCode"), {
          Content: code,
          Size: size || 80,
          Alignment: alignment || "Center",
          Position: position || "Below",
          CodeType: codeType || "Code128",
        })
      );
    },
    PrintQRCode: function (code, size, alignment, position) {
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(this.generuteParemater("PrintQRCode"), {
          Content: code,
          Size: size || 150,
          Alignment: alignment || "Center",
          Position: position || "Below",
        })
      );
    },
    CheckNearEnd: function () {
      return kiosk.API.Device.sendToDevice(
        JSON.stringify(
          this.generuteParemater("CheckNearEnd", {}, "SendRequest")
        )
      );
    },
    parsePage: function (tags, data) {
      var pageTags = [];
      var self = this;
      $.each(tags, function (k, tag) {
        var isNull = true,
          isReplase = false;
        if (tag.Type != "THERMAL_SUBCONTENT") {
          tag.InnerText = tag.InnerText.replace(
            /\{\{(.*?)\}\}/g,
            function (match, token) {
              isReplase = true;
              if (data[token]) {
                isNull = false;
                return data[token];
              } else {
                isNull = isNull && true;
              }
              return "";
            }
          );
          if (!isNull || !isReplase) {
            pageTags.push(tag);
          }
        } else {
          var childsTag = self.parseSubContent(
            tag,
            data[tag.Attubites.datasource]
          );
          kiosk.API.concat(pageTags, childsTag);
        }
      });
      return pageTags;
    },
    PrintTemplatePage: function (deviceName, receiptType, data, callback) {
      //if (testFlag.viewDebugger) {
      //    return;
      //}
      var self = this;
      self.DeviceName = deviceName;
      if (!self.receiptTemplate) {
        self.GetTemplate();
      }

      var pageTemplate = $.extend(
        true,
        {},
        self.receiptTemplate[receiptType.toLowerCase()]
      );
      var result;
      $.each(pageTemplate, function (key, page) {
        var np = $.extend(true, {}, page);
        var cmd = self.generuteParemater("PrintTemplatePage", {
          content: JSON.stringify([
            {
              tags: self.parsePage(np.tags, data),
              rotation: page.rotation,
              markfeed: page.markfeed,
            },
          ]),
        });
        result = JSON.parse(kiosk.API.Device.sendToDevice(JSON.stringify(cmd)));
        if (!result.IsSuccess) {
          return false;
        }
      });
      return result;
    },
    GetTemplate: function () {
      var self = this;
      /* if (testFlag.viewDebugger) {
                var result = {
                    "IsSuccess": "true",
                    "IsNearEnd": "false",
                    "Result": "\r\n\r\n<THERMAL_TEMPLATE>\r\n\t<THERMAL_PRINT id=\"DigitalPin\">\r\n\t\t<THERMAL_PAGE>\t\t\t\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\t\t\t\t\t\t\t\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"InstantTopup\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" tab=\"1\">Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\r\n\t<THERMAL_PRINT id=\"BillPayment\">\r\n\t\t<THERMAL_PAGE>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" >This is not a </THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT wide_character=\"2\" alignment=\"center\" bold=\"true\" underline=\"true\">RECEIPT</THERMAL_TEXT>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\t\t\t\r\n\t\t\t<THERMAL_BARCODE alignment=\"center\" size=\"100\" >{{code}}</THERMAL_BARCODE>\t\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Printed:{{now}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Store ID:{{storeCode}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Description:{{prodcutName}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT  height=\"2\" >Amount:{{cruuency}}{{amount}}\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT>\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">Please proceed for payment\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">at the cashier counter within\\r\\n</THERMAL_TEXT>\r\n\t\t\t<THERMAL_TEXT tab=\"1\">30 minutes before it expires\\r\\n</THERMAL_TEXT>\r\n\t\t</THERMAL_PAGE>\r\n\t</THERMAL_PRINT>\t\r\n</THERMAL_TEMPLATE>",
                    "Error": null
                }
            } else {
                var xmlStr =
                    kiosk.API.Device.sendToDevice(JSON.stringify(this.generuteParemater("GetTemplateXML", {})));
                var result = JSON.parse(xmlStr);
            } */
      try {
        var xmlStr = kiosk.API.Device.sendToDevice(
          JSON.stringify(this.generuteParemater("GetTemplateXML", {}))
        );
        var result = JSON.parse(xmlStr);
        var xmltxt = result.Result;
      } catch (ex) {
        kiosk.API.log.logError(ex.toString(), "GetTemplateXML", "Thermal");
        kiosk.API.Device.Thermal.GetTemplate();
      }
      self.receiptTemplate = self.generateTemplate(xmltxt);
    },
    getStatus: function (deviceName, callback) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(self.generuteParemater("GetDeviceStatus")),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
    ElecPrint: function (deviceName, callback, jsonString) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          self.generuteParemater_EPrint("ElecPrint", undefined, jsonString)
        ),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
    ElecPrint2: function (deviceName, callback, jsonString) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          self.generuteParemater_EPrint("ElecPrint2", undefined, jsonString)
        ),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
    OnlyInvoice: function (deviceName, callback, jsonString) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          self.generuteParemater_EPrint("OnlyInvoice", undefined, jsonString)
        ),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
    OnlyReceipt: function (deviceName, callback, jsonString) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          self.generuteParemater_EPrint("OnlyReceipt", undefined, jsonString)
        ),
        function (res) {
          callback(JSON.parse(res));
        }
      );
    },
    OpenDrawer: function (deviceName, callback, jsonString) {
      var self = this;
      self.DeviceName = deviceName;
      kiosk.API.Device.postToDeviceWithoutCallback(
        JSON.stringify(this.generuteParemater("OpenDrawer"))
      );
    },
  };

  // === ICT API START ===
  kiosk.API.Device.CashBox = {
    DeviceAction: {
      openDevice: 0,
      deviceStatus: 1,
      paymentStatus: 2,
      begPayment: 3,
      endPayment: 4,
      cancelPayment: 5,
      setNdNumber: 6,
      closeDevice: 7,
    },
    generuteParemater: function (action, com, N1, N2, transAmount) {
      var cashBoxCmd = {
          comPort: com || "COM7",
          ndNumArg1: N1 || 0,
          ndNumArg2: N2 || 0,
          begPaymentArg: transAmount || 0,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(cashBoxCmd),
        },
        cmd = {
          DeviceName: "CashBox",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    openDevice: function (success, p1) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.openDevice, p1)
        ),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    deviceStatus: function (success) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.deviceStatus)),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    paymentStatus: function (success) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.paymentStatus)),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    begPayment: function (success, transAmount) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.begPayment,
            undefined,
            undefined,
            undefined,
            transAmount
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    endPayment: function (success) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.endPayment)),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    cancelPayment: function (success) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.cancelPayment)),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    setNdNumber: function (success, p1, p2) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.setNdNumber,
            undefined,
            p1,
            p2
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
    closeDevice: function (success) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.closeDevice)),
        function (res) {
          var result = JSON.parse(res);
          success(result);
        }
      );
    },
  };
  // === ICT API E N D ===

  kiosk.API.Device.FIN = {
    DeviceAction: {
      ECCInit: 0,
      ECCPayment: 1,
      ECCCardData: 2,
      ECCSettle: 3,
      ECCDeviceCheck: 4,
      O2OQrCode: 5,
      O2OQuery: 7,
      O2ORefund: 8,
      CTBCPayment: 9,
      CTBCSettle: 10,
      CTBCLastData: 11,
      CTBCConnCheck: 12,
      CTBCSlotCheck: 13,
      CATHAYPayment: 14,
      CATHAYSettle: 15,
      CATHAYBmpTransfer: 16,
      CATHAYConnect: 17,
      CATHAYStop: 18,
      NCCCPayment: 19,
      NCCCSettle: 20,
      CTBCS3Payment: 21,
      CTBCS3Settle: 22,
      CTBCS3LastData: 23,
      CTBCS3ConnCheck: 24,
      CTBCS3SlotCheck: 25,
      ENUMPayment: 26,
      ENUMSettle: 27,
      TCBPayment: 28,
      TCBSettle: 29,
      BOTPayment: 30,
      BOTSettle: 31,
      IPASS_INIT: 32,
      IPASS_MULTI_CARD: 33,
      IPASS_PAYMENT: 34,
      IPASS_SETTLE: 35,
      CATHAYMultiPayment: 36,
      CATHAYMultiSettle: 37,
      CATHAYMultiConnect: 38,
      CTBC_SL_PAYMENT: 39,
      CTBC_SL_REFUND: 40,
      CTBC_SL_SETTLE: 41,
      CTBC_SL_READ: 42,
      CTBC_SL_CANCEL: 43,
      CTBC_SL_STOP: 44,
      NCCCRefund: 45,
      SINOPAC_PAYMENT: 46,
      SINOPAC_SETTLE: 47,
      SINOPAC_REFUND: 48,
      TAISHIN_POS_BANK_PAYMENT: 49,
      TAISHIN_POS_BANK_SETTLE: 50,
      TAISHIN_POS_TICKET: 51,
      TAISHIN_TVM_BANK_PAYMENT: 52,
      TAISHIN_TVM_BANK_SETTLE: 53,
      TAISHIN_TVM_TICKET: 54,
    },
    generuteParemater_ECC: function (
      action,
      PtransDate,
      PtransTime,
      amt,
      retryTransaction
    ) {
      var DeviceCmd = {
          ctbc_amt: amt,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          eccReq: {
            transDate: PtransDate,
            transTime: PtransTime,
            transAmt: amt,
            retryTransaction: retryTransaction || "0",
            batchNo: "0",
            totalCount: "0",
            totalAmt: "0",
          },
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_O2OQRCODE: function (
      action,
      ORDERSTR,
      TIMESTR,
      amt,
      isWeixin
    ) {
      var DeviceCmd = {
          ctbc_amt: amt,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          eccReq: null,
          o2oReqQrCode: {
            amount: "3",
            redirectimage: "N",
            timestamp: TIMESTR,
            includeamt: "Y",
            orderid: ORDERSTR,
            ordername: "IPHONEX",
            ordermemo: "IPHONEX",
            redirectimagesize: "M",
            isWEIXIN: isWeixin || "N",
          },
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_O2OQUERY: function (
      action,
      ORDERSTR,
      TIMESTR,
      TYPESTR,
      amt,
      isWeixin
    ) {
      var DeviceCmd = {
          ctbc_amt: amt,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: {
            id: ORDERSTR,
            timestamp: TIMESTR,
            type: TYPESTR,
            isWEIXIN: isWeixin || "N",
          },
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater: function (action, amt, store, cardType, cardHostID) {
      var DeviceCmd = {
          ctbc_amt: amt || "0",
          ctbc_store: store || "0",
          ctbc_cardType: cardType || "01",
          cathay_host: cardHostID || "03",
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          ctbc_amt_s3: amt || "0",
          ctbc_store_s3: store || "0",
          ctbc_cardType_s3: cardType || "01",
          enum_amt: amt || "0",
          enum_hostID: cardHostID || "01",
          enum_storeID: store || "",
          tcb_amt: amt || "0",
          tcb_hostID: cardHostID || "01",
          tcb_storeID: store || "",
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_NCCC_Normal: function (
      action,
      ECR_Indicator,
      TransType_Indicator,
      TransType,
      CUP_SP_ESVC,
      HostID,
      TransAmount,
      TransData,
      TransTime,
      StoreID,
      SP_Origin_Date,
      SP_Origin_RRN,
      ApprovalNo
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: {
            ECR_Indicator: ECR_Indicator || "",
            TransType_Indicator: TransType_Indicator || "",
            TransType: TransType || "",
            CUP_SP_ESVC: CUP_SP_ESVC || "",
            HostID: HostID || "",
            TransAmount: TransAmount,
            TransData: TransData,
            TransTime: TransTime,
            StoreID: StoreID || "",
            SP_Origin_Date: SP_Origin_Date || "",
            SP_Origin_RRN: SP_Origin_RRN || "",
            ApprovalNo: ApprovalNo || "",
          },
          ncccReqSettle: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_NCCC_Settle: function (
      action,
      ECR_Indicator,
      Settlement_Indicator,
      HostID,
      TransData,
      TransTime
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: {
            ECR_Indicator: ECR_Indicator,
            TransType: "50",
            Settlement_Indicator: Settlement_Indicator,
            HostID: HostID,
            TransData: TransData,
            TransTime: TransTime,
          },
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_CTBC_SL: function (
      action,
      trans_type,
      host_id,
      invoice_no,
      card_no,
      store_id,
      trans_amt
    ) {
      var DeviceCmd = {
          ctbc_amt: "0",
          ctbc_store: "0",
          ctbc_cardType: "01",
          cathay_host: "03",
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          ctbc_amt_s3: "0",
          ctbc_store_s3: "0",
          ctbc_cardType_s3: "01",
          enum_amt: "0",
          enum_hostID: "01",
          enum_storeID: "",
          tcb_amt: "0",
          tcb_hostID: "01",
          tcb_storeID: "",
          ctcbSymlinkReq: {
            trans_type: trans_type || "",
            host_id: host_id || "",
            invoice_no: invoice_no || "",
            card_no: card_no || "",
            store_id: store_id || "",
            trans_amt: trans_amt || "",
          },
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    generuteParemater_Sinopac: function (
      action,
      TransType,
      HostID,
      TransAmount,
      ApprovalNo,
      invoiceType,
      ticketType
    ) {
      var DeviceCmd = {
          ctbc_amt: "0",
          ctbc_store: "0",
          ctbc_cardType: "01",
          cathay_host: "03",
          eccReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          ctbc_amt_s3: "0",
          ctbc_store_s3: "0",
          ctbc_cardType_s3: "01",
          enum_amt: "0",
          enum_hostID: "01",
          enum_storeID: "",
          tcb_amt: "0",
          tcb_hostID: "01",
          tcb_storeID: "",
          ctcbSymlinkReq: null,
          sinopacReq: {
            TransType: TransType || "",
            HostID: HostID || "",
            TransAmount: TransAmount || "",
            ApprovalNo: ApprovalNo || "",
            invoiceType: invoiceType || "",
            ticketType: ticketType || "",
          },
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    SINOPAC_PAYMENT: function (success, fail, P1, P2, P3, P4, P5, P6) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_Sinopac(
            this.DeviceAction.SINOPAC_PAYMENT,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "SINOPAC_PAYMENT", "FIN");
          }
        }
      );
    },
    SINOPAC_SETTLE: function (success, fail, P1, P2, P3, P4, P5, P6) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_Sinopac(
            this.DeviceAction.SINOPAC_SETTLE,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "SINOPAC_SETTLE", "FIN");
          }
        }
      );
    },
    SINOPAC_REFUND: function (success, fail, P1, P2, P3, P4, P5, P6) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_Sinopac(
            this.DeviceAction.SINOPAC_REFUND,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "SINOPAC_REFUND", "FIN");
          }
        }
      );
    },
    SINOPAC_COMM: function (success, fail, P1, P2, P3, P4, P5, P6) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_Sinopac(
            this.DeviceAction.SINOPAC_PAYMENT,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "SINOPAC_COMM", "FIN");
          }
        }
      );
    },
    /**
     * 故宮-中國信託
     * @param trans_type 交易類別 信用卡/紅利抵用/分期/銀聯 銷售:01; 退貨:02; 取消:30; 結帳:50; 票證 銷售:21; 退貨:22; 餘額查詢:23; 現金加值:24; 取消:25; 查詢前一筆成功交易:26; 重試一次:27; 結帳:50
     * @param host_id 授權銀行編碼 EDC進行交易模式選擇：00 ; 01 信用卡 ; 04 銀聯卡 ; 20電子票證–自動選卡
     * @param invoice_no 調閱編號
     * @param card_no 卡號 - 電子票證退貨需要
     * @param store_id 櫃號
     * @param trans_amt 扣款金額
     */
    CTBC_SL_PAYMENT: function (
      success,
      fail,
      trans_type,
      host_id,
      invoice_no,
      card_no,
      store_id,
      trans_amt
    ) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_CTBC_SL(
            this.DeviceAction.CTBC_SL_PAYMENT,
            trans_type,
            host_id,
            invoice_no,
            card_no,
            store_id,
            trans_amt
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CATHAYPayment", "FIN");
          }
        }
      );
    },
    NCCCPayment: function (success, fail, P1, P2, P3, P4, P5, P6, P7, P8, P9) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_NCCC_Normal(
            this.DeviceAction.NCCCPayment,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6,
            P7,
            P8,
            P9,
            undefined,
            undefined,
            undefined
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "NCCCPayment", "FIN");
          }
        }
      );
    },
    NCCCRefund: function (
      success,
      fail,
      P1,
      P2,
      P3,
      P4,
      P5,
      P6,
      P7,
      P8,
      P9,
      P10,
      P11,
      P12
    ) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_NCCC_Normal(
            this.DeviceAction.NCCCRefund,
            P1,
            P2,
            P3,
            P4,
            P5,
            P6,
            P7,
            P8,
            P9,
            P10,
            P11,
            P12
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "NCCCRefund", "FIN");
          }
        }
      );
    },
    NCCCSettle: function (success, fail, P1, P2, P3, P4, P5) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_NCCC_Settle(
            this.DeviceAction.NCCCSettle,
            P1,
            P2,
            P3,
            P4,
            P5
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "NCCCSettle", "FIN");
          }
        }
      );
    },
    CTBCPayment: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCPayment, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCPayment", "FIN");
          }
        }
      );
    },
    CTBCSettle: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCSettle, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCSettle", "FIN");
          }
        }
      );
    },
    CTBCLastData: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCLastData, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCLastData", "FIN");
          }
        }
      );
    },
    CTBCConnCheck: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCConnCheck, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCConnCheck", "FIN");
          }
        }
      );
    },
    CTBCSlotCheck: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCSlotCheck, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCSlotCheck", "FIN");
          }
        }
      );
    },
    CTBCPayment_S3: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCS3Payment, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCS3Payment", "FIN");
          }
        }
      );
    },
    CTBCSettle_S3: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCS3Settle, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCS3Settle", "FIN");
          }
        }
      );
    },
    CTBCLastData_S3: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCS3LastData, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCS3LastData", "FIN");
          }
        }
      );
    },
    CTBCConnCheck_S3: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCS3ConnCheck, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCS3ConnCheck", "FIN");
          }
        }
      );
    },
    CTBCSlotCheck_S3: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CTBCS3SlotCheck, P1, P2, P3)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CTBCS3SlotCheck", "FIN");
          }
        }
      );
    },
    ECCInit: function (success, fail, P1, P2) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_ECC(this.DeviceAction.ECCInit, P1, P2)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ECCInit", "FIN");
          }
        }
      );
    },
    ECCPayment: function (success, fail, P1, P2, P3, P4) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_ECC(
            this.DeviceAction.ECCPayment,
            P1,
            P2,
            P3,
            P4
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ECCPayment", "FIN");
          }
        }
      );
    },
    ECCCardData: function (success, fail, P1, P2) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_ECC(this.DeviceAction.ECCCardData, P1, P2)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ECCCardData", "FIN");
          }
        }
      );
    },
    ECCSettle: function (success, fail, P1, P2) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_ECC(this.DeviceAction.ECCSettle, P1, P2)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ECCSettle", "FIN");
          }
        }
      );
    },
    ECCDeviceCheck: function (success, fail, P1, P2) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_ECC(this.DeviceAction.ECCDeviceCheck, P1, P2)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ECCDeviceCheck", "FIN");
          }
        }
      );
    },
    O2OQrCode: function (success, fail, ORDERID, TIMESTR) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_O2OQRCODE(
            this.DeviceAction.O2OQrCode,
            ORDERID,
            TIMESTR,
            "N"
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "O2OQrCode", "FIN");
          }
        }
      );
    },
    O2OQuery: function (success, fail, ORDERID, TIMESTR, TYPESTR) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_O2OQUERY(
            this.DeviceAction.O2OQuery,
            ORDERID,
            TIMESTR,
            TYPESTR,
            "N"
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "O2OQuery", "FIN");
          }
        }
      );
    },
    WEIXINQrCode: function (success, fail, ORDERID, TIMESTR) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_O2OQRCODE(
            this.DeviceAction.O2OQrCode,
            ORDERID,
            TIMESTR,
            "Y"
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "O2OQrCode", "FIN");
          }
        }
      );
    },
    WEIXINQuery: function (success, fail, ORDERID, TIMESTR, TYPESTR) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater_O2OQUERY(
            this.DeviceAction.O2OQuery,
            ORDERID,
            TIMESTR,
            TYPESTR,
            "Y"
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "O2OQuery", "FIN");
          }
        }
      );
    },
    O2ORefund: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.O2ORefund)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "O2ORefund", "FIN");
          }
        }
      );
    },
    CATHAYPayment: function (success, fail, P1, P2, P3, P4) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.CATHAYPayment,
            P1,
            P2,
            P3,
            P4
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CATHAYPayment", "FIN");
          }
        }
      );
    },
    CATHAYSettle: function (success, fail, P1, P2, P3, P4) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CATHAYSettle, P1, P2, P3, P4)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CATHAYSettle", "FIN");
          }
        }
      );
    },
    CATHAYBmpTransfer: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.CATHAYBmpTransfer)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CATHAYBmpTransfer", "FIN");
          }
        }
      );
    },
    CATHAYConnect: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.CATHAYConnect)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "CATHAYConnect", "FIN");
          }
        }
      );
    },
    ENUMPayment: function (success, fail, amt, host, store) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.ENUMPayment,
            amt,
            store,
            "",
            host
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ENUMPayment", "FIN");
          }
        }
      );
    },
    ENUMSettle: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.ENUMSettle)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ENUMSettle", "FIN");
          }
        }
      );
    },
    TCBPayment: function (success, fail, amt, host, store) {
		WriteLog("call kiosk.API.Device.FIN.TCBPayment postToDeviceWithCallback ,args="+JSON.stringify({
			amt:amt,
			host:host,
			store:store
		}));
		var parematers= this.generuteParemater(
            this.DeviceAction.TCBPayment,
            amt,
            store,
            "",
            host
          );
		WriteLog("call kiosk.API.Device.FIN.TCBPayment postToDeviceWithCallback ,parematers="+JSON.stringify(parematers));
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
         parematers
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "TCBPayment", "FIN");
          }
        }
      );
    },
    TCBSettle: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.TCBSettle)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "TCBSettle", "FIN");
          }
        }
      );
    },
    BOTPayment: function (success, fail, amt, host, store) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.BOTPayment,
            amt,
            store,
            "",
            host
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "BOTPayment", "FIN");
          }
        }
      );
    },
    BOTSettle: function (success, fail, amt, host, store) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.BOTSettle,
            amt,
            store,
            "",
            host
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "BOTSettle", "FIN");
          }
        }
      );
    },
    TAISHIN_POS_BANK_Parameter: function (
      action,
      trans_type,
      trans_amount,
      host_id,
      trans_no
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          cathay_transType: null,
          eccReq: null,
          ipassReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          enum_amt: null,
          enum_hostID: null,
          enum_storeID: null,
          tcb_amt: null,
          tcb_hostID: null,
          tcb_storeID: null,
          ctcbSymlinkReq: null,
          sinopacReq: null,
          taishinPOSBank: {
            Trans_Type: trans_type || "",
            Host_ID: host_id || "03",
            Trans_Amount: trans_amount || "0",
            POS_TX_SeqNo: trans_no || "",
          },
          taishinPOSTicket: null,
          taishinTVMBank: null,
          taishinTVMTicket: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    TAISHIN_POS_TICKET_Parameter: function (
      action,
      trans_type,
      host_id,
      trans_amount,
      store_id,
      trans_no
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          cathay_transType: null,
          eccReq: null,
          ipassReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          enum_amt: null,
          enum_hostID: null,
          enum_storeID: null,
          tcb_amt: null,
          tcb_hostID: null,
          tcb_storeID: null,
          ctcbSymlinkReq: null,
          sinopacReq: null,
          taishinPOSBank: null,
          taishinPOSTicket: {
            Trans_Type: trans_type || "",
            Host_ID: host_id || "",
            Trans_Amount: trans_amount || "0",
            Store_Id: store_id || "",
            Reference_No: trans_no || "",
          },
          taishinTVMBank: null,
          taishinTVMTicket: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    TAISHIN_TVM_BANK_Parameter: function (
      action,
      trans_type,
      trans_amount,
      trans_no
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          cathay_transType: null,
          eccReq: null,
          ipassReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          enum_amt: null,
          enum_hostID: null,
          enum_storeID: null,
          tcb_amt: null,
          tcb_hostID: null,
          tcb_storeID: null,
          ctcbSymlinkReq: null,
          sinopacReq: null,
          taishinPOSBank: null,
          taishinPOSTicket: null,
          taishinTVMBank: {
            Trans_Type: trans_type || "",
            Trans_Amount: trans_amount || "0",
            POS_Unique_No: trans_no || "",
          },
          taishinTVMTicket: null,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    TAISHIN_TVM_TICKET_Parameter: function (
      action,
      trans_type,
      trans_amount,
      host_id,
      store_id
    ) {
      var DeviceCmd = {
          ctbc_amt: null,
          ctbc_store: null,
          ctbc_cardType: null,
          cathay_host: null,
          cathay_transType: null,
          eccReq: null,
          ipassReq: null,
          o2oReqQrCode: null,
          o2oReqPayment: null,
          o2oReqQuery: null,
          o2oReqFund: null,
          ncccReqNoraml: null,
          ncccReqSettle: null,
          enum_amt: null,
          enum_hostID: null,
          enum_storeID: null,
          tcb_amt: null,
          tcb_hostID: null,
          tcb_storeID: null,
          ctcbSymlinkReq: null,
          sinopacReq: null,
          taishinPOSBank: null,
          taishinPOSTicket: null,
          taishinTVMBank: null,
          taishinTVMTicket: {
            Trans_Type: trans_type || "",
            Trans_Amount: trans_amount || "0",
            Host_ID: host_id || "",
            Store_Id: store_id || "",
          },
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "FIN",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    // P1 trans_type; P2 trans_amount; P3 trans_no; uniqueID trnasaction no (length 16)
    TAISHIN_TVM_BANK_Function: function (
      success,
      fail,
      function_name,
      P1,
      P2,
      P3
    ) {
      if (function_name == "PAYMENT") {
        kiosk.API.Device.postToDeviceWithCallback(
          JSON.stringify(
            this.TAISHIN_TVM_BANK_Parameter(
              this.DeviceAction.TAISHIN_TVM_BANK_PAYMENT,
              P1,
              P2,
              P3
            )
          ),
          function (res) {
            var result = JSON.parse(res);
            if (result.IsSuccess) {
              success(result);
            } else {
              success(result);
              kiosk.API.log.logError(
                res,
                "TAISHIN_TVM_BANK_Function_payment",
                "FIN"
              );
            }
          }
        );
      } else if (function_name == "SETTLE") {
        kiosk.API.Device.postToDeviceWithCallback(
          JSON.stringify(
            this.TAISHIN_TVM_BANK_Parameter(
              this.DeviceAction.TAISHIN_TVM_BANK_SETTLE,
              P1,
              P2,
              P3
            )
          ),
          function (res) {
            var result = JSON.parse(res);
            if (result.IsSuccess) {
              success(result);
            } else {
              success(result);
              kiosk.API.log.logError(
                res,
                "TAISHIN_TVM_BANK_Function_settle",
                "FIN"
              );
            }
          }
        );
      }
    },
    // P1 trans_type; P2 trans_amount; P3 Host ID 51:ECC, 52:IPASS, STORE_ID
    TAISHIN_TVM_TICKET_Function: function (success, fail, P1, P2, P3) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.TAISHIN_TVM_TICKET_Parameter(
            this.DeviceAction.TAISHIN_TVM_TICKET,
            P1,
            P2,
            P3,
            ""
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "TAISHIN_TVM_TICKET_Function_payment",
              "FIN"
            );
          }
        }
      );
    },
    //trans_type, trans_amount, host_id
    TAISHIN_POS_BANK_Function: function (
      success,
      fail,
      function_name,
      P1,
      P2,
      P3
    ) {
      if (function_name == "PAYMENT") {
        kiosk.API.Device.postToDeviceWithCallback(
          JSON.stringify(
            this.TAISHIN_POS_BANK_Parameter(
              this.DeviceAction.TAISHIN_POS_BANK_PAYMENT,
              P1,
              P2,
              P3
            )
          ),
          function (res) {
            var result = JSON.parse(res);
            if (result.IsSuccess) {
              success(result);
            } else {
              success(result);
              kiosk.API.log.logError(
                res,
                "TAISHIN_POS_BANK_Function_payment",
                "FIN"
              );
            }
          }
        );
      } else if (function_name == "SETTLE") {
        kiosk.API.Device.postToDeviceWithCallback(
          JSON.stringify(
            this.TAISHIN_POS_BANK_Parameter(
              this.DeviceAction.TAISHIN_POS_BANK_SETTLE,
              P1,
              P2,
              P3
            )
          ),
          function (res) {
            var result = JSON.parse(res);
            if (result.IsSuccess) {
              success(result);
            } else {
              success(result);
              kiosk.API.log.logError(
                res,
                "TAISHIN_POS_BANK_Function_settle",
                "FIN"
              );
            }
          }
        );
      }
    },
    //P1: Trans_Type
    //P2: Host_ID
    //P3: Trans_Amount
    //P4: Store_Id
    //P5: Reference_No
    TAISHIN_POS_TICKET_Function: function (success, fail, P1, P2, P3, P4, P5) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.TAISHIN_POS_TICKET_Parameter(
            this.DeviceAction.TAISHIN_POS_TICKET,
            P1,
            P2,
            P3,
            P4,
            P5
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(
              res,
              "TAISHIN_POS_TICKET_Function_payment",
              "FIN"
            );
          }
        }
      );
    },
  };

  // === EPRINTER START ===
  kiosk.API.Device.EPRINTER = {
    DeviceAction: {
      printOpen: 0,
      printClose: 1,
      paperPrint: 2,
    },
    generuteParemater: function (action, printerName) {
      var DeviceCmd = {
          printerName: printerName,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "EPRINTER",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    PrinterOpen: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.printOpen)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "EPRINTER_PrinterOpen", "EPRINTER");
          }
        }
      );
    },
    PrinterClose: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.printClose)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "EPRINTER_PrinterClose", "EPRINTER");
          }
        }
      );
    },
    PaperPrint: function (success, fail, printerName) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(this.DeviceAction.paperPrint, printerName)
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "EPRINTER_PaperPrint", "EPRINTER");
          }
        }
      );
    },
  };
  // === EPRINTER E N D ===

  // === TSC247Lib ===
  kiosk.API.Device.TSC247Lib = {
    DeviceAction: {
      GoPrint: 0,
      GetStatus: 1,
    },
    generuteParemater: function (
      action,
      _templateName,
      _param,
      _width,
      _height,
      _speed,
      _deep,
      _sensorType,
      _gapHeight,
      _gapOffset
    ) {
      var DeviceCmd = {
          templateName: _templateName,
          param: _param,
          width: _width,
          height: _height,
          speed: _speed,
          deep: _deep,
          sensorType: _sensorType,
          gapHeight: _gapHeight,
          gapOffset: _gapOffset,
        },
        actionCmd = {
          Action: action,
          Parameter: JSON.stringify(DeviceCmd),
        },
        cmd = {
          DeviceName: "TSC247Lib",
          Worktype: "PostRequest",
          Paremater: JSON.stringify(actionCmd),
          ReponseModule: "UI",
        };
      return cmd;
    },
    GoPrint: function (
      success,
      fail,
      templateName,
      param,
      _width,
      _height,
      _speed,
      _deep,
      _sensorType,
      _gapHeight,
      _gapOffset
    ) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(
          this.generuteParemater(
            this.DeviceAction.GoPrint,
            templateName,
            param,
            _width,
            _height,
            _speed,
            _deep,
            _sensorType,
            _gapHeight,
            _gapOffset
          )
        ),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "HeartBeat", "StorEvergreen");
          }
        }
      );
    },
    GetStatus: function (success, fail) {
      kiosk.API.Device.postToDeviceWithCallback(
        JSON.stringify(this.generuteParemater(this.DeviceAction.GetStatus)),
        function (res) {
          var result = JSON.parse(res);
          if (result.IsSuccess) {
            success(result);
          } else {
            success(result);
            kiosk.API.log.logError(res, "ReadCard", "StorEvergreen");
          }
        }
      );
    },
  };
  // =======================
})();
